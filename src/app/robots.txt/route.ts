import { SITE_URL } from "@/lib/site";

export const revalidate = 86400;

export async function GET() {
  const base = SITE_URL.replace(/\/+$/, "");
  const body = [
    "User-agent: *",
    "Allow: /",
    `Sitemap: ${base}/sitemap.xml`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=86400",
    },
  });
}

