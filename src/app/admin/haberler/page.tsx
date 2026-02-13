"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface RSSArticle {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  imageUrl?: string;
  translatedTitle?: string;
  translatedDescription?: string;
  isTranslating?: boolean;
  isTranslated?: boolean;
}

export default function RSSFeedPage() {
  const [articles, setArticles] = useState<RSSArticle[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [activeSource, setActiveSource] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [translatingAll, setTranslatingAll] = useState(false);

  const fetchArticles = useCallback(async (source?: string) => {
    setLoading(true);
    setError("");
    try {
      const url = source
        ? `/api/rss?source=${encodeURIComponent(source)}`
        : "/api/rss";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setArticles(
        (data.articles || []).map((a: RSSArticle) => ({
          ...a,
          isTranslating: false,
          isTranslated: false,
        }))
      );
      setSources(data.sources || []);
    } catch {
      setError("RSS beslemeleri yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  function handleSourceFilter(source: string) {
    setActiveSource(source);
    fetchArticles(source || undefined);
  }

  async function translateArticle(index: number) {
    const article = articles[index];
    if (article.isTranslated || article.isTranslating) return;

    setArticles((prev) =>
      prev.map((a, i) => (i === index ? { ...a, isTranslating: true } : a))
    );

    try {
      const res = await fetch("/api/rss/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: article.title,
          description: article.description,
        }),
      });

      if (!res.ok) throw new Error("Translation failed");
      const data = await res.json();

      setArticles((prev) =>
        prev.map((a, i) =>
          i === index
            ? {
                ...a,
                translatedTitle: data.title,
                translatedDescription: data.description,
                isTranslating: false,
                isTranslated: true,
              }
            : a
        )
      );
    } catch {
      setArticles((prev) =>
        prev.map((a, i) =>
          i === index ? { ...a, isTranslating: false } : a
        )
      );
      alert("Çeviri başarısız oldu. Tekrar deneyin.");
    }
  }

  async function translateAll() {
    setTranslatingAll(true);
    const untranslatedIndices = articles
      .map((a, i) => ({ ...a, index: i }))
      .filter((a) => !a.isTranslated && !a.isTranslating)
      .map((a) => a.index);

    for (const index of untranslatedIndices.slice(0, 5)) {
      await translateArticle(index);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    setTranslatingAll(false);
  }

  function importArticle(index: number) {
    const article = articles[index];
    const title = article.translatedTitle || article.title;
    const content = article.translatedDescription || article.description;

    const params = new URLSearchParams({
      title,
      content,
      source: article.source,
      sourceUrl: article.link,
      imageUrl: article.imageUrl || "",
    });

    window.location.href = `/admin/yeni?${params.toString()}`;
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-vintage-beige/60 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-vintage-cream">
                Dünya Müzik Haberleri
              </h1>
              <p className="text-sm text-vintage-beige/50">
                Pitchfork, NME, Stereogum ve Consequence of Sound RSS
                beslemeleri
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={translateAll}
              disabled={translatingAll}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-vintage-cream font-medium text-sm px-4 py-2.5 rounded-xl transition-colors border border-white/10"
            >
              <span className="material-symbols-outlined text-[18px]">
                {translatingAll ? "progress_activity" : "translate"}
              </span>
              {translatingAll ? "Çevriliyor..." : "Tümünü Çevir"}
            </button>
            <button
              onClick={() => fetchArticles(activeSource || undefined)}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-bg-dark font-bold text-sm px-4 py-2.5 rounded-xl transition-colors primary-shadow"
            >
              <span className="material-symbols-outlined text-[18px]">
                refresh
              </span>
              Yenile
            </button>
          </div>
        </div>

        {/* Source Filters */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2">
          <button
            onClick={() => handleSourceFilter("")}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeSource === ""
                ? "bg-primary text-bg-dark"
                : "bg-white/5 text-vintage-beige/70 hover:bg-white/10 hover:text-vintage-cream"
            }`}
          >
            Tümü
          </button>
          {sources.map((source) => (
            <button
              key={source}
              onClick={() => handleSourceFilter(source)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeSource === source
                  ? "bg-primary text-bg-dark"
                  : "bg-white/5 text-vintage-beige/70 hover:bg-white/10 hover:text-vintage-cream"
              }`}
            >
              {source}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-16 text-vintage-beige/40">
            <span className="material-symbols-outlined text-4xl animate-spin mb-3 block">
              progress_activity
            </span>
            RSS beslemeleri yükleniyor...
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 text-vintage-beige/40">
            <span className="material-symbols-outlined text-4xl mb-3 block">
              rss_feed
            </span>
            Haber bulunamadı.
          </div>
        ) : (
          /* Articles Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {articles.map((article, index) => (
              <div
                key={`${article.link}-${index}`}
                className="bg-bg-card border border-white/5 rounded-xl overflow-hidden card-hover"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  {article.imageUrl && (
                    <div className="sm:w-48 h-40 sm:h-auto shrink-0 relative">
                      <Image
                        src={article.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="192px"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 p-4">
                    {/* Source & Date */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="badge bg-primary/10 text-primary text-[9px]">
                        {article.source}
                      </span>
                      <span className="text-vintage-beige/40 text-xs">
                        {formatDate(article.pubDate)}
                      </span>
                    </div>

                    {/* Original Title */}
                    <h3 className="text-vintage-beige/60 text-sm mb-1 line-clamp-1 italic">
                      {article.title}
                    </h3>

                    {/* Translated Title */}
                    {article.isTranslated && article.translatedTitle && (
                      <h3 className="text-vintage-cream font-semibold text-base mb-2 line-clamp-2 flex items-start gap-1.5">
                        <span className="material-symbols-outlined text-primary text-[16px] shrink-0">
                          translate
                        </span>
                        {article.translatedTitle}
                      </h3>
                    )}

                    {!article.isTranslated && (
                      <h3 className="text-vintage-cream font-semibold text-base mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                    )}

                    {/* Description */}
                    {article.isTranslated && article.translatedDescription ? (
                      <p className="text-vintage-beige/70 text-sm line-clamp-2 mb-3">
                        {article.translatedDescription}
                      </p>
                    ) : (
                      <p className="text-vintage-beige/50 text-sm line-clamp-2 mb-3">
                        {article.description}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => translateArticle(index)}
                        disabled={article.isTranslating || article.isTranslated}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                          article.isTranslated
                            ? "bg-green-500/10 text-green-400 cursor-default"
                            : article.isTranslating
                            ? "bg-primary/10 text-primary/50 cursor-wait"
                            : "bg-primary/10 text-primary hover:bg-primary/20"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {article.isTranslated
                            ? "check_circle"
                            : article.isTranslating
                            ? "progress_activity"
                            : "translate"}
                        </span>
                        {article.isTranslated
                          ? "Çevrildi"
                          : article.isTranslating
                          ? "Çevriliyor..."
                          : "Gemini ile Çevir"}
                      </button>

                      <button
                        onClick={() => importArticle(index)}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 text-vintage-beige/70 hover:bg-white/10 hover:text-vintage-cream transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          add_circle
                        </span>
                        İçe Aktar
                      </button>

                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 text-vintage-beige/70 hover:bg-white/10 hover:text-vintage-cream transition-colors ml-auto"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          open_in_new
                        </span>
                        Kaynak
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
