export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "https://bendinledim.com.tr";

export function absUrl(pathname: string) {
  const base = SITE_URL.replace(/\/+$/, "");
  const path = String(pathname || "").startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}`;
}

