import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { articles: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(tags);
}
