"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const sidebarItems = [
  { href: "/", icon: "home", label: "Ana Sayfa" },
  { href: "/kesfet", icon: "explore", label: "Keşfet" },
  { href: "/kategoriler", icon: "category", label: "Kategoriler" },
];

const musicLinks = [
  { href: "/kategori/yeni-albumler", icon: "album", label: "Yeni Albümler" },
  { href: "/kategori/incelemeler", icon: "reviews", label: "İncelemeler" },
  { href: "/kategori/roportajlar", icon: "mic", label: "Röportajlar" },
];

function SideButton({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={[
        "group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all",
        "border",
        active
          ? "bg-primary/15 border-primary/30 text-vintage-cream shadow-[0_18px_40px_-26px_rgba(239,68,68,0.55)]"
          : "bg-bg-elevated/30 border-white/5 text-vintage-beige/65 hover:text-vintage-cream hover:bg-bg-elevated/55 hover:border-accent-turquoise/25",
      ].join(" ")}
    >
      <span
        className={[
          "grid place-items-center size-9 rounded-xl border transition-all",
          active
            ? "bg-primary/20 border-primary/30 text-primary"
            : "bg-bg-card/40 border-white/10 text-vintage-beige/55 group-hover:border-accent-turquoise/25 group-hover:text-accent-turquoise",
        ].join(" ")}
      >
        <span
          className="material-symbols-outlined text-[20px]"
          style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          {icon}
        </span>
      </span>

      <span className={["text-sm", active ? "font-bold" : "font-medium"].join(" ")}>
        {label}
      </span>

      <span
        className={[
          "ml-auto material-symbols-outlined text-[18px] transition-opacity",
          active ? "opacity-70" : "opacity-0 group-hover:opacity-60",
        ].join(" ")}
        aria-hidden="true"
      >
        chevron_right
      </span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col bg-bg-card/50 border-r border-white/5 z-40">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 px-6 pt-6 pb-4">
        <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-bg-elevated/60 ring-1 ring-accent-turquoise/25">
          <Image
            src="/logo-mark.png"
            alt="Ben Dinledim"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
            priority
            unoptimized
          />
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
      <nav className="flex flex-col gap-2 px-3 py-4">
        <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-vintage-beige/35 mb-1">
          Menü
        </p>
        {sidebarItems.map((item) => (
          <SideButton
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={pathname === item.href}
          />
        ))}
      </nav>

      {/* Music Categories */}
      <nav className="flex flex-col gap-2 px-3 py-4 border-t border-white/5">
        <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-vintage-beige/35 mb-1">
          Müzik
        </p>
        {musicLinks.map((item) => (
          <SideButton
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={pathname === item.href}
          />
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
