import { prisma } from "@/lib/db";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

export const metadata = {
  title: "Kategoriler | Ben Dinledim",
  description:
    "Müzik haberleri kategorileri. Albüm incelemeleri, röportajlar, konser haberleri ve daha fazlası.",
};

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { articles: true } } },
    orderBy: { name: "asc" },
  });

  const categoryIcons: Record<string, string> = {
    "Yeni Albümler": "album",
    "İncelemeler": "reviews",
    "Röportajlar": "mic",
    "Konserler": "event",
    "Festival": "festival",
    "Liste": "format_list_numbered",
    "Haberler": "newspaper",
    "Podcast": "podcasts",
  };

  return (
    <div className="relative min-h-screen pb-24 lg:pb-0">
      <Sidebar />
      <div className="lg:ml-64">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-[28px]">
                category
              </span>
              <h1 className="text-3xl font-bold text-vintage-cream">
                Kategoriler
              </h1>
            </div>
            <p className="text-vintage-beige/60 max-w-xl">
              İlgi alanınıza göre müzik içeriklerini keşfedin.
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category, index) => {
              const icon =
                categoryIcons[category.name] || "music_note";
              return (
                <Link
                  key={category.id}
                  href={`/kategori/${category.slug}`}
                  className="group block animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="relative overflow-hidden rounded-xl bg-bg-card border border-white/5 p-6 card-hover">
                    {/* Background Glow */}
                    <div
                      className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20 -mr-8 -mt-8 transition-opacity group-hover:opacity-30"
                      style={{ backgroundColor: category.color }}
                    />

                    <div className="relative">
                      {/* Icon */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                        style={{
                          backgroundColor: `${category.color}15`,
                        }}
                      >
                        <span
                          className="material-symbols-outlined text-[24px]"
                          style={{ color: category.color }}
                        >
                          {icon}
                        </span>
                      </div>

                      {/* Content */}
                      <h3 className="text-lg font-bold text-vintage-cream group-hover:text-primary transition-colors mb-1">
                        {category.name}
                      </h3>
                      <p className="text-sm text-vintage-beige/50">
                        {category._count.articles} yazı
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-vintage-beige/30">
                        arrow_forward
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Empty State */}
          {categories.length === 0 && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-6xl text-vintage-beige/20 mb-4 block">
                category
              </span>
              <h3 className="text-xl font-bold text-vintage-cream mb-2">
                Henüz kategori yok
              </h3>
              <p className="text-vintage-beige/60">
                Kategoriler yakında eklenecek.
              </p>
            </div>
          )}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
