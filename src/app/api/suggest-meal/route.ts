import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const MealSuggestionSchema = z.object({
  suggestion: z.string().describe("Korte naam van de voorgestelde maaltijd of snack (max 6 woorden)"),
  reasoning: z
    .string()
    .describe("Korte uitleg in het Nederlands (1-2 zinnen) waarom dit past bij het tijdstip en de resterende macro's"),
  calories: z.number().describe("Geschatte energie in kcal voor de voorgestelde maaltijd"),
  protein: z.number().describe("Geschatte eiwitten in gram voor de voorgestelde maaltijd"),
  carbs: z.number().describe("Geschatte koolhydraten in gram voor de voorgestelde maaltijd"),
  fat: z.number().describe("Geschatte vetten in gram voor de voorgestelde maaltijd"),
});

interface Remaining {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is niet ingesteld op de server." },
      { status: 500 },
    );
  }

  let remaining: Remaining;
  let time: string;
  let loggedMeals: string[];
  try {
    const body = await request.json();
    if (
      !body?.remaining ||
      typeof body.remaining.calories !== "number" ||
      typeof body.remaining.protein !== "number" ||
      typeof body.remaining.carbs !== "number" ||
      typeof body.remaining.fat !== "number" ||
      typeof body.time !== "string"
    ) {
      return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
    }
    remaining = body.remaining;
    time = body.time;
    loggedMeals = Array.isArray(body.loggedMeals)
      ? body.loggedMeals.filter((m: unknown): m is string => typeof m === "string")
      : [];
  } catch {
    return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  const prompt = [
    `Het is nu ${time}.`,
    `Resterend voor vandaag: ${Math.round(remaining.calories)} kcal, ${Math.round(remaining.protein)}g eiwit, ${Math.round(remaining.carbs)}g koolhydraten, ${Math.round(remaining.fat)}g vet.`,
    loggedMeals.length > 0
      ? `Vandaag al gegeten: ${loggedMeals.join(", ")}.`
      : "Nog niets gegeten vandaag.",
    "Stel op basis hiervan één concrete, realistische en makkelijk te bereiden volgende maaltijd of snack voor die past bij het tijdstip en de resterende macro's.",
  ].join(" ");

  try {
    const response = await client.messages.parse({
      model: "claude-opus-4-8",
      max_tokens: 512,
      system:
        "Je bent een voedingsassistent die op basis van het tijdstip van de dag en de resterende macro's/calorieën " +
        "één concrete, haalbare suggestie doet voor de volgende maaltijd of snack, in het Nederlands. " +
        "Houd rekening met wat op dit tijdstip logisch is om te eten (ontbijt, lunch, diner, of tussendoortje). " +
        "Als de resterende macro's laag of negatief zijn, stel dan iets lichts voor of geef aan dat het doel al bijna gehaald is. " +
        "Geef altijd een concreet getal voor de macro's van je suggestie, nooit een bereik.",
      messages: [{ role: "user", content: prompt }],
      output_config: {
        format: zodOutputFormat(MealSuggestionSchema),
      },
    });

    if (response.stop_reason === "refusal" || !response.parsed_output) {
      return NextResponse.json(
        { error: "Kon geen suggestie genereren." },
        { status: 502 },
      );
    }

    return NextResponse.json(response.parsed_output);
  } catch (err) {
    console.error("Meal suggestion failed", err);
    return NextResponse.json(
      { error: "AI-suggestie is mislukt. Probeer het later opnieuw." },
      { status: 502 },
    );
  }
}
