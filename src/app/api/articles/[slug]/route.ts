import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: { include: { tag: true } },
      comments: {
        where: { approved: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  return NextResponse.json(article);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json();

  try {
    if (body.tagIds) {
      const article = await prisma.article.findUnique({ where: { slug } });
      if (article) {
        await prisma.tagOnArticle.deleteMany({
          where: { articleId: article.id },
        });
      }
    }

    const article = await prisma.article.update({
      where: { slug },
      data: {
        title: body.title,
        content: body.content,
        excerpt: body.excerpt,
        imageUrl: body.imageUrl,
        author: body.author,
        readTime: body.readTime,
        featured: body.featured,
        editorsPick: body.editorsPick,
        published: body.published,
        categoryId: body.categoryId,
        titleEn: body.titleEn,
        contentEn: body.contentEn,
        excerptEn: body.excerptEn,
        tags: body.tagIds
          ? { create: body.tagIds.map((tagId: string) => ({ tagId })) }
          : undefined,
      },
      include: { category: true, tags: { include: { tag: true } } },
    });

    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update", details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  await prisma.article.delete({ where: { slug } });
  return NextResponse.json({ message: "Deleted" });
}
