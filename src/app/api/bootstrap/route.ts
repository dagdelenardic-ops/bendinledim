import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

const DEFAULT_CATEGORIES = [
  { name: "Haber", nameEn: "News", slug: "haber", color: "#d97706" },
  { name: "Tur", nameEn: "Tour", slug: "tur", color: "#dc2626" },
  { name: "İnceleme", nameEn: "Review", slug: "inceleme", color: "#7c3aed" },
  { name: "Röportaj", nameEn: "Interview", slug: "roportaj", color: "#059669" },
  { name: "Ekipman", nameEn: "Gear", slug: "ekipman", color: "#2563eb" },
  {
    name: "Derinlemesine",
    nameEn: "Deep Dive",
    slug: "derinlemesine",
    color: "#d946ef",
  },
];

const DEFAULT_TAGS = [
  { name: "Vinil", slug: "vinil" },
  { name: "Festival", slug: "festival" },
  { name: "Analog", slug: "analog" },
  { name: "Neo-Soul", slug: "neo-soul" },
  { name: "Stüdyo", slug: "studyo" },
  { name: "Pedalboard", slug: "pedalboard" },
  { name: "Canlı Performans", slug: "canli-performans" },
  { name: "Türkçe Müzik", slug: "turkce-muzik" },
];

async function bootstrap() {
  // Use upsert to be deterministic and safe even if tables already contain rows.
  for (const c of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, nameEn: c.nameEn, color: c.color },
      create: c,
    });
  }

  for (const t of DEFAULT_TAGS) {
    await prisma.tag.upsert({
      where: { slug: t.slug },
      update: { name: t.name },
      create: t,
    });
  }

  const [categories, tags] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return { categories, tags };
}

export async function POST() {
  try {
    const { categories, tags } = await bootstrap();
    return NextResponse.json({
      ok: true,
      categories,
      tags,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Bootstrap failed", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}

