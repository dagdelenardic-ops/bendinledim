import { prisma } from "@/lib/db";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { timeAgo } from "@/lib/utils";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({
    where: { slug },
  });

  if (!tag) {
    return {
      title: "Etiket Bulunamadı | Ben Dinledim",
    };
  }

  return {
    title: `#${tag.name} | Ben Dinledim`,
    description: `${tag.name} etiketli müzik haberleri, incelemeler ve röportajlar.`,
  };
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;

  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      articles: {
        include: {
          article: { include: { category: true } },
        },
      },
    },
  });

  if (!tag) notFound();

  const articles = tag.articles
    .map((ta) => ta.article)
    .filter((a) => a.published);

  return (
    <div className="relative min-h-screen pb-24 lg:pb-0">
      <Sidebar />
      <div className="lg:ml-64">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-vintage-beige/50 mb-6">
            <Link href="/" className="hover:text-primary transition-colors">
              Ana Sayfa
            </Link>
            <span className="material-symbols-outlined text-[16px]">
              chevron_right
            </span>
            <Link
              href="/kesfet"
              className="hover:text-primary transition-colors"
            >
              Keşfet
            </Link>
            <span className="material-symbols-outlined text-[16px]">
              chevron_right
            </span>
            <span className="text-vintage-cream">#{tag.name}</span>
          </nav>

          {/* Tag Header */}
          <div className="relative overflow-hidden rounded-2xl bg-bg-card border border-white/5 p-6 sm:p-8 mb-8">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20 -mr-24 -mt-24 bg-accent-purple" />

            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-accent-purple/20">
                <span className="material-symbols-outlined text-[32px] text-accent-purple">
                  tag
                </span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-vintage-cream mb-1">
                  #{tag.name}
                </h1>
                <p className="text-vintage-beige/50">
                  {articles.length} yazı bulundu
                </p>
              </div>
            </div>
          </div>

          {/* Articles Grid */}
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

          {/* Empty State */}
          {articles.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl text-vintage-beige/30">
                  tag
                </span>
              </div>
              <h3 className="text-xl font-bold text-vintage-cream mb-2">
                Henüz içerik yok
              </h3>
              <p className="text-vintage-beige/60">
                Bu etikette henüz yazı bulunmuyor.
              </p>
            </div>
          )}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
