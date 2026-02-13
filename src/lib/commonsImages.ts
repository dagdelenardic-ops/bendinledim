type CommonsSearchHit = {
  pageid?: number;
  title?: string;
};

type CommonsImageInfo = {
  url?: string;
  thumburl?: string;
  mime?: string;
};

const COMMONS_API = "https://commons.wikimedia.org/w/api.php";

function normalizeQuery(query: string) {
  const q = String(query || "").trim();
  if (!q) return q;

  // Handle a few common Turkish-to-English translations / variations.
  if (/^Arktik Maymunlar/i.test(q)) return "Arctic Monkeys";

  // If the query starts with a known artist, keep the artist name only.
  for (const artist of [
    "Taylor Swift",
    "Olivia Rodrigo",
    "Arctic Monkeys",
    "Phoebe Bridgers",
    "Billie Eilish",
  ]) {
    if (q.toLowerCase().startsWith(artist.toLowerCase())) return artist;
  }

  if (/Boygenius/i.test(q)) return "boygenius";
  return q;
}

export function extractQueryFromTitle(title: string) {
  const t = String(title || "").trim();
  if (!t) return "music";

  // Common patterns in Turkish titles: "X'in ..." / "X'un ..." etc.
  const turkishPossessive =
    /^(.*?)(?:'in|'ın|'un|'ün|'dan|'den|'tan|'ten|'nun|'nün|'nin|'nın|’in|’ın|’un|’ün|’dan|’den|’tan|’ten)\b/i;
  const m = t.match(turkishPossessive);
  if (m?.[1]) return m[1].trim();

  // English possessive: "Arctic Monkeys' The Car"
  const engPossessive = /^(.*?)'\s+/;
  const m2 = t.match(engPossessive);
  if (m2?.[1]) return m2[1].trim();

  // Fallback: first chunk before ":" or "-"
  const chunk = t.split(":")[0]?.split("-")[0]?.trim();
  if (chunk && chunk.length >= 3) return chunk;

  return t;
}

function isBadCommonsTitle(title: string) {
  const t = String(title || "").toLowerCase();
  if (!t) return true;
  // Prefer photos over logos/tickets/etc.
  if (t.includes("logo")) return true;
  if (t.includes("ticket")) return true;
  return false;
}

function clampQuery(q: string) {
  const s = String(q || "").replace(/\s+/g, " ").trim();
  if (!s) return s;
  return s.length > 120 ? s.slice(0, 120) : s;
}

function toUrl(params: Record<string, string | number | undefined>) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    usp.set(k, String(v));
  });
  return `${COMMONS_API}?${usp.toString()}`;
}

async function commonsSearch(query: string, limit = 6): Promise<CommonsSearchHit[]> {
  const url = toUrl({
    action: "query",
    format: "json",
    list: "search",
    srnamespace: 6, // File namespace
    srlimit: limit,
    srsearch: clampQuery(normalizeQuery(query)),
    origin: "*",
  });

  const res = await fetch(url, {
    headers: { "User-Agent": "bendinledim/commons-image (server)" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return [];
  const data = (await res.json()) as any;
  const hits = data?.query?.search;
  if (!Array.isArray(hits)) return [];
  return hits as CommonsSearchHit[];
}

async function commonsImageInfo(
  pageIds: number[],
  width = 1400
): Promise<Record<string, { title?: string; imageinfo?: CommonsImageInfo[] }>> {
  if (!pageIds.length) return {};
  const url = toUrl({
    action: "query",
    format: "json",
    prop: "imageinfo",
    pageids: pageIds.join("|"),
    iiprop: "url|mime",
    iiurlwidth: width,
    origin: "*",
  });

  const res = await fetch(url, {
    headers: { "User-Agent": "bendinledim/commons-image (server)" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return {};
  const data = (await res.json()) as any;
  return (data?.query?.pages || {}) as Record<
    string,
    { title?: string; imageinfo?: CommonsImageInfo[] }
  >;
}

export async function fetchCommonsImageUrl(query: string) {
  const hits = await commonsSearch(query, 8);
  if (!hits.length) return null;

  const pageIds = hits
    .map((h) => h.pageid)
    .filter((id): id is number => typeof id === "number" && Number.isFinite(id));
  if (!pageIds.length) return null;

  const pages = await commonsImageInfo(pageIds, 1400);

  // Respect the search order (most relevant first).
  for (const hit of hits) {
    const pageId = hit.pageid;
    if (!pageId) continue;
    const page = pages[String(pageId)];
    const ii = page?.imageinfo?.[0];
    if (!ii) continue;
    if (isBadCommonsTitle(page?.title || hit.title || "")) continue;

    const mime = String(ii.mime || "");
    if (mime !== "image/jpeg" && mime !== "image/png") continue;

    const url = ii.thumburl || ii.url;
    if (typeof url === "string" && url.startsWith("https://")) return url;
  }

  return null;
}

export async function pickArticleImageUrl(input: {
  title?: string;
  category?: string;
  artist?: string;
  imageSearch?: string;
}) {
  const category = String(input.category || "").trim();

  // Festival/konser içerikleri için doğrudan kalabalık fotoğrafı daha güvenilir.
  const festivalLike = /festival|konser/i.test(category);
  const candidates: string[] = [];
  if (festivalLike) candidates.push("music festival crowd");

  if (input.imageSearch) candidates.push(input.imageSearch);
  if (input.artist) candidates.push(input.artist);
  if (input.title) candidates.push(extractQueryFromTitle(input.title));
  if (category) candidates.push(category);
  candidates.push("music");

  for (const c of candidates) {
    const q = String(c || "").trim();
    if (!q) continue;
    const url = await fetchCommonsImageUrl(q);
    if (url) return url;
  }

  return null;
}

