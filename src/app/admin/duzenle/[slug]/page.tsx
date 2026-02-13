"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ArticleEditor from "@/components/ArticleEditor";
import Link from "next/link";

export default function EditArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [articleData, setArticleData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/articles/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setArticleData(data);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-vintage-beige/40 animate-spin mb-3 block">
            progress_activity
          </span>
          <p className="text-vintage-beige/40">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!articleData) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-vintage-beige/40 mb-3 block">
            article
          </span>
          <p className="text-vintage-beige/40">Yazı bulunamadı.</p>
        </div>
      </div>
    );
  }

  const initialData = {
    title: articleData.title as string,
    content: articleData.content as string,
    excerpt: articleData.excerpt as string,
    imageUrl: (articleData.imageUrl as string) || "",
    author: articleData.author as string,
    readTime: articleData.readTime as number,
    categoryId: articleData.categoryId as string,
    tagIds: ((articleData.tags as Array<{ tag: { id: string } }>) || []).map(
      (t) => t.tag.id
    ),
    featured: articleData.featured as boolean,
    editorsPick: articleData.editorsPick as boolean,
    published: articleData.published as boolean,
    titleEn: articleData.titleEn as string | undefined,
    contentEn: articleData.contentEn as string | undefined,
    excerptEn: articleData.excerptEn as string | undefined,
  };

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
            <h1 className="text-2xl font-bold text-vintage-cream">
              Yazıyı Düzenle
            </h1>
            <p className="text-sm text-vintage-beige/50">
              &ldquo;{initialData.title}&rdquo; başlıklı yazıyı düzenliyorsunuz
            </p>
          </div>
        </div>

        <ArticleEditor initialData={initialData} slug={slug} />
      </div>
    </div>
  );
}
