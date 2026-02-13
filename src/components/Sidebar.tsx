"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarItems = [
  { href: "/", icon: "home", label: "Ana Sayfa" },
  { href: "/kesfet", icon: "explore", label: "Keşfet" },
  { href: "/kategoriler", icon: "category", label: "Kategoriler" },
];

const musicLinks = [
  { href: "/etiket/yeni-albumler", icon: "album", label: "Yeni Albümler" },
  { href: "/etiket/incelemeler", icon: "reviews", label: "İncelemeler" },
  { href: "/etiket/roportajlar", icon: "mic", label: "Röportajlar" },
];

export default function Sidebar() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col bg-bg-card/50 border-r border-white/5 z-40">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 px-6 pt-6 pb-4">
        <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/30">
          <span className="material-symbols-outlined text-primary text-[24px]">
            album
          </span>
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight tracking-tight text-vintage-cream italic">
            Ben Dinledim
          </h1>
          <p className="text-[10px] text-vintage-beige/50 uppercase tracking-widest">
            Indie Müzik Blogu
          </p>
        </div>
      </Link>

      {/* Main Navigation */}
      <nav className="flex flex-col gap-1 px-3 py-4">
        <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-vintage-beige/40 mb-2">
          Menü
        </p>
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              pathname === item.href
                ? "bg-primary/15 text-primary"
                : "text-vintage-beige/60 hover:bg-white/5 hover:text-vintage-cream"
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={
                pathname === item.href
                  ? { fontVariationSettings: "'FILL' 1" }
                  : {}
              }
            >
              {item.icon}
            </span>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Music Categories */}
      <nav className="flex flex-col gap-1 px-3 py-4 border-t border-white/5">
        <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-vintage-beige/40 mb-2">
          Müzik
        </p>
        {musicLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              pathname === item.href
                ? "bg-primary/15 text-primary"
                : "text-vintage-beige/60 hover:bg-white/5 hover:text-vintage-cream"
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={
                pathname === item.href
                  ? { fontVariationSettings: "'FILL' 1" }
                  : {}
              }
            >
              {item.icon}
            </span>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom Info */}
      <div className="mt-auto px-6 pb-6">
        <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-xl p-4 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-[18px]">
              rss_feed
            </span>
            <p className="text-xs font-bold text-vintage-cream">
              RSS Beslemeleri
            </p>
          </div>
          <p className="text-[11px] text-vintage-beige/50 leading-relaxed">
            Pitchfork, NME, Stereogum ve Consequence of Sound&apos;dan en güncel
            müzik haberleri.
          </p>
        </div>
      </div>
    </aside>
  );
}
