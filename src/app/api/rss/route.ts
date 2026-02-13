import { NextRequest, NextResponse } from "next/server";

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  imageUrl?: string;
}

const RSS_FEEDS = [
  {
    name: "Pitchfork",
    url: "https://pitchfork.com/feed/feed-news/rss",
  },
  {
    name: "NME",
    url: "https://www.nme.com/news/music/feed",
  },
  {
    name: "Consequence of Sound",
    url: "https://consequence.net/feed/",
  },
  {
    name: "Stereogum",
    url: "https://www.stereogum.com/feed/",
  },
];

function extractTag(xml: string, tag: string): string {
  const open = `<${tag}`;
  const close = `</${tag}>`;
  const startIdx = xml.indexOf(open);
  if (startIdx === -1) return "";
  const contentStart = xml.indexOf(">", startIdx) + 1;
  const endIdx = xml.indexOf(close, contentStart);
  if (endIdx === -1) return "";
  let content = xml.slice(contentStart, endIdx).trim();
  if (content.startsWith("<![CDATA[")) {
    content = content.slice(9, content.lastIndexOf("]]>"));
  }
  return content;
}

function extractImageFromContent(content: string): string | undefined {
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/);
  if (imgMatch) return imgMatch[1];
  const mediaMatch = content.match(
    /<media:content[^>]+url=["']([^"']+)["']/
  );
  if (mediaMatch) return mediaMatch[1];
  const enclosureMatch = content.match(
    /<enclosure[^>]+url=["']([^"']+)["']/
  );
  if (enclosureMatch) return enclosureMatch[1];
  return undefined;
}

function parseRSSItems(xml: string, sourceName: string): RSSItem[] {
  const items: RSSItem[] = [];
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = extractTag(itemXml, "title")
      .replace(/<[^>]+>/g, "")
      .trim();
    const link = extractTag(itemXml, "link").replace(/<[^>]+>/g, "").trim();
    const description = extractTag(itemXml, "description")
      .replace(/<[^>]+>/g, "")
      .trim();
    const pubDate = extractTag(itemXml, "pubDate").trim();

    const imageFromContent = extractImageFromContent(itemXml);
    const mediaContent = itemXml.match(
      /<media:thumbnail[^>]+url=["']([^"']+)["']/
    );
    const imageUrl =
      imageFromContent || (mediaContent ? mediaContent[1] : undefined);

    if (title) {
      items.push({
        title,
        link,
        description: description.slice(0, 300),
        pubDate,
        source: sourceName,
        imageUrl,
      });
    }
  }

  return items;
}

async function fetchFeed(
  feed: { name: string; url: string },
  signal?: AbortSignal
): Promise<RSSItem[]> {
  try {
    const res = await fetch(feed.url, {
      signal,
      headers: {
        "User-Agent": "BenDinledim/1.0 (Music News Aggregator)",
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRSSItems(xml, feed.name);
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const feeds = source
      ? RSS_FEEDS.filter(
          (f) => f.name.toLowerCase() === source.toLowerCase()
        )
      : RSS_FEEDS;

    const results = await Promise.all(
      feeds.map((f) => fetchFeed(f, controller.signal))
    );

    const allItems = results
      .flat()
      .sort(
        (a, b) =>
          new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      );

    return NextResponse.json({
      articles: allItems,
      sources: RSS_FEEDS.map((f) => f.name),
    });
  } catch {
    return NextResponse.json(
      { error: "RSS fetch failed" },
      { status: 500 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
