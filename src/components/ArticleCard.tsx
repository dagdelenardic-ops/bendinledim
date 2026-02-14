"use client";

import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import SafeImage from "@/components/SafeImage";

interface ArticleCardProps {
  title: string;
  slug: string;
  imageUrl: string;
  category: string;
  categoryColor?: string;
  createdAt: string;
  excerpt?: string;
}

export default function ArticleCard({
  title,
  slug,
  imageUrl,
  category,
  categoryColor = "#22d3ee",
  createdAt,
  excerpt,
}: ArticleCardProps) {
  return (
    <Link
      href={`/haber/${slug}`}
      className="flex-none w-72 lg:w-full snap-start group block"
    >
      <article className="relative overflow-hidden rounded-xl bg-bg-card border border-white/5 card-hover">
        {/* Image */}
        <div className="relative aspect-video image-zoom">
          <SafeImage
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="288px"
            unoptimized
          />
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span 
              className="badge text-bg-dark text-[9px]"
              style={{ backgroundColor: categoryColor }}
            >
              {category}
            </span>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-base leading-snug line-clamp-2 text-vintage-cream group-hover:text-primary transition-colors mb-2">
            {title}
          </h3>
          
          {excerpt && (
            <p className="text-vintage-beige/60 text-sm line-clamp-2 mb-3">
              {excerpt}
            </p>
          )}
          
          <div className="flex items-center gap-2 text-vintage-beige/50 text-xs">
            <span className="material-symbols-outlined text-[14px]">
              schedule
            </span>
            <time dateTime={createdAt}>{timeAgo(new Date(createdAt))}</time>
          </div>
        </div>
      </article>
    </Link>
  );
}
