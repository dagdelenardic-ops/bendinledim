import { prisma } from "@/lib/db";
import { absUrl, SITE_URL } from "@/lib/site";

export const revalidate = 3600;

function esc(s: string) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const [categories, articles] = await Promise.all([
    prisma.category.findMany({ orderBy: { slug: "asc" } }),
    prisma.article.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const base = SITE_URL.replace(/\/+$/, "");
  const urls: { loc: string; lastmod?: string }[] = [
    { loc: base },
    { loc: absUrl("/kesfet") },
    { loc: absUrl("/kategoriler") },
  ];

  for (const c of categories) {
    urls.push({ loc: absUrl(`/kategori/${c.slug}`) });
  }

  for (const a of articles) {
    urls.push({
      loc: absUrl(`/haber/${a.slug}`),
      lastmod: a.updatedAt.toISOString(),
    });
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url>\n` +
          `    <loc>${esc(u.loc)}</loc>\n` +
          (u.lastmod ? `    <lastmod>${esc(u.lastmod)}</lastmod>\n` : "") +
          `  </url>\n`
      )
      .join("") +
    `</urlset>\n`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}

