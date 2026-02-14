import { prisma } from "@/lib/db";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import CommentSection from "@/components/CommentSection";
import ShareButton from "@/components/ShareButton";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { timeAgo } from "@/lib/utils";
import type { Metadata } from "next";
import Script from "next/script";
import { absUrl, SITE_URL } from "@/lib/site";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
    include: { category: true, tags: { include: { tag: true } } },
  });

  if (!article) {
    return {
      title: "Haber Bulunamadı | Ben Dinledim",
    };
  }

  return {
    metadataBase: new URL(SITE_URL),
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      url: absUrl(`/haber/${article.slug}`),
      publishedTime: article.createdAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [article.author],
      section: article.category.name,
      tags: article.tags.map((t) => t.tag.name),
      images: article.imageUrl
        ? [
            {
              url: article.imageUrl,
              width: 1200,
              height: 630,
              alt: article.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: article.imageUrl ? [article.imageUrl] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: { include: { tag: true } },
      comments: {
        where: { approved: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!article) notFound();

  // JSON-LD structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: article.imageUrl,
    datePublished: article.createdAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Ben Dinledim",
      logo: {
        "@type": "ImageObject",
        url: absUrl("/logo.png"),
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absUrl(`/haber/${article.slug}`),
    },
    articleSection: article.category.name,
    keywords: article.tags.map((t) => t.tag.name).join(", "),
  };

  return (
    <div className="relative min-h-screen pb-24 lg:pb-0">
      {/* Structured Data */}
      <Script
        id="article-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Sidebar />
      <div className="lg:ml-64">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-6 lg:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-vintage-beige/50 mb-6">
            <Link href="/" className="hover:text-primary transition-colors">
              Ana Sayfa
            </Link>
            <span className="material-symbols-outlined text-[16px]">
              chevron_right
            </span>
            <Link
              href={`/kategori/${article.category.slug}`}
              className="hover:text-primary transition-colors"
            >
              {article.category.name}
            </Link>
            <span className="material-symbols-outlined text-[16px]">
              chevron_right
            </span>
            <span className="text-vintage-cream truncate max-w-[200px]">
              {article.title}
            </span>
          </nav>

          {/* Hero Image */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6 border border-white/5">
            <Image
              src={article.imageUrl || "/placeholder.svg"}
              alt={article.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 800px"
              unoptimized
            />
          </div>

          {/* Category & Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Link href={`/kategori/${article.category.slug}`}>
              <span
                className="badge text-bg-dark hover:opacity-90 transition-opacity"
                style={{ backgroundColor: article.category.color }}
              >
                {article.category.name}
              </span>
            </Link>
            <span className="text-vintage-beige/50 text-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">
                schedule
              </span>
              <time dateTime={article.createdAt.toISOString()}>
                {timeAgo(article.createdAt)}
              </time>
            </span>
            {article.featured && (
              <span className="badge bg-bg-elevated text-primary border border-primary/30">
                <span className="material-symbols-outlined text-[12px] mr-1">
                  star
                </span>
                Öne Çıkan
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-vintage-cream mb-6">
            {article.title}
          </h1>

          {/* Author & Read Time */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-bg-card/50 border border-white/5 mb-8">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[24px]">
                person
              </span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-vintage-cream">{article.author}</p>
              <div className="flex items-center gap-3 text-vintage-beige/50 text-sm">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">
                    schedule
                  </span>
                  {article.readTime} dk okuma
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <article className="prose-article mb-8">
            {article.content.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </article>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8 pt-6 border-t border-white/10">
              <span className="text-sm text-vintage-beige/50 mr-2">
                Etiketler:
              </span>
              {article.tags.map(({ tag }) => (
                <Link
                  key={tag.id}
                  href={`/etiket/${tag.slug}`}
                  className="px-3 py-1.5 bg-white/5 hover:bg-primary/20 border border-white/10 rounded-full text-xs text-vintage-beige hover:text-primary transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Share Section */}
          <div className="flex items-center gap-3 mb-8 pt-6 border-t border-white/10">
            <span className="text-sm text-vintage-beige/50">Paylaş:</span>
            <ShareButton
              title={article.title}
              url={absUrl(`/haber/${article.slug}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-primary/20 text-vintage-beige hover:text-primary transition-colors text-xs"
            />
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                article.title
              )}&url=${encodeURIComponent(
                absUrl(`/haber/${article.slug}`)
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-accent-turquoise/15 text-vintage-beige hover:text-accent-turquoise transition-colors text-xs"
            >
              <span className="material-symbols-outlined text-[16px]">
                open_in_new
              </span>
              Twitter
            </a>
          </div>

          {/* Comments */}
          <CommentSection
            articleId={article.id}
            comments={article.comments.map((c) => ({
              ...c,
              createdAt: c.createdAt.toISOString(),
            }))}
          />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
