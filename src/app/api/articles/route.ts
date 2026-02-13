import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { slugify } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const tag = searchParams.get("tag");
  const search = searchParams.get("search");
  const featured = searchParams.get("featured");
  const editorsPick = searchParams.get("editorsPick");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const all = searchParams.get("all");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (all !== "true") where.published = true;

  if (category) where.category = { slug: category };
  if (tag) where.tags = { some: { tag: { slug: tag } } };
  if (featured === "true") where.featured = true;
  if (editorsPick === "true") where.editorsPick = true;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
      { excerpt: { contains: search } },
    ];
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: { category: true, tags: { include: { tag: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.article.count({ where }),
  ]);

  return NextResponse.json({
    articles,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slug = slugify(body.title);

    const article = await prisma.article.create({
      data: {
        title: body.title,
        slug,
        content: body.content,
        excerpt: body.excerpt || "",
        imageUrl: body.imageUrl,
        author: body.author || "Editör Ekibi",
        readTime: body.readTime || 5,
        featured: body.featured || false,
        editorsPick: body.editorsPick || false,
        published: body.published || false,
        categoryId: body.categoryId,
        tags: body.tagIds
          ? { create: body.tagIds.map((tagId: string) => ({ tagId })) }
          : undefined,
      },
      include: { category: true, tags: { include: { tag: true } } },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create article", details: String(error) },
      { status: 500 }
    );
  }
}
