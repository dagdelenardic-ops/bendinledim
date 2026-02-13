"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: "home", label: "Ana Sayfa", iconFilled: "home" },
  { href: "/kesfet", icon: "explore", label: "Keşfet", iconFilled: "explore" },
  { href: "/kategoriler", icon: "category", label: "Kategoriler", iconFilled: "category" },
];

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Gradient fade effect */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-bg-dark via-bg-dark/95 to-transparent pointer-events-none -z-10" />
      
      {/* Navigation bar */}
      <div className="mx-4 mb-4">
        <div className="glass-nav rounded-2xl border border-white/10 shadow-2xl">
          <div className="flex items-center justify-around h-16">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl transition-all ${
                    isActive
                      ? "text-primary"
                      : "text-vintage-beige/50 hover:text-vintage-beige"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[24px]"
                    style={
                      isActive
                        ? { fontVariationSettings: "'FILL' 1" }
                        : {}
                    }
                  >
                    {isActive ? item.iconFilled : item.icon}
                  </span>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
