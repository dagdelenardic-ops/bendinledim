"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import ArticleEditor from "@/components/ArticleEditor";
import Link from "next/link";

function NewArticleContent() {
  const searchParams = useSearchParams();

  const title = searchParams.get("title") || "";
  const content = searchParams.get("content") || "";
  const imageUrl = searchParams.get("imageUrl") || "";
  const source = searchParams.get("source") || "";
  const sourceUrl = searchParams.get("sourceUrl") || "";

  const hasImport = !!title;

  const initialData = hasImport
    ? {
        title,
        content,
        excerpt: "",
        imageUrl,
        author: source ? `${source} / Editör Ekibi` : "Editör Ekibi",
        readTime: 5,
        categoryId: "",
        tagIds: [],
        featured: false,
        editorsPick: false,
        published: false,
      }
    : undefined;

  return (
    <div className="min-h-screen bg-bg-dark">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/admin"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-vintage-beige/60 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-vintage-cream">Yeni Yazı</h1>
            <p className="text-sm text-vintage-beige/50">
              {hasImport ? "RSS haberini düzenle ve yayınla" : "Yeni müzik haberi oluştur"}
            </p>
          </div>
        </div>

        {/* RSS Import Info */}
        {hasImport && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">
                  rss_feed
                </span>
              </div>
              <div className="flex-1">
                <p className="text-vintage-cream font-medium">
                  RSS&apos;den İçe Aktarıldı
                </p>
                <p className="text-vintage-beige/50 text-sm mt-0.5">
                  Kaynak: {source}
                  {sourceUrl && (
                    <>
                      {" — "}
                      <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Orijinal haber
                        <span className="material-symbols-outlined text-[14px]">
                          open_in_new
                        </span>
                      </a>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        <ArticleEditor initialData={initialData} />
      </div>
    </div>
  );
}

export default function NewArticlePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg-dark flex items-center justify-center text-vintage-beige/40">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl animate-spin mb-3 block">
              progress_activity
            </span>
            Yükleniyor...
          </div>
        </div>
      }
    >
      <NewArticleContent />
    </Suspense>
  );
}
