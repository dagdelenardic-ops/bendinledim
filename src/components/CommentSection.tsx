"use client";

import { useState } from "react";
import { timeAgo } from "@/lib/utils";

interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

export default function CommentSection({
  articleId,
  comments: initialComments,
}: {
  articleId: string;
  comments: Comment[];
}) {
  const [comments] = useState(initialComments);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, author, content }),
      });

      if (res.ok) {
        setSubmitted(true);
        setAuthor("");
        setContent("");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="pt-6 border-t border-white/10">
      <h3 className="text-xl font-bold text-vintage-cream mb-6">
        Yorumlar ({comments.length})
      </h3>

      {/* Comment Form */}
      {submitted ? (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
          <p className="text-vintage-cream text-sm">
            Yorumunuz gönderildi! Onaylandıktan sonra görünecektir.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mb-8 space-y-4">
          <input
            type="text"
            placeholder="Adınız"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-vintage-cream placeholder:text-vintage-beige/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <textarea
            placeholder="Yorumunuzu yazın..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-vintage-cream placeholder:text-vintage-beige/30 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary hover:bg-primary/80 text-bg-dark font-bold text-sm px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {submitting ? "Gönderiliyor..." : "Yorum Gönder"}
          </button>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-white/5 border border-white/5 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-xs font-bold">
                  {comment.author[0]?.toUpperCase()}
                </span>
              </div>
              <span className="text-vintage-cream text-sm font-medium">
                {comment.author}
              </span>
              <span className="text-vintage-beige/40 text-xs">
                {timeAgo(new Date(comment.createdAt))}
              </span>
            </div>
            <p className="text-vintage-beige/80 text-sm leading-relaxed">
              {comment.content}
            </p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-vintage-beige/40 text-sm text-center py-4">
            Henüz yorum yok. İlk yorumu siz yazın!
          </p>
        )}
      </div>
    </section>
  );
}
