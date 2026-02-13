import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export async function POST(request: NextRequest) {
  try {
    const { action, content, title } = await request.json();

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    let prompt = "";
    
    if (action === "translate") {
      prompt = `Sen profesyonel bir müzik gazetecisisin. Aşağıdaki İngilizce müzik haberini doğal ve akıcı Türkçe'ye çevir.

Kurallar:
- Doğal ve akıcı Türkçe kullan
- Sanatçı ve şarkı isimlerini orijinal İngilizce halleriyle bırak
- Müzik terminolojisini uygun Türkçe karşılıklarıyla kullan
- Sadece çeviriyi ver, başka açıklama yapma

Başlık: ${title || ""}
İçerik: ${content}

Türkçe çeviri:`;
    } else if (action === "generate_music_news") {
      prompt = `Sen bir müzik tarihi uzmanısın. 2020-2025 yılları arasında yabancı indie/alternatif müzik dünyasında yaşanan en önemli olayları, çıkan en iyi albümleri ve yapılan unutulmaz röportajları derle.

Her haber için şunları oluştur:
1. Başlık (Türkçe, çarpıcı ve SEO uyumlu)
2. Kısa özet (2-3 cümle)
3. Detaylı içerik (400-600 kelime)
4. Kategori (Yeni Albümler / İncelemeler / Röportajlar / Konserler / Festival / Haberler)
5. Sanatçı/Band ismi
6. Yıl (2020-2025 arası)

JSON formatında yanıt ver:
[
  {
    "title": "...",
    "excerpt": "...",
    "content": "...",
    "category": "...",
    "artist": "...",
    "year": 202X,
    "imageSearch": "anahtar kelimeler görsel araması için"
  }
]

Önemli olaylardan bazıları:
- Arctic Monkeys, The National, Phoebe Bridgers, Boygenius, Taylor Swift (indie era), Radiohead, Tame Impala, Bon Iver ve benzeri sanatçıların albümleri
- Önemli festival iptalleri/dönüşleri (pandemiden sonra)
- Unutulmaz canlı performanslar
- Müzik dünyasını etkileyen önemli olaylar

Toplam 10 adet haber oluştur.`;
    } else if (action === "improve") {
      prompt = `Aşağıdaki müzik yazısını daha profesyonel, akıcı ve gazetecilik standartlarına uygun hale getir. Daha ilgi çekici başlıklar ve detaylar ekle:

${content}

İyileştirilmiş versiyon:`;
    }

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Sen profesyonel bir müzik gazetecisi ve editörsün. Yazıların yaratıcı, bilgilendirici ve SEO uyumlu olmalı."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Grok API error:", error);
      return NextResponse.json(
        { error: "Grok API request failed", details: error },
        { status: 500 }
      );
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "";

    // Parse JSON if it's a generate request
    if (action === "generate_music_news") {
      try {
        // Extract JSON from response
        const jsonMatch = result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const articles = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ articles });
        }
      } catch (e) {
        console.error("JSON parse error:", e);
      }
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Grok API error:", error);
    return NextResponse.json(
      { error: "Request failed", details: String(error) },
      { status: 500 }
    );
  }
}
