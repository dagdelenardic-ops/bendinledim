import { prisma } from "@/lib/db";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import FeaturedArticle from "@/components/FeaturedArticle";
import ArticleCard from "@/components/ArticleCard";
import EditorsPickCard from "@/components/EditorsPickCard";
import Link from "next/link";
import Script from "next/script";
import { absUrl } from "@/lib/site";

export const metadata = {
  title: "Ben Dinledim | Indie Müzik Blogu",
  description:
    "Yabancı indie müzik dünyasından en güncel haberler, albüm incelemeleri, röportajlar ve keşfedilmeyi bekleyen sanatçılar.",
};

export default async function Home() {
  const [featured, latestNews, editorsPicks] = await Promise.all([
    prisma.article.findFirst({
      where: { published: true, featured: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.article.findMany({
      where: { published: true, featured: false },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.article.findMany({
      where: { published: true, editorsPick: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  // JSON-LD structured data for the page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: [
      ...(featured
        ? [
            {
              "@type": "ListItem",
              position: 1,
              item: {
                "@type": "NewsArticle",
                headline: featured.title,
                url: absUrl(`/haber/${featured.slug}`),
                image: featured.imageUrl,
                datePublished: featured.createdAt.toISOString(),
                author: {
                  "@type": "Person",
                  name: featured.author,
                },
              },
            },
          ]
        : []),
      ...latestNews.map((article, index) => ({
        "@type": "ListItem",
        position: index + (featured ? 2 : 1),
        item: {
          "@type": "NewsArticle",
          headline: article.title,
          url: absUrl(`/haber/${article.slug}`),
          image: article.imageUrl,
          datePublished: article.createdAt.toISOString(),
          author: {
            "@type": "Person",
            name: article.author,
          },
        },
      })),
    ],
  };

  return (
    <div className="relative min-h-screen pb-24 lg:pb-0">
      {/* Structured Data */}
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Sidebar />
      <div className="lg:ml-64">
        <Header />
        <main className="max-w-6xl mx-auto lg:px-6">
          {/* Hero Section - Featured Article */}
          {featured && (
            <section className="px-4 pt-4 pb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  star
                </span>
                <h2 className="text-lg font-bold text-vintage-cream">
                  Günün Haberi
                </h2>
              </div>
              <FeaturedArticle
                title={featured.title}
                slug={featured.slug}
                excerpt={featured.excerpt}
                imageUrl={featured.imageUrl || ""}
                author={featured.author}
                readTime={featured.readTime}
                category={featured.category.name}
                categoryColor={featured.category.color}
              />
            </section>
          )}

          {/* Latest News Section */}
          <section className="py-6">
            <div className="flex items-center justify-between px-4 mb-5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  breaking_news
                </span>
                <h2 className="text-xl font-bold text-vintage-cream">
                  Son Haberler
                </h2>
              </div>
              <Link
                href="/kesfet"
                className="flex items-center gap-1 text-primary text-sm font-semibold hover:underline transition-all"
              >
                Tümünü Gör
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </Link>
            </div>

            {/* Horizontal Scroll on Mobile, Grid on Desktop */}
            <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-4 px-4 lg:grid lg:grid-cols-4 lg:overflow-visible lg:snap-none pb-4">
              {latestNews.map((article) => (
                <ArticleCard
                  key={article.id}
                  title={article.title}
                  slug={article.slug}
                  imageUrl={article.imageUrl || ""}
                  category={article.category.name}
                  categoryColor={article.category.color}
                  createdAt={article.createdAt.toISOString()}
                  excerpt={article.excerpt}
                />
              ))}
            </div>
          </section>

          {/* Editors' Picks Section */}
          {editorsPicks.length > 0 && (
            <section className="px-4 py-8 border-t border-white/5">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  recommend
                </span>
                <h2 className="text-xl font-bold text-vintage-cream">
                  Editörün Seçimi
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {editorsPicks.map((article) => (
                  <EditorsPickCard
                    key={article.id}
                    title={article.title}
                    slug={article.slug}
                    imageUrl={article.imageUrl || ""}
                    category={article.category.name}
                    categoryColor={article.category.color}
                    author={article.author}
                    readTime={article.readTime}
                    excerpt={article.excerpt}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Newsletter CTA Section */}
          <section className="px-4 py-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-bg-card to-bg-card border border-primary/20 p-6 sm:p-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary text-[24px]">
                    mail
                  </span>
                  <h3 className="text-xl font-bold text-vintage-cream">
                    Müzik Haberlerini Kaçırma
                  </h3>
                </div>
                <p className="text-vintage-beige/70 mb-6 max-w-lg">
                  Yabancı indie müzik dünyasından en güncel haberler, albüm
                  incelemeleri ve röportajlar için bizi takip et.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/kesfet"
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-bg-dark font-bold px-6 py-3 rounded-xl transition-all primary-shadow"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      explore
                    </span>
                    Keşfet
                  </Link>
                  <a
                    href="/rss.xml"
                    className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-vintage-cream font-medium px-6 py-3 rounded-xl transition-all border border-white/10"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      rss_feed
                    </span>
                    RSS
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Categories Quick Links */}
          <section className="px-4 py-6 border-t border-white/5">
            <h3 className="text-sm font-bold text-vintage-beige/50 uppercase tracking-widest mb-4">
              Popüler Kategoriler
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                { name: "Yeni Albümler", slug: "yeni-albumler" },
                { name: "İncelemeler", slug: "incelemeler" },
                { name: "Röportajlar", slug: "roportajlar" },
                { name: "Konserler", slug: "konserler" },
                { name: "Festival", slug: "festival" },
                { name: "Liste", slug: "liste" },
              ].map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/kategori/${cat.slug}`}
                  className="px-4 py-2 rounded-full bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/30 text-sm text-vintage-beige hover:text-primary transition-all"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
