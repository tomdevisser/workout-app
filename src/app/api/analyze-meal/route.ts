import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const MealAnalysisSchema = z.object({
  title: z.string().describe("Korte, natuurlijke titel voor de maaltijd (max 6 woorden)"),
  calories: z.number().describe("Geschatte energie in kcal voor de hele maaltijd"),
  protein: z.number().describe("Geschatte eiwitten in gram voor de hele maaltijd"),
  carbs: z.number().describe("Geschatte koolhydraten in gram voor de hele maaltijd"),
  fat: z.number().describe("Geschatte vetten in gram voor de hele maaltijd"),
});

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is niet ingesteld op de server." },
      { status: 500 },
    );
  }

  let description = "";
  try {
    const body = await request.json();
    description = typeof body?.description === "string" ? body.description.trim() : "";
  } catch {
    return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  if (!description) {
    return NextResponse.json({ error: "Beschrijving ontbreekt." }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.parse({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      system:
        "Je schat de macronutriënten van een maaltijd op basis van een korte beschrijving in het Nederlands. " +
        "Gebruik typische portiegroottes en voedingswaarden wanneer die niet expliciet genoemd worden. " +
        "Het is prima als de schatting niet perfect is — geef altijd een concreet getal, nooit een bereik.",
      messages: [{ role: "user", content: description }],
      output_config: {
        format: zodOutputFormat(MealAnalysisSchema),
      },
    });

    if (response.stop_reason === "refusal" || !response.parsed_output) {
      return NextResponse.json(
        { error: "Kon geen schatting genereren voor deze beschrijving." },
        { status: 502 },
      );
    }

    return NextResponse.json(response.parsed_output);
  } catch (err) {
    console.error("Meal analysis failed", err);
    return NextResponse.json(
      { error: "AI-analyse is mislukt. Probeer het opnieuw of vul handmatig in." },
      { status: 502 },
    );
  }
}
