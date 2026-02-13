"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { timeAgo } from "@/lib/utils";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string | null;
  published: boolean;
  featured: boolean;
  editorsPick: boolean;
  author: string;
  readTime: number;
  createdAt: string;
  category: { name: string; color: string; slug: string };
}

export default function AdminPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "featured">("all");

  useEffect(() => {
    fetch("/api/articles?limit=50&all=true")
      .then((r) => r.json())
      .then((data) => {
        setArticles(data.articles || []);
        setLoading(false);
      });
  }, []);

  async function togglePublish(slug: string, published: boolean) {
    await fetch(`/api/articles/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    setArticles((prev) =>
      prev.map((a) =>
        a.slug === slug ? { ...a, published: !published } : a
      )
    );
  }

  async function toggleFeatured(slug: string, featured: boolean) {
    await fetch(`/api/articles/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !featured }),
    });
    setArticles((prev) =>
      prev.map((a) =>
        a.slug === slug ? { ...a, featured: !featured } : a
      )
    );
  }

  async function toggleEditorsPick(slug: string, editorsPick: boolean) {
    await fetch(`/api/articles/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ editorsPick: !editorsPick }),
    });
    setArticles((prev) =>
      prev.map((a) =>
        a.slug === slug ? { ...a, editorsPick: !editorsPick } : a
      )
    );
  }

  async function deleteArticle(slug: string) {
    if (!confirm("Bu yazıyı silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/articles/${slug}`, { method: "DELETE" });
    setArticles((prev) => prev.filter((a) => a.slug !== slug));
  }

  const filteredArticles = articles.filter((a) => {
    if (filter === "published") return a.published;
    if (filter === "draft") return !a.published;
    if (filter === "featured") return a.featured;
    return true;
  });

  const stats = {
    total: articles.length,
    published: articles.filter((a) => a.published).length,
    draft: articles.filter((a) => !a.published).length,
    featured: articles.filter((a) => a.featured).length,
    editorsPick: articles.filter((a) => a.editorsPick).length,
  };

  return (
    <div className="min-h-screen bg-bg-dark">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-vintage-beige/60 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-vintage-cream">
                Admin Panel
              </h1>
              <p className="text-sm text-vintage-beige/50">
                İçerik yönetimi ve düzenleme
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/admin/grok"
              className="flex items-center gap-2 bg-gradient-to-r from-accent-purple/20 to-primary/20 hover:from-accent-purple/30 hover:to-primary/30 text-vintage-cream font-medium text-sm px-4 py-2.5 rounded-xl transition-colors border border-accent-purple/30"
            >
              <span className="material-symbols-outlined text-[18px]">
                auto_fix_high
              </span>
              Grok AI
            </Link>
            <Link
              href="/admin/haberler"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-vintage-cream font-medium text-sm px-4 py-2.5 rounded-xl transition-colors border border-white/10"
            >
              <span className="material-symbols-outlined text-[18px]">
                rss_feed
              </span>
              RSS Haberler
            </Link>
            <Link
              href="/admin/yeni"
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-bg-dark font-bold text-sm px-5 py-2.5 rounded-xl transition-colors primary-shadow"
            >
              <span className="material-symbols-outlined text-[18px]">
                add
              </span>
              Yeni Yazı
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          <div className="bg-bg-card border border-white/5 rounded-xl p-4">
            <p className="text-vintage-beige/50 text-xs uppercase tracking-wider mb-1">
              Toplam
            </p>
            <p className="text-2xl font-bold text-vintage-cream">
              {stats.total}
            </p>
          </div>
          <div className="bg-bg-card border border-white/5 rounded-xl p-4">
            <p className="text-vintage-beige/50 text-xs uppercase tracking-wider mb-1">
              Yayında
            </p>
            <p className="text-2xl font-bold text-green-400">
              {stats.published}
            </p>
          </div>
          <div className="bg-bg-card border border-white/5 rounded-xl p-4">
            <p className="text-vintage-beige/50 text-xs uppercase tracking-wider mb-1">
              Taslak
            </p>
            <p className="text-2xl font-bold text-yellow-400">
              {stats.draft}
            </p>
          </div>
          <div className="bg-bg-card border border-white/5 rounded-xl p-4">
            <p className="text-vintage-beige/50 text-xs uppercase tracking-wider mb-1">
              Öne Çıkan
            </p>
            <p className="text-2xl font-bold text-primary">
              {stats.featured}
            </p>
          </div>
          <div className="bg-bg-card border border-white/5 rounded-xl p-4">
            <p className="text-vintage-beige/50 text-xs uppercase tracking-wider mb-1">
              Editörün Seçimi
            </p>
            <p className="text-2xl font-bold text-accent-purple">
              {stats.editorsPick}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2">
          {[
            { key: "all", label: "Tümü", count: stats.total },
            { key: "published", label: "Yayında", count: stats.published },
            { key: "draft", label: "Taslak", count: stats.draft },
            { key: "featured", label: "Öne Çıkan", count: stats.featured },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === tab.key
                  ? "bg-primary text-bg-dark"
                  : "bg-white/5 text-vintage-beige/70 hover:bg-white/10 hover:text-vintage-cream"
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 text-xs ${
                  filter === tab.key ? "text-bg-dark/60" : "text-vintage-beige/40"
                }`}
              >
                ({tab.count})
              </span>
            </button>
          ))}
        </div>

        {/* Articles Grid - Same format as homepage */}
        {loading ? (
          <div className="text-center py-16 text-vintage-beige/40">
            <span className="material-symbols-outlined text-4xl animate-spin mb-3 block">
              progress_activity
            </span>
            Yükleniyor...
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-16 text-vintage-beige/40">
            <span className="material-symbols-outlined text-4xl mb-3 block">
              article
            </span>
            Henüz yazı yok.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="group relative bg-bg-card border border-white/5 rounded-xl overflow-hidden card-hover"
              >
                {/* Image */}
                <div className="relative aspect-video">
                  <Image
                    src={article.imageUrl || "/placeholder.svg"}
                    alt={article.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                  />
                  {/* Status Badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span
                      className={`badge text-[8px] ${
                        article.published
                          ? "bg-green-400 text-bg-dark"
                          : "bg-yellow-400 text-bg-dark"
                      }`}
                    >
                      {article.published ? "Yayında" : "Taslak"}
                    </span>
                    {article.featured && (
                      <span className="badge bg-primary text-bg-dark text-[8px]">
                        Öne Çıkan
                      </span>
                    )}
                    {article.editorsPick && (
                      <span className="badge bg-accent-purple text-white text-[8px]">
                        Editör
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: article.category.color }}
                  >
                    {article.category.name}
                  </span>
                  <h3 className="font-bold text-base leading-snug line-clamp-2 text-vintage-cream mt-1 mb-2">
                    {article.title}
                  </h3>
                  <p className="text-vintage-beige/50 text-sm line-clamp-1 mb-3">
                    {article.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-vintage-beige/40 pt-3 border-t border-white/5">
                    <span>{article.author}</span>
                    <time dateTime={article.createdAt}>
                      {timeAgo(new Date(article.createdAt))}
                    </time>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 p-3 border-t border-white/5 bg-white/[0.02]">
                  <button
                    onClick={() =>
                      togglePublish(article.slug, article.published)
                    }
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                      article.published
                        ? "bg-green-400/10 text-green-400 hover:bg-green-400/20"
                        : "bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {article.published ? "visibility" : "visibility_off"}
                    </span>
                    {article.published ? "Yayından Kaldır" : "Yayınla"}
                  </button>
                  <Link
                    href={`/admin/duzenle/${article.slug}`}
                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 text-vintage-beige/60 hover:text-primary hover:bg-white/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      edit
                    </span>
                  </Link>
                  <button
                    onClick={() => deleteArticle(article.slug)}
                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 text-vintage-beige/60 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      delete
                    </span>
                  </button>
                </div>

                {/* Quick Actions Overlay */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => toggleFeatured(article.slug, article.featured)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      article.featured
                        ? "bg-primary text-bg-dark"
                        : "bg-bg-dark/80 text-vintage-beige/60 hover:text-primary"
                    }`}
                    title="Öne Çıkan"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      star
                    </span>
                  </button>
                  <button
                    onClick={() =>
                      toggleEditorsPick(article.slug, article.editorsPick)
                    }
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      article.editorsPick
                        ? "bg-accent-purple text-white"
                        : "bg-bg-dark/80 text-vintage-beige/60 hover:text-accent-purple"
                    }`}
                    title="Editörün Seçimi"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      recommend
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
