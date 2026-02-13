import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(request: NextRequest) {
  try {
    const { title, description } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const prompt = `Sen profesyonel bir müzik gazetecisisin. Aşağıdaki İngilizce müzik haberini Türkçe'ye çevir.

Kurallar:
- Doğal ve akıcı Türkçe kullan
- Sanatçı ve şarkı isimlerini orijinal İngilizce halleriyle bırak
- Müzik terminolojisini uygun Türkçe karşılıklarıyla kullan
- Sadece JSON formatında yanıt ver, başka hiçbir şey yazma

Başlık: ${title}
${description ? `İçerik: ${description}` : ""}

JSON formatında yanıt ver:
{"title": "çevrilmiş başlık", "description": "çevrilmiş içerik"}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Translation format error" },
        { status: 500 }
      );
    }

    const translated = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      title: translated.title || title,
      description: translated.description || description || "",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Translation failed", details: String(error) },
      { status: 500 }
    );
  }
}
