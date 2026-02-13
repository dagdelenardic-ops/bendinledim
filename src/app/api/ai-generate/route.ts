import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { pickArticleImageUrl } from "@/lib/commonsImages";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

const categoryMap: Record<string, string> = {
  "Yeni Albümler": "cat1",
  "İncelemeler": "cat2",
  "Röportajlar": "cat3",
  "Konserler": "cat4",
  "Festival": "cat5",
  "Haberler": "cat6",
};

const categoryColors: Record<string, string> = {
  "Yeni Albümler": "#8b5cf6",
  "İncelemeler": "#ec4899",
  "Röportajlar": "#3b82f6",
  "Konserler": "#22c55e",
  "Festival": "#f59e0b",
  "Haberler": "#d97706",
};

interface AIGeneratedArticle {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  artist?: string;
  year?: number;
  imageSearch?: string;
}

function isAIGeneratedArticle(value: unknown): value is AIGeneratedArticle {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.title === "string" &&
    typeof record.excerpt === "string" &&
    typeof record.content === "string" &&
    typeof record.category === "string"
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const { count = 5 } = await request.json();

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const prompt = `Sen bir müzik tarihi uzmanı ve gazetecisisin. 2020-2025 yılları arasında yabancı indie/alternatif/rock müzik dünyasında yaşanan GERÇEK ve EN ÖNEMLİ olayları derle.

Her haber için şunları oluştur (TÜMÜ TÜRKÇE):
1. title: Başlık (60-90 karakter, TÜRKÇE)
2. excerpt: Kısa özet (2-3 cümle, TÜRKÇE)
3. content: Detaylı içerik (400-600 kelime, gazetecilik kalitesinde, TÜRKÇE)
4. category: Kategori ("Yeni Albümler", "İncelemeler", "Röportajlar", "Konserler", "Festival", veya "Haberler")
5. artist: Sanatçı/Band ismi (orijinal İngilizce)
6. year: Yıl (2020-2025)
7. imageSearch: Görsel arama kelimeleri (İngilizce)

MUTLAKA JSON formatında yanıt ver, sadece array döndür:
[
  {
    "title": "...",
    "excerpt": "...",
    "content": "...",
    "category": "...",
    "artist": "...",
    "year": 202X,
    "imageSearch": "..."
  }
]

Gerçek ve önemli olaylardan bazıları (bunları ve benzerlerini kullan):
- Arctic Monkeys'in "The Car" albümü (2022)
- Taylor Swift'in indie/folk dönüşü - folklore ve evermore (2020)
- Phoebe Bridgers'in "Punisher" albümü (2020)
- Boygenius süper grubunun kuruluşu ve albümü (2023)
- The National'in son albümleri
- Tame Impala "The Slow Rush" (2020)
- Billie Eilish'in büyümesi ve "Happier Than Ever" (2021)
- Olivia Rodrigo'nun "SOUR" patlaması (2021)
- Pandemiden sonra festival dönüşleri (2022-2023)
- Fontaines D.C., Black Country New Road, Wet Leg gibi yeni nesil indie rock grupları
- Lana Del Rey'in son dönem başarısı - "Norman Fucking Rockwell" ve sonrası
- Fleet Foxes, Bon Iver gibi folk sanatçılarının yeni işleri

Her haber gerçek bir olayı anlatmalı ve TÜRKÇE olmalı. Toplam ${count} adet haber oluştur.`;

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "Sen profesyonel bir müzik gazetecisi ve müzik tarihi uzmanısın. Yazıların kesinlikle doğru, bilgilendirici, yaratıcı ve SEO uyumlu olmalı. Gerçek müzik olaylarını anlatıyorsun."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      return NextResponse.json(
        { error: "OpenAI API request failed", details: error },
        { status: 500 }
      );
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "";

    // JSON'ı parse et
    let parsedArticles: unknown[] = [];
    try {
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) parsedArticles = parsed;
      } else {
        const startIdx = result.indexOf("[");
        const endIdx = result.lastIndexOf("]");
        if (startIdx !== -1 && endIdx !== -1) {
          const parsed = JSON.parse(result.slice(startIdx, endIdx + 1));
          if (Array.isArray(parsed)) parsedArticles = parsed;
        }
      }
    } catch (e) {
      console.error("JSON parse error:", e, "\nResult:", result);
      return NextResponse.json(
        { error: "Failed to parse AI response", raw: result },
        { status: 500 }
      );
    }

    const articles = parsedArticles.filter(isAIGeneratedArticle);

    if (articles.length === 0) {
      return NextResponse.json(
        { error: "No articles generated" },
        { status: 500 }
      );
    }

    // Kategorileri kontrol et/oluştur ve haberleri kaydet
    const savedArticles = [];
    
    for (const article of articles) {
      let categoryId = categoryMap[article.category];
      if (!categoryId) {
        article.category = "Haberler";
        categoryId = "cat6";
      }

      const existingCategory = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!existingCategory) {
        await prisma.category.create({
          data: {
            id: categoryId,
            name: article.category,
            slug: slugify(article.category),
            color: categoryColors[article.category] || "#d97706",
          },
        });
      }

      const existingArticle = await prisma.article.findFirst({
        where: {
          title: { contains: article.title.slice(0, 30) },
        },
      });

      if (existingArticle) {
        console.log(`Article already exists: ${article.title}`);
        continue;
      }

      let slug = slugify(article.title);
      let slugExists = await prisma.article.findUnique({ where: { slug } });
      let counter = 1;
      while (slugExists) {
        slug = `${slugify(article.title)}-${counter}`;
        slugExists = await prisma.article.findUnique({ where: { slug } });
        counter++;
      }

      // İçerikte geçen konuya uygun (stok olmayan) görsel seç.
      const imageUrl =
        (await pickArticleImageUrl({
          title: article.title,
          category: article.category,
          artist: article.artist,
          imageSearch: article.imageSearch,
        })) || undefined;

      const saved = await prisma.article.create({
        data: {
          title: article.title,
          slug: slug,
          content: article.content,
          excerpt: article.excerpt,
          imageUrl: imageUrl,
          author: "Editör Ekibi",
          readTime: Math.ceil(article.content.length / 1000) || 5,
          featured: Math.random() > 0.7,
          editorsPick: Math.random() > 0.7,
          published: true,
          categoryId: categoryId,
        },
      });

      savedArticles.push(saved);
    }

    return NextResponse.json({
      success: true,
      count: savedArticles.length,
      articles: savedArticles,
    });

  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Generation failed", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { category: true },
    });
    
    return NextResponse.json({ articles });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
