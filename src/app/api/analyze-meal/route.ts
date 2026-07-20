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

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is niet ingesteld op de server." },
      { status: 500 },
    );
  }

  let description = "";
  let image: { data: string; mediaType: string } | undefined;
  try {
    const body = await request.json();
    description = typeof body?.description === "string" ? body.description.trim() : "";
    if (body?.image && typeof body.image.data === "string" && typeof body.image.mediaType === "string") {
      image = { data: body.image.data, mediaType: body.image.mediaType };
    }
  } catch {
    return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  if (!description && !image) {
    return NextResponse.json({ error: "Beschrijving of foto ontbreekt." }, { status: 400 });
  }
  if (image && !ALLOWED_IMAGE_TYPES.has(image.mediaType)) {
    return NextResponse.json({ error: "Afbeeldingstype wordt niet ondersteund." }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  const content: Anthropic.Messages.ContentBlockParam[] = [];
  if (image) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: image.mediaType as Anthropic.Messages.Base64ImageSource["media_type"],
        data: image.data,
      },
    });
  }
  content.push({
    type: "text",
    text: description || "Schat de macro's op basis van de foto in.",
  });

  try {
    const response = await client.messages.parse({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      system:
        "Je schat de macronutriënten van een maaltijd op basis van een korte beschrijving en/of een foto, in het Nederlands. " +
        "Als er een foto is bijgevoegd, gebruik die om de inhoud en portiegrootte zo goed mogelijk in te schatten en combineer dat met de beschrijving. " +
        "Gebruik typische portiegroottes en voedingswaarden wanneer iets niet expliciet genoemd wordt. " +
        "Het is prima als de schatting niet perfect is — geef altijd een concreet getal, nooit een bereik.",
      messages: [{ role: "user", content }],
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
