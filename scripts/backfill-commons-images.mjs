import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

function parseArgs(argv) {
  const args = { db: "prisma/seed.db", limit: 0, dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--db") args.db = argv[++i];
    else if (a === "--limit") args.limit = parseInt(argv[++i] || "0", 10) || 0;
    else if (a === "--dry-run") args.dryRun = true;
    else if (a === "--help" || a === "-h") {
      console.log(
        [
          "Usage: node scripts/backfill-commons-images.mjs [--db prisma/seed.db] [--limit N] [--dry-run]",
          "",
          "Replaces stock imageUrl values with relevant Wikimedia Commons images (free-licensed).",
        ].join("\n")
      );
      process.exit(0);
    }
  }
  return args;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function extractQueryFromTitle(title) {
  const t = String(title || "").trim();
  if (!t) return "music";

  // Common patterns in Turkish titles
  const turkishPossessive = /^(.*?)(?:'in|'ın|'un|'ün|'dan|'den|'tan|'ten|'nun|'nün|'nin|'nın|’in|’ın|’un|’ün|’dan|’den|’tan|’ten)\b/i;
  const m = t.match(turkishPossessive);
  if (m && m[1]) return m[1].trim();

  // English possessive: "Arctic Monkeys' The Car"
  const engPossessive = /^(.*?)'\s+/;
  const m2 = t.match(engPossessive);
  if (m2 && m2[1]) return m2[1].trim();

  // Fallback: first chunk before ":" or "-"
  const chunk = t.split(":")[0].split("-")[0].trim();
  if (chunk.length >= 3) return chunk;

  return t;
}

function normalizeQuery(query) {
  const q = String(query || "").trim();
  if (!q) return q;
  // Handle a few known Turkish-to-English band name translations.
  if (/^Arktik Maymunlar/i.test(q)) return "Arctic Monkeys";
  if (/^Blur$/i.test(q)) return "Blur band live";
  if (/^Wednesday$/i.test(q)) return "Wednesday band";
  // If the title starts with a known artist, keep the artist name only.
  for (const artist of [
    "Taylor Swift",
    "Olivia Rodrigo",
    "Arctic Monkeys",
    "Phoebe Bridgers",
  ]) {
    if (q.toLowerCase().startsWith(artist.toLowerCase())) return artist;
  }
  if (/Boygenius/i.test(q)) return "boygenius";
  return q;
}

function isStockImage(url) {
  if (!url) return true;
  return (
    String(url).includes("images.unsplash.com") ||
    String(url).includes("placeholder.jpg")
  );
}

function isBadImage(url) {
  const u = String(url || "").toLowerCase();
  if (!u) return true;
  // We want photos, not logos/tickets/etc.
  if (u.includes("logo")) return true;
  if (u.includes("ticket")) return true;
  return false;
}

function needsReplacement(url) {
  return isStockImage(url) || isBadImage(url);
}

async function fetchCommonsThumbUrl(query) {
  const q = normalizeQuery(query);
  // Search only in File namespace (images)
  const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srnamespace=6&srlimit=5&srsearch=${encodeURIComponent(
    q
  )}`;

  const searchRes = await fetch(searchUrl, {
    headers: { "User-Agent": "bendinledim/commons-backfill (admin)" },
  });
  if (!searchRes.ok) return null;
  const searchData = await searchRes.json();

  const hits = searchData?.query?.search;
  if (!Array.isArray(hits) || hits.length === 0) return null;

  const pageids = hits.map((h) => h.pageid).filter(Boolean).join("|");
  if (!pageids) return null;

  const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&pageids=${pageids}&iiprop=url|mime&iiurlwidth=1400`;
  const infoRes = await fetch(infoUrl, {
    headers: { "User-Agent": "bendinledim/commons-backfill (admin)" },
  });
  if (!infoRes.ok) return null;
  const infoData = await infoRes.json();

  const pages = infoData?.query?.pages;
  if (!pages || typeof pages !== "object") return null;

  // Prefer jpg/png; avoid svg and huge/odd formats.
  for (const hit of hits) {
    const page = pages[String(hit.pageid)];
    const ii = page?.imageinfo?.[0];
    if (!ii) continue;
    const title = String(page?.title || "").toLowerCase();
    if (title.includes("logo")) continue;
    if (title.includes("ticket")) continue;
    const mime = String(ii.mime || "");
    if (mime !== "image/jpeg" && mime !== "image/png") continue;
    const thumb = ii.thumburl || ii.url;
    if (typeof thumb === "string" && thumb.startsWith("https://")) return thumb;
  }

  return null;
}

async function main() {
  const args = parseArgs(process.argv);
  const dbPath = path.resolve(process.cwd(), args.db);

  if (!fs.existsSync(dbPath)) {
    console.error(`DB not found: ${dbPath}`);
    process.exit(1);
  }

  const db = new Database(dbPath);
  // Keep DB as a single file so we don't leave -wal/-shm artifacts around.
  db.pragma("journal_mode = DELETE");

  const rows = db
    .prepare(
      "select id, title, imageUrl, categoryId from Article order by createdAt desc"
    )
    .all();

  let updated = 0;
  for (const row of rows) {
    if (args.limit && updated >= args.limit) break;

    // Keep already-custom images.
    if (!needsReplacement(row.imageUrl)) continue;

    let query = extractQueryFromTitle(row.title);
    if (row.categoryId === "cat5") query = "music festival crowd";

    const thumbUrl = await fetchCommonsThumbUrl(query);
    if (!thumbUrl) {
      console.log(`[skip] ${row.title} (no Commons image for: ${query})`);
      continue;
    }

    console.log(
      `${args.dryRun ? "[dry]" : "[ok] "} ${row.title}\n  ${row.imageUrl}\n  -> ${thumbUrl}`
    );

    if (!args.dryRun) {
      db.prepare("update Article set imageUrl = ? where id = ?").run(
        thumbUrl,
        row.id
      );
      updated++;
      // Be nice to the API.
      await sleep(300);
    }
  }

  console.log(`Done. Updated ${updated} article(s) in ${args.db}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
