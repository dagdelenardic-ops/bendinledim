import { prisma } from "@/lib/db";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import Image from "next/image";
import { timeAgo } from "@/lib/utils";

export const metadata = {
  title: "Keşfet | Ben Dinledim",
  description:
    "Tüm müzik haberleri, albüm incelemeleri ve röportajlar. Yabancı indie müzik dünyasından en güncel içerikler.",
};

export default async function ExplorePage() {
  const [articles, categories] = await Promise.all([
    prisma.article.findMany({
      where: { published: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      include: { _count: { select: { articles: true } } },
    }),
  ]);

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
                explore
              </span>
              <h1 className="text-3xl font-bold text-vintage-cream">Keşfet</h1>
            </div>
            <p className="text-vintage-beige/60 max-w-xl">
              Yabancı indie müzik dünyasından tüm haberler, incelemeler ve
              röportajlar.
            </p>
          </div>

          {/* Categories */}
          <section className="mb-8">
            <h2 className="text-sm font-bold text-vintage-beige/50 uppercase tracking-widest mb-4">
              Kategoriler
            </h2>
            <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2">
              <Link
                href="/kesfet"
                className="flex-none px-5 py-2.5 rounded-full bg-primary text-bg-dark font-semibold text-sm whitespace-nowrap transition-all primary-shadow"
              >
                Tümü ({articles.length})
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/kategori/${cat.slug}`}
                  className="flex-none px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 text-sm font-medium text-vintage-beige hover:text-primary transition-all whitespace-nowrap"
                  style={{ borderColor: `${cat.color}20` }}
                >
                  <span style={{ color: cat.color }}>{cat.name}</span>
                  <span className="text-vintage-beige/40 ml-1.5">
                    ({cat._count.articles})
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Articles Grid */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-vintage-cream">
                Tüm İçerikler
              </h2>
              <span className="text-sm text-vintage-beige/50">
                {articles.length} yazı
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, index) => (
                <Link
                  key={article.id}
                  href={`/haber/${article.slug}`}
                  className="group block animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <article className="relative overflow-hidden rounded-xl bg-bg-card border border-white/5 card-hover h-full flex flex-col">
                    {/* Image */}
                    <div className="relative aspect-video image-zoom">
                      <Image
                        src={article.imageUrl || "/placeholder.jpg"}
                        alt={article.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className="badge text-bg-dark text-[9px]"
                          style={{ backgroundColor: article.category.color }}
                        >
                          {article.category.name}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-base leading-snug line-clamp-2 text-vintage-cream group-hover:text-primary transition-colors mb-2">
                        {article.title}
                      </h3>

                      {article.excerpt && (
                        <p className="text-vintage-beige/60 text-sm line-clamp-2 mb-3 flex-1">
                          {article.excerpt}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-vintage-beige/50 mt-auto pt-3 border-t border-white/5">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px]">
                            person
                          </span>
                          <span className="truncate max-w-[80px]">
                            {article.author}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px]">
                            schedule
                          </span>
                          <time dateTime={article.createdAt.toISOString()}>
                            {timeAgo(article.createdAt)}
                          </time>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>

          {/* Empty State */}
          {articles.length === 0 && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-6xl text-vintage-beige/20 mb-4 block">
                library_music
              </span>
              <h3 className="text-xl font-bold text-vintage-cream mb-2">
                Henüz içerik yok
              </h3>
              <p className="text-vintage-beige/60">
                Yakında yeni müzik haberleri ve incelemeler eklenecek.
              </p>
            </div>
          )}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
