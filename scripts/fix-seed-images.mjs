import path from "node:path";
import Database from "better-sqlite3";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isBadTitle(title) {
  const t = String(title || "").toLowerCase();
  if (!t) return true;
  if (t.includes("logo")) return true;
  if (t.includes("ticket")) return true;
  return false;
}

async function fetchCommonsThumbUrl(query) {
  const q = String(query || "").trim();
  if (!q) return null;

  const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srnamespace=6&srlimit=6&srsearch=${encodeURIComponent(
    q
  )}`;

  const searchRes = await fetch(searchUrl, {
    headers: { "User-Agent": "bendinledim/seed-fix (admin)" },
  });
  if (!searchRes.ok) return null;
  const searchData = await searchRes.json();
  const hits = searchData?.query?.search;
  if (!Array.isArray(hits) || hits.length === 0) return null;

  const pageids = hits.map((h) => h.pageid).filter(Boolean).join("|");
  if (!pageids) return null;

  const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&pageids=${pageids}&iiprop=url|mime&iiurlwidth=1400`;
  const infoRes = await fetch(infoUrl, {
    headers: { "User-Agent": "bendinledim/seed-fix (admin)" },
  });
  if (!infoRes.ok) return null;
  const infoData = await infoRes.json();

  const pages = infoData?.query?.pages;
  if (!pages || typeof pages !== "object") return null;

  for (const hit of hits) {
    const page = pages[String(hit.pageid)];
    const ii = page?.imageinfo?.[0];
    if (!ii) continue;

    const title = page?.title || hit?.title || "";
    if (isBadTitle(title)) continue;

    const mime = String(ii.mime || "");
    if (mime !== "image/jpeg" && mime !== "image/png") continue;

    const thumb = ii.thumburl || ii.url;
    if (typeof thumb === "string" && thumb.startsWith("https://")) return thumb;
  }

  return null;
}

async function main() {
  const dbPath = path.resolve(process.cwd(), "prisma/seed.db");
  const db = new Database(dbPath);
  db.pragma("journal_mode = DELETE");

  const updates = [
    { slug: "wet-leg-wet-leg-inceleme", query: "Wet Leg band" },
    {
      slug: "roportaj-phoebe-bridgers-minimalizm-maksimum-duygu",
      query: "Phoebe Bridgers",
    },
    {
      slug: "roportaj-arctic-monkeys-the-car-sonrasi-sahne-dili",
      query: "Arctic Monkeys",
    },
    {
      slug: "roportaj-olivia-rodrigo-sarki-yazimi-sahne-ozguveni",
      query: "Olivia Rodrigo",
    },
    {
      slug: "konser-notlari-kucuk-mekanlarda-indie-gecesi",
      query: "music concert crowd",
    },
    {
      slug: "festival-sezonu-surdurulebilir-sahne-uretimi-haber",
      query: "music festival crowd",
    },
    { slug: "2023-one-cikan-10-indie-albumu-liste", query: "vinyl records" },
    {
      slug: "the-national-first-two-pages-of-frankenstein-inceleme",
      query: "The National (band)",
    },
  ];

  let ok = 0;
  for (const u of updates) {
    const row = db
      .prepare("select id, title, imageUrl from Article where slug = ?")
      .get(u.slug);
    if (!row?.id) {
      console.log(`[skip] missing slug: ${u.slug}`);
      continue;
    }

    const url = await fetchCommonsThumbUrl(u.query);
    if (!url) {
      console.log(`[skip] no Commons image: ${u.slug} (q=${u.query})`);
      continue;
    }

    db.prepare("update Article set imageUrl = ? where id = ?").run(url, row.id);
    console.log(`[ok] ${u.slug}\n  -> ${url}`);
    ok++;
    await sleep(250);
  }

  console.log(`Done. Updated ${ok} article(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

