import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const CATEGORY_SLUGS = [
  "haber",
  "tur",
  "inceleme",
  "roportaj",
  "ekipman",
  "derinlemesine",
] as const;

type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const prompt = String((body as { prompt?: unknown }).prompt || "").trim();

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.7,
        max_tokens: 1800,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "music_article",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                title: { type: "string", minLength: 15, maxLength: 120 },
                excerpt: { type: "string", minLength: 40, maxLength: 220 },
                content: { type: "string", minLength: 800 },
                categorySlug: {
                  type: "string",
                  enum: CATEGORY_SLUGS,
                },
                tags: {
                  type: "array",
                  maxItems: 8,
                  items: { type: "string", minLength: 2, maxLength: 40 },
                },
              },
              required: ["title", "excerpt", "content", "categorySlug", "tags"],
            },
          },
        },
        messages: [
          {
            role: "system",
            content:
              "Sen profesyonel bir muzik gazetecisi ve editorusun. Turkce yaz. Sadece istenen JSON'u dondur.",
          },
          {
            role: "user",
            content: [
              "Asagidaki prompt'a gore tek bir muzik haberi/icerigi olustur.",
              "",
              "Kurallar:",
              "- Turkce yaz.",
              "- Baslik SEO uyumlu, akici ve abartisiz olsun.",
              "- Icerik paragraflara ayrilsin, okuması kolay olsun.",
              "- categorySlug su degerlerden biri olmali: haber, tur, inceleme, roportaj, ekipman, derinlemesine.",
              "- tags alanina 0-8 arasi etiket ekle (kisa kelimeler).",
              "",
              `PROMPT: ${prompt}`,
            ].join("\n"),
          },
        ],
      }),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      return NextResponse.json(
        { error: "OpenAI API request failed", details },
        { status: 500 }
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "Empty OpenAI response" },
        { status: 500 }
      );
    }

    let article: {
      title: string;
      excerpt: string;
      content: string;
      categorySlug: CategorySlug;
      tags: string[];
    };
    try {
      article = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse OpenAI JSON", raw: content },
        { status: 500 }
      );
    }

    return NextResponse.json({ article });
  } catch (error) {
    return NextResponse.json(
      { error: "Request failed", details: String(error) },
      { status: 500 }
    );
  }
}

