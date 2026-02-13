import { NextRequest, NextResponse } from "next/server";
import {
  translateText,
  completeContent,
  improveContent,
  generateExcerpt,
} from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, text, style, targetLang } = body;

    let result: string;

    switch (action) {
      case "translate":
        result = await translateText(text, targetLang || "en");
        break;
      case "complete":
        result = await completeContent(text, style || "news");
        break;
      case "improve":
        result = await improveContent(text);
        break;
      case "excerpt":
        result = await generateExcerpt(text);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: "Gemini API error", details: String(error) },
      { status: 500 }
    );
  }
}
