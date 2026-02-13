"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 glass-nav">
      <div className="flex items-center p-4 justify-between max-w-6xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/30 group-hover:ring-primary/50 transition-all">
            <Image
              src="/logo.png"
              alt="Ben Dinledim"
              width={40}
              height={40}
              className="h-9 w-9 object-contain"
              priority
            />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-vintage-cream italic group-hover:text-primary transition-colors">
              Ben Dinledim
            </h1>
            <p className="text-[10px] text-vintage-beige/50 uppercase tracking-widest">
              Indie Müzik Blogu
            </p>
          </div>
        </Link>

        {/* Mobile Logo Text Only */}
        <h1 className="text-lg font-bold leading-tight tracking-tight text-vintage-cream italic sm:hidden">
          Ben Dinledim
        </h1>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center gap-1 mr-4">
            {[
              { href: "/", label: "Ana Sayfa" },
              { href: "/kesfet", label: "Keşfet" },
              { href: "/kategoriler", label: "Kategoriler" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === item.href
                    ? "text-primary bg-primary/10"
                    : "text-vintage-beige/60 hover:text-vintage-cream hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          {searchOpen ? (
            <form
              action="/arama"
              className="flex items-center gap-2 animate-fade-in"
            >
              <div className="relative">
                <input
                  type="text"
                  name="q"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Haber, albüm veya sanatçı ara..."
                  autoFocus
                  className="bg-bg-elevated border border-primary/20 rounded-full pl-10 pr-4 py-2.5 text-sm text-vintage-cream placeholder:text-vintage-beige/40 focus:outline-none focus:ring-2 focus:ring-primary/40 w-64"
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-vintage-beige/40 text-[18px]">
                  search
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-vintage-beige/60 hover:text-vintage-cream p-2"
              >
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center justify-center rounded-full h-10 w-10 bg-white/5 hover:bg-primary/20 transition-all text-vintage-beige hover:text-primary"
              aria-label="Ara"
            >
              <span className="material-symbols-outlined text-[22px]">
                search
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
