import { prisma } from "@/lib/db";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import Image from "next/image";
import { timeAgo } from "@/lib/utils";
import type { Metadata } from "next";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

async function getSearchResults(query: string) {
  return prisma.article.findMany({
    where: {
      published: true,
      OR: [
        { title: { contains: query } },
        { content: { contains: query } },
        { excerpt: { contains: query } },
      ],
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `"${q}" Arama Sonuçları` : "Ara | Ben Dinledim",
    description: q
      ? `"${q}" araması için müzik haberleri ve içerikler.`
      : "Müzik haberleri, albüm incelemeleri ve röportajlar arasında arama yapın.",
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const normalizedQuery = q?.trim() || "";
  type SearchArticle = Awaited<ReturnType<typeof getSearchResults>>[number];
  let articles: SearchArticle[] = [];

  if (normalizedQuery) {
    articles = await getSearchResults(normalizedQuery);
  }

  return (
    <div className="relative min-h-screen pb-24 lg:pb-0">
      <Sidebar />
      <div className="lg:ml-64">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-[28px]">
                search
              </span>
              <h1 className="text-3xl font-bold text-vintage-cream">
                Arama Sonuçları
              </h1>
            </div>
            {normalizedQuery ? (
              <p className="text-vintage-beige/60">
                &ldquo;<span className="text-primary">{normalizedQuery}</span>&rdquo; için{" "}
                <span className="font-semibold text-vintage-cream">
                  {articles.length}
                </span>{" "}
                sonuç bulundu
              </p>
            ) : (
              <p className="text-vintage-beige/60">
                Aramak istediğiniz kelimeyi yazın
              </p>
            )}
          </div>

          {/* Search Form */}
          <form action="/arama" className="mb-8">
            <div className="relative max-w-xl">
              <input
                type="text"
                name="q"
                defaultValue={normalizedQuery}
                placeholder="Haber, albüm veya sanatçı ara..."
                className="w-full bg-bg-card border border-white/10 rounded-xl pl-12 pr-4 py-4 text-vintage-cream placeholder:text-vintage-beige/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-vintage-beige/40">
                search
              </span>
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary-dark text-bg-dark font-bold px-4 py-2 rounded-lg transition-colors"
              >
                Ara
              </button>
            </div>
          </form>

          {/* Results Grid */}
          {articles.length > 0 && (
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
          )}

          {/* Empty State */}
          {normalizedQuery && articles.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl text-vintage-beige/30">
                  search_off
                </span>
              </div>
              <h3 className="text-xl font-bold text-vintage-cream mb-2">
                Sonuç bulunamadı
              </h3>
              <p className="text-vintage-beige/50 max-w-md mx-auto">
                &ldquo;{normalizedQuery}&rdquo; araması için sonuç bulunamadı. Farklı bir
                kelime ile tekrar deneyin.
              </p>
            </div>
          )}

          {/* No Query State */}
          {!normalizedQuery && (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl text-vintage-beige/30">
                  search
                </span>
              </div>
              <h3 className="text-xl font-bold text-vintage-cream mb-2">
                Arama yapın
              </h3>
              <p className="text-vintage-beige/50">
                Üstteki arama kutusuna bir kelime yazarak içerikleri arayın.
              </p>
            </div>
          )}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
