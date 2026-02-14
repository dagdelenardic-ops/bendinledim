import { prisma } from "@/lib/db";
import { absUrl, SITE_URL } from "@/lib/site";

export const revalidate = 600;

function esc(s: string) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function cdata(s: string) {
  // Prevent breaking out of CDATA.
  return String(s || "").replaceAll("]]>", "]]&gt;");
}

export async function GET() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const lastBuild = (articles[0]?.updatedAt || new Date()).toUTCString();

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0">\n` +
    `  <channel>\n` +
    `    <title>${esc("Ben Dinledim")}</title>\n` +
    `    <link>${esc(SITE_URL)}</link>\n` +
    `    <description>${esc(
      "Yabancı indie müzik dünyasından en güncel haberler, albüm incelemeleri ve röportajlar."
    )}</description>\n` +
    `    <language>tr</language>\n` +
    `    <lastBuildDate>${esc(lastBuild)}</lastBuildDate>\n` +
    articles
      .map((a) => {
        const link = absUrl(`/haber/${a.slug}`);
        return (
          `    <item>\n` +
          `      <title><![CDATA[${cdata(a.title)}]]></title>\n` +
          `      <link>${esc(link)}</link>\n` +
          `      <guid isPermaLink="true">${esc(link)}</guid>\n` +
          `      <pubDate>${esc(a.createdAt.toUTCString())}</pubDate>\n` +
          `      <description><![CDATA[${cdata(a.excerpt || "")}]]></description>\n` +
          `      <category><![CDATA[${cdata(a.category.name)}]]></category>\n` +
          (a.imageUrl
            ? `      <enclosure url="${esc(
                a.imageUrl
              )}" type="image/jpeg" />\n`
            : "") +
          `    </item>\n`
        );
      })
      .join("") +
    `  </channel>\n` +
    `</rss>\n`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=600",
    },
  });
}

