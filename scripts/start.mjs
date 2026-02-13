import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawn } from "node:child_process";

function isFileDatasource(url) {
  return typeof url === "string" && url.startsWith("file:");
}

function filePathFromDatasourceUrl(url) {
  // Accept both:
  // - file:/tmp/dev.db (absolute)
  // - file:./dev.db (relative)
  const raw = url.slice("file:".length);
  const stripped = raw.startsWith("//") ? raw.slice(2) : raw;
  return path.isAbsolute(stripped) ? stripped : path.resolve(process.cwd(), stripped);
}

function touchFile(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.closeSync(fs.openSync(filePath, "a"));
}

function binPath(name) {
  const bin = process.platform === "win32" ? `${name}.cmd` : name;
  return path.join(process.cwd(), "node_modules", ".bin", bin);
}

function runMigrations() {
  const prismaBin = binPath("prisma");
  execFileSync(prismaBin, ["migrate", "deploy"], {
    stdio: "inherit",
    env: process.env,
  });
}

function startNext() {
  const nextBin = binPath("next");
  const port = process.env.PORT || "8080";

  const child = spawn(nextBin, ["start", "-H", "0.0.0.0", "-p", port], {
    stdio: "inherit",
    env: process.env,
  });

  child.on("exit", (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    process.exit(code ?? 0);
  });
}

function main() {
  const isProd = process.env.NODE_ENV === "production";

  const defaultDbUrl = isProd ? "file:/tmp/dev.db" : "file:./dev.db";
  const dbUrl = process.env.DATABASE_URL || defaultDbUrl;
  process.env.DATABASE_URL = dbUrl;

  if (isFileDatasource(dbUrl)) {
    const dbPath = filePathFromDatasourceUrl(dbUrl);
    touchFile(dbPath);
  }

  if (isProd) {
    runMigrations();
  }

  startNext();
}

main();

