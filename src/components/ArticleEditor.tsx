"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface ArticleData {
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  author: string;
  readTime: number;
  categoryId: string;
  tagIds: string[];
  featured: boolean;
  editorsPick: boolean;
  published: boolean;
  titleEn?: string;
  contentEn?: string;
  excerptEn?: string;
}

export default function ArticleEditor({
  initialData,
  slug,
}: {
  initialData?: ArticleData;
  slug?: string;
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  const [form, setForm] = useState<ArticleData>(
    initialData || {
      title: "",
      content: "",
      excerpt: "",
      imageUrl: "",
      author: "Editör Ekibi",
      readTime: 5,
      categoryId: "",
      tagIds: [],
      featured: false,
      editorsPick: false,
      published: false,
    }
  );

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/tags").then((r) => r.json()),
    ]).then(([cats, tgs]) => {
      setCategories(cats);
      setTags(tgs);
      if (cats.length > 0) {
        setForm((prev) =>
          prev.categoryId ? prev : { ...prev, categoryId: cats[0].id }
        );
      }
    });
  }, []);

  function updateField<K extends keyof ArticleData>(
    key: K,
    value: ArticleData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function callGemini(
    action: string,
    text: string,
    extra?: Record<string, string>
  ): Promise<string> {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, text, ...extra }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.result;
  }

  async function handleAI(action: string) {
    setAiLoading(action);
    try {
      switch (action) {
        case "complete": {
          const result = await callGemini("complete", form.content);
          updateField("content", form.content + "\n\n" + result);
          break;
        }
        case "improve": {
          const result = await callGemini("improve", form.content);
          updateField("content", result);
          break;
        }
        case "excerpt": {
          const result = await callGemini("excerpt", form.content);
          updateField("excerpt", result);
          break;
        }
        case "translate": {
          const [titleEn, contentEn, excerptEn] = await Promise.all([
            callGemini("translate", form.title, { targetLang: "en" }),
            callGemini("translate", form.content, { targetLang: "en" }),
            callGemini("translate", form.excerpt, { targetLang: "en" }),
          ]);
          updateField("titleEn", titleEn);
          updateField("contentEn", contentEn);
          updateField("excerptEn", excerptEn);
          break;
        }
      }
    } catch (err) {
      alert("AI hatası: " + (err as Error).message);
    } finally {
      setAiLoading(null);
    }
  }

  async function handleSave() {
    if (!form.title || !form.content || !form.categoryId) {
      alert("Başlık, içerik ve kategori zorunludur.");
      return;
    }
    setSaving(true);
    try {
      const url = slug ? `/api/articles/${slug}` : "/api/articles";
      const method = slug ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json();
        alert("Hata: " + (data.error || "Bilinmeyen hata"));
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-vintage-beige/70 mb-2">
            Başlık
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Yazı başlığını girin..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-vintage-cream placeholder:text-vintage-beige/30 focus:outline-none focus:ring-2 focus:ring-primary/40 text-lg"
          />
        </div>

        {/* Content + AI Tools */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-vintage-beige/70">
              İçerik
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleAI("complete")}
                disabled={!!aiLoading}
                className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 text-xs font-medium hover:bg-purple-500/30 transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[14px]">
                  auto_fix_high
                </span>
                {aiLoading === "complete" ? "Tamamlanıyor..." : "AI Tamamla"}
              </button>
              <button
                onClick={() => handleAI("improve")}
                disabled={!!aiLoading}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-xs font-medium hover:bg-blue-500/30 transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[14px]">
                  edit_note
                </span>
                {aiLoading === "improve" ? "Düzeltiliyor..." : "AI Düzelt"}
              </button>
            </div>
          </div>
          <textarea
            value={form.content}
            onChange={(e) => updateField("content", e.target.value)}
            placeholder="Yazı içeriğini girin..."
            rows={16}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-vintage-cream placeholder:text-vintage-beige/30 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm leading-relaxed resize-y"
          />
        </div>

        {/* Excerpt + AI */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-vintage-beige/70">
              Özet
            </label>
            <button
              onClick={() => handleAI("excerpt")}
              disabled={!!aiLoading}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-xs font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[14px]">
                summarize
              </span>
              {aiLoading === "excerpt" ? "Oluşturuluyor..." : "AI Özet Oluştur"}
            </button>
          </div>
          <textarea
            value={form.excerpt}
            onChange={(e) => updateField("excerpt", e.target.value)}
            placeholder="Kısa özet..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-vintage-cream placeholder:text-vintage-beige/30 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm resize-none"
          />
        </div>

        {/* Translate Button */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-vintage-cream text-sm font-medium">
                İngilizce Çeviri
              </p>
              <p className="text-vintage-beige/50 text-xs mt-1">
                Gemini AI ile başlık, içerik ve özeti İngilizce&apos;ye çevir
              </p>
            </div>
            <button
              onClick={() => handleAI("translate")}
              disabled={!!aiLoading}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 text-bg-dark font-bold text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">
                translate
              </span>
              {aiLoading === "translate" ? "Çevriliyor..." : "Çevir"}
            </button>
          </div>
          {form.titleEn && (
            <div className="mt-4 space-y-2 border-t border-primary/10 pt-4">
              <p className="text-xs text-vintage-beige/50">EN Başlık:</p>
              <p className="text-sm text-vintage-cream">{form.titleEn}</p>
              <p className="text-xs text-vintage-beige/50 mt-2">EN Özet:</p>
              <p className="text-sm text-vintage-cream">{form.excerptEn}</p>
            </div>
          )}
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-vintage-beige/70 mb-2">
            Görsel URL
          </label>
          <input
            type="url"
            value={form.imageUrl}
            onChange={(e) => updateField("imageUrl", e.target.value)}
            placeholder="https://..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-vintage-cream placeholder:text-vintage-beige/30 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
          />
          {form.imageUrl && (
            <div className="mt-2 w-full aspect-video rounded-lg overflow-hidden border border-white/5">
              <img
                src={form.imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Grid: Category, Author, ReadTime */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-vintage-beige/70 mb-2">
              Kategori
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => updateField("categoryId", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-vintage-cream focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-bg-dark">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-vintage-beige/70 mb-2">
              Yazar
            </label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => updateField("author", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-vintage-cream focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-vintage-beige/70 mb-2">
              Okuma Süresi (dk)
            </label>
            <input
              type="number"
              value={form.readTime}
              onChange={(e) => updateField("readTime", parseInt(e.target.value) || 5)}
              min={1}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-vintage-cream focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-vintage-beige/70 mb-2">
            Etiketler
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => {
                  const newTags = form.tagIds.includes(tag.id)
                    ? form.tagIds.filter((t) => t !== tag.id)
                    : [...form.tagIds, tag.id];
                  updateField("tagIds", newTags);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  form.tagIds.includes(tag.id)
                    ? "bg-primary/20 border-primary/40 text-primary"
                    : "bg-white/5 border-white/10 text-vintage-beige/60 hover:border-primary/30"
                }`}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-4">
          {[
            { key: "featured" as const, label: "Öne Çıkan" },
            { key: "editorsPick" as const, label: "Editör Seçimi" },
            { key: "published" as const, label: "Yayınla" },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={form[key]}
                onChange={(e) => updateField(key, e.target.checked)}
                className="w-4 h-4 accent-primary rounded"
              />
              <span className="text-sm text-vintage-cream">{label}</span>
            </label>
          ))}
        </div>

        {/* Save */}
        <div className="flex gap-3 pt-4 border-t border-white/10">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-primary/80 text-bg-dark font-bold text-sm px-8 py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : slug ? "Güncelle" : "Kaydet"}
          </button>
          <button
            onClick={() => router.push("/admin")}
            className="bg-white/5 hover:bg-white/10 text-vintage-cream font-medium text-sm px-8 py-3 rounded-lg transition-colors border border-white/10"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
}
