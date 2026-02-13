"use client";

import { useState } from "react";
import Link from "next/link";

interface GeneratedArticle {
  id: string;
  title: string;
  excerpt: string;
  category: { name: string; color: string };
  featured: boolean;
  editorsPick: boolean;
  createdAt: string;
}

export default function GrokGeneratePage() {
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(5);
  const [generated, setGenerated] = useState<GeneratedArticle[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function generateArticles() {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Bir hata oluştu");
      }

      setGenerated(data.articles || []);
      setSuccess(`${data.count} adet haber başarıyla oluşturuldu ve veritabanına kaydedildi!`);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Haberler oluşturulurken bir hata oluştu";
      setError(errorMessage);
    } finally {
      setLoading(false);
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
                Grok AI ile Haber Üret
              </h1>
              <p className="text-sm text-vintage-beige/50">
                2020-2025 yılları arası gerçek müzik olaylarını AI ile oluştur
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-[24px]">
                auto_fix_high
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-vintage-cream mb-2">
                Grok AI Haber Üretimi
              </h3>
              <p className="text-vintage-beige/70 text-sm leading-relaxed">
                Bu özellik, xAI&apos;nin Grok modelini kullanarak 2020-2025 yılları arasında 
                gerçekleşen önemli müzik olaylarını, albüm çıkışlarını, festival haberlerini 
                ve röportajları otomatik olarak oluşturur. Tüm içerikler Türkçe olarak 
                hazırlanır ve SEO uyumlu şekilde veritabanına kaydedilir.
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-bg-card border border-white/5 rounded-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-vintage-beige/70 mb-2">
                Oluşturulacak Haber Sayısı
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="text-vintage-cream font-bold w-8 text-center">
                  {count}
                </span>
              </div>
            </div>
            <button
              onClick={generateArticles}
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-bg-dark font-bold px-8 py-3 rounded-xl transition-all primary-shadow"
            >
              <span className="material-symbols-outlined text-[20px]">
                {loading ? "progress_activity" : "auto_fix_high"}
              </span>
              {loading ? "Oluşturuluyor..." : "Haberleri Oluştur"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-red-400">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 text-green-400">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">check_circle</span>
              {success}
            </div>
          </div>
        )}

        {/* Generated Articles */}
        {generated.length > 0 && (
          <div className="bg-bg-card border border-white/5 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-lg font-bold text-vintage-cream">
                Oluşturulan Haberler ({generated.length})
              </h3>
            </div>
            <div className="divide-y divide-white/5">
              {generated.map((article) => (
                <div
                  key={article.id}
                  className="p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${article.category.color}20`,
                            color: article.category.color,
                          }}
                        >
                          {article.category.name}
                        </span>
                        {article.featured && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                            Öne Çıkan
                          </span>
                        )}
                        {article.editorsPick && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-purple/20 text-accent-purple">
                            Editör Seçimi
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-vintage-cream mb-1">
                        {article.title}
                      </h4>
                      <p className="text-vintage-beige/50 text-sm line-clamp-2">
                        {article.excerpt}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-white/5 bg-white/5">
              <Link
                href="/admin"
                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-bg-dark font-bold px-6 py-2.5 rounded-xl transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  dashboard
                </span>
                Admin Paneline Dön
              </Link>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {[
            {
              icon: "music_note",
              title: "Gerçek Olaylar",
              desc: "2020-2025 arası gerçek müzik olayları ve albümler",
            },
            {
              icon: "translate",
              title: "Türkçe İçerik",
              desc: "Tüm haberler doğal ve akıcı Türkçe ile yazılır",
            },
            {
              icon: "verified",
              title: "SEO Uyumlu",
              desc: "Arama motorları için optimize başlık ve içerikler",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-bg-card/50 border border-white/5 rounded-xl p-4"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-primary">
                  {feature.icon}
                </span>
              </div>
              <h4 className="font-bold text-vintage-cream mb-1">
                {feature.title}
              </h4>
              <p className="text-vintage-beige/50 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
