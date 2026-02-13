"use client";

import Link from "next/link";
import Image from "next/image";

interface FeaturedArticleProps {
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string;
  author: string;
  readTime: number;
  category: string;
  categoryColor?: string;
}

export default function FeaturedArticle({
  title,
  slug,
  imageUrl,
  author,
  readTime,
  category,
  categoryColor = "#d97706",
}: FeaturedArticleProps) {
  return (
    <Link href={`/haber/${slug}`} className="block group">
      <article className="relative overflow-hidden rounded-2xl bg-bg-card shadow-2xl border border-white/5 card-hover">
        {/* Image Container */}
        <div className="relative h-[400px] sm:h-[450px] image-zoom">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
            unoptimized
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 gradient-overlay" />
          
          {/* Category Badge */}
          <div className="absolute top-5 left-5">
            <span 
              className="badge text-bg-dark shadow-lg"
              style={{ backgroundColor: categoryColor }}
            >
              {category}
            </span>
          </div>

          {/* Featured Badge */}
          <div className="absolute top-5 right-5">
            <span className="badge bg-bg-dark/80 text-primary border border-primary/30 backdrop-blur-sm">
              <span className="material-symbols-outlined text-[12px] mr-1">
                star
              </span>
              Öne Çıkan
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-vintage-cream mb-4 group-hover:text-primary transition-colors line-clamp-3">
            {title}
          </h2>
          
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[16px]">
                  person
                </span>
              </div>
              <span className="font-medium text-vintage-beige">{author}</span>
            </div>
            
            <span className="hidden sm:block w-1 h-1 rounded-full bg-vintage-beige/30" />
            
            <div className="flex items-center gap-1.5 text-vintage-beige/70">
              <span className="material-symbols-outlined text-[16px]">
                schedule
              </span>
              <span>{readTime} dk okuma</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
