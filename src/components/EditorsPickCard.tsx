"use client";

import Link from "next/link";
import SafeImage from "@/components/SafeImage";

interface EditorsPickCardProps {
  title: string;
  slug: string;
  imageUrl: string;
  category: string;
  categoryColor?: string;
  author: string;
  readTime: number;
  excerpt?: string;
}

export default function EditorsPickCard({
  title,
  slug,
  imageUrl,
  category,
  categoryColor = "#22d3ee",
  author,
  readTime,
  excerpt,
}: EditorsPickCardProps) {
  return (
    <Link href={`/haber/${slug}`} className="block group">
      <article className="flex gap-4 items-start p-4 rounded-xl bg-bg-card/50 border border-white/5 hover:border-primary/20 hover:bg-bg-card transition-all">
        {/* Image */}
        <div className="relative size-24 sm:size-28 rounded-lg overflow-hidden shrink-0 image-zoom">
          <SafeImage
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="112px"
            unoptimized
          />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Category */}
          <span
            className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5 block"
            style={{ color: categoryColor }}
          >
            {category}
          </span>
          
          {/* Title */}
          <h4 className="font-bold text-base sm:text-lg leading-tight group-hover:text-primary transition-colors text-vintage-cream line-clamp-2 mb-2">
            {title}
          </h4>
          
          {/* Excerpt - Desktop only */}
          {excerpt && (
            <p className="hidden sm:block text-vintage-beige/60 text-sm line-clamp-1 mb-3">
              {excerpt}
            </p>
          )}
          
          {/* Meta */}
          <div className="flex items-center gap-3 text-vintage-beige/50 text-xs">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">
                person
              </span>
              <span className="truncate max-w-[80px]">{author}</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-vintage-beige/30" />
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">
                schedule
              </span>
              <span>{readTime} dk</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
