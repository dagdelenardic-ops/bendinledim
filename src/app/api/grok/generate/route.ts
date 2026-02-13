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
  // Palette: red / turquoise (avoid purple/pink/blue accents)
  "Yeni Albümler": "#22d3ee",
  "İncelemeler": "#ef4444",
  "Röportajlar": "#0891b2",
  "Konserler": "#fb7185",
  "Festival": "#22d3ee",
  "Haberler": "#b91c1c",
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

// Slug oluşturma fonksiyonu
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

    // Grok API'den haberleri çek
    const prompt = `Sen bir müzik tarihi uzmanısın. 2020-2025 yılları arasında yabancı indie/alternatif/rock müzik dünyasında yaşanan GERÇEK ve EN ÖNEMLİ olayları derle.

Her haber için şunları oluştur:
1. title: Başlık (Türkçe, çarpıcı, SEO uyumlu, 60-80 karakter)
2. excerpt: Kısa özet (2-3 cümle, 150-200 karakter)
3. content: Detaylı içerik (500-800 kelime, gazetecilik kalitesinde, paragraflar halinde)
4. category: Kategori (sadece şunlardan biri: "Yeni Albümler", "İncelemeler", "Röportajlar", "Konserler", "Festival", "Haberler")
5. artist: Sanatçı/Band ismi
6. year: Yıl (2020-2025 arası)
7. imageSearch: Görsel araması için 3-5 anahtar kelime (İngilizce)

JSON formatında yanıt ver, sadece array döndür:
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

Önemli gerçek olaylardan bazıları (bunları ve benzerlerini kullan):
- Arctic Monkeys'in "The Car" albümü (2022)
- Taylor Swift'in indie/folk dönüşü (folklore, evermore 2020)
- Phoebe Bridgers'in "Punisher" albümü (2020) ve Grammy adaylıkları
- Boygenius süper grubunun kuruluşu ve albümü (2023)
- The National'in son albümleri
- Tame Impala'nın sahne şovları ve albümü
- Billie Eilish'in büyümesi ve albümleri
- Lana Del Rey'in son dönem başarısı
- Olivia Rodrigo'nun patlaması
- Pandemiden sonra festival dönüşleri (Coachella, Glastonbury)
- Önemli sanatçı kayıpları ve anma etkinlikleri
- Müzik endüstrisindeki önemli değişimler

Her haber gerçek bir olayı anlatmalı. Toplam ${count} adet haber oluştur.`;

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
            content: "Sen profesyonel bir müzik gazetecisi, müzik tarihi uzmanı ve editörsün. Yazıların kesinlikle doğru, bilgilendirici, yaratıcı ve SEO uyumlu olmalı. Gerçek müzik olaylarını anlatıyorsun."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 8000,
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

    // JSON'ı parse et
    let parsedArticles: unknown[] = [];
    try {
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) parsedArticles = parsed;
      } else {
        // Alternatif parse denemesi
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
        { error: "Failed to parse Grok response", raw: result },
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
      // Kategori ID'sini bul veya oluştur
      let categoryId = categoryMap[article.category];
      if (!categoryId) {
        article.category = "Haberler";
        categoryId = "cat6";
      }

      // Kategorinin var olduğundan emin ol
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

      // Benzer başlık var mı kontrol et
      const existingArticle = await prisma.article.findFirst({
        where: {
          title: { contains: article.title.slice(0, 30) },
        },
      });

      if (existingArticle) {
        console.log(`Article already exists: ${article.title}`);
        continue;
      }

      // Slug oluştur
      let slug = slugify(article.title);
      let slugExists = await prisma.article.findUnique({ where: { slug } });
      let counter = 1;
      while (slugExists) {
        slug = `${slugify(article.title)}-${counter}`;
        slugExists = await prisma.article.findUnique({ where: { slug } });
        counter++;
      }

      // Haberi kaydet
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
          readTime: Math.ceil(article.content.length / 1000),
          featured: Math.random() > 0.7, // %30 ihtimalle öne çıkan
          editorsPick: Math.random() > 0.7, // %30 ihtimalle editör seçimi
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

// GET - Mevcut haberleri listele
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
