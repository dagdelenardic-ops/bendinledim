import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const comment = await prisma.comment.create({
      data: {
        content: body.content,
        author: body.author,
        email: body.email,
        articleId: body.articleId,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create comment", details: String(error) },
      { status: 500 }
    );
  }
}
