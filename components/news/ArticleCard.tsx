"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { NewsArticle } from "@/types/news";
import { Calendar, Clock } from "lucide-react";

const PLACEHOLDER = "/images/news-placeholder.jpg";

function SafeImage({
  src,
  alt,
  fill,
  className,
  sizes,
  priority,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [imgSrc, setImgSrc] = useState(src || PLACEHOLDER);
  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized
      onError={() => setImgSrc(PLACEHOLDER)}
    />
  );
}

export type ArticleCardVariant = "hero" | "standard" | "compact" | "featured";

interface ArticleCardProps {
  article: NewsArticle;
  variant?: ArticleCardVariant;
  priority?: boolean;
}

function getArticleUrl(article: NewsArticle): string {
  switch (article.category) {
    case "transferMarket": return `/transfer/${article.slug}`;
    case "serieA": return `/serieA/${article.slug}`;
    case "internationalTeams": return `/international/${article.slug}`;
    default: return `/news/${article.slug}`;
  }
}

const CATEGORY_COLORS: Record<string, string> = {
  news: "#c8f000",
  serieA: "#3b82f6",
  transferMarket: "#f59e0b",
  internationalTeams: "#8b5cf6",
  general: "#c8f000",
  transfer: "#f59e0b",
};

function getCategoryLabel(cat: string): string {
  const map: Record<string, string> = {
    news: "News",
    serieA: "Serie A",
    transferMarket: "Mercato",
    internationalTeams: "Nazionale",
    general: "General",
    transfer: "Mercato",
  };
  return map[cat] || cat;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function estimateReadingTime(text?: string): number {
  if (!text) return 3;
  return Math.max(2, Math.ceil(text.split(/\s+/).length / 200));
}

function CategoryPill({ category }: { category: string }) {
  const color = CATEGORY_COLORS[category] || "#c8f000";
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[2px]"
      style={{
        background: color,
        color: color === "#c8f000" ? "#0a0a0a" : "#fff",
        fontFamily: "var(--font-mono, monospace)",
      }}
    >
      {getCategoryLabel(category)}
    </span>
  );
}

// HERO variant: full-width, large image, overlaid text
function HeroCard({ article, priority }: { article: NewsArticle; priority?: boolean }) {
  return (
    <Link
      href={getArticleUrl(article)}
      className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1"
      style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)", minHeight: "440px" }}
    >
      <div className="absolute inset-0">
        <SafeImage
          src={article.image}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="100vw"
          priority={priority}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(10,10,10,0.98) 0%, rgba(10,10,10,0.4) 60%, transparent 100%)" }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-[2px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
          style={{ background: "linear-gradient(90deg, #c8f000, rgba(200,240,0,0.3))" }}
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
        <CategoryPill category={article.category} />
        <h2
          className="mt-3 font-black uppercase leading-[1.05] text-white group-hover:text-[#c8f000] transition-colors"
          style={{
            fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
            fontSize: "clamp(1.8rem, 4vw, 3rem)",
            letterSpacing: "0.5px",
            textShadow: "0 2px 20px rgba(0,0,0,0.5)",
          }}
        >
          {article.title}
        </h2>
        {article.summary && (
          <p
            className="mt-3 text-base leading-relaxed line-clamp-2 max-w-2xl"
            style={{ color: "rgba(245,245,245,0.65)", fontFamily: "var(--font-body, sans-serif)" }}
          >
            {article.summary}
          </p>
        )}
        <div
          className="mt-4 flex items-center gap-4 text-xs uppercase"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(245,245,245,0.4)" }}
        >
          <span>{article.author}</span>
          <span style={{ color: "#c8f000" }}>·</span>
          <span className="flex items-center gap-1">
            <Calendar size={10} className="text-[#c8f000]" />
            {formatDate(article.publishedAt)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={10} className="text-[#c8f000]" />
            {estimateReadingTime(article.summary)} min
          </span>
        </div>
      </div>
    </Link>
  );
}

// STANDARD variant: image top, text below
function StandardCard({ article, priority }: { article: NewsArticle; priority?: boolean }) {
  return (
    <Link
      href={getArticleUrl(article)}
      className="group flex flex-col rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="relative overflow-hidden" style={{ height: "200px" }}>
        <SafeImage
          src={article.image}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
        />
        <div className="absolute top-3 left-3 z-10">
          <CategoryPill category={article.category} />
        </div>
        <div
          className="absolute top-0 left-0 right-0 h-[2px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
          style={{ background: "linear-gradient(90deg, #c8f000, rgba(200,240,0,0.3))" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(17,17,17,0.6) 0%, transparent 60%)" }}
        />
      </div>
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3
          className="font-black uppercase leading-tight text-white group-hover:text-[#c8f000] transition-colors line-clamp-2"
          style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: "1rem", letterSpacing: "0.3px" }}
        >
          {article.title}
        </h3>
        {article.summary && (
          <p
            className="text-sm leading-relaxed line-clamp-2 flex-1"
            style={{ color: "rgba(245,245,245,0.45)", fontFamily: "var(--font-body, sans-serif)" }}
          >
            {article.summary}
          </p>
        )}
        <div
          className="flex items-center gap-3 text-[10px] uppercase mt-1"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "#666" }}
        >
          <span className="flex items-center gap-1">
            <Calendar size={9} className="text-[#c8f000]/60" />
            {formatDate(article.publishedAt)}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock size={9} className="text-[#c8f000]/60" />
            {estimateReadingTime(article.summary)} min
          </span>
        </div>
      </div>
    </Link>
  );
}

// COMPACT variant: small thumbnail left, title+meta right
function CompactCard({ article }: { article: NewsArticle }) {
  return (
    <Link
      href={getArticleUrl(article)}
      className="group flex gap-3 rounded-xl p-3 transition-all duration-200"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0">
        <SafeImage
          src={article.image}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="80px"
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <CategoryPill category={article.category} />
        <h4
          className="font-black uppercase text-xs leading-tight text-white group-hover:text-[#c8f000] transition-colors line-clamp-2"
          style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "0.3px" }}
        >
          {article.title}
        </h4>
        <span
          className="text-[9px] uppercase"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "#555" }}
        >
          {formatDate(article.publishedAt)}
        </span>
      </div>
    </Link>
  );
}

// FEATURED variant: 2/3 width, medium image, more text
function FeaturedCard({ article, priority }: { article: NewsArticle; priority?: boolean }) {
  return (
    <Link
      href={getArticleUrl(article)}
      className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-400 hover:-translate-y-1"
      style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="relative overflow-hidden" style={{ height: "280px" }}>
        <SafeImage
          src={article.image}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 66vw"
          priority={priority}
        />
        <div className="absolute top-4 left-4 z-10">
          <CategoryPill category={article.category} />
        </div>
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(17,17,17,0.95) 0%, transparent 55%)" }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-[2px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
          style={{ background: "linear-gradient(90deg, #c8f000, rgba(200,240,0,0.3))" }}
        />
      </div>
      <div className="p-6 flex flex-col gap-3">
        <h2
          className="font-black uppercase leading-tight text-white text-xl group-hover:text-[#c8f000] transition-colors"
          style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "0.5px" }}
        >
          {article.title}
        </h2>
        {article.summary && (
          <p
            className="text-sm leading-relaxed line-clamp-3"
            style={{ color: "rgba(245,245,245,0.5)", fontFamily: "var(--font-body, sans-serif)" }}
          >
            {article.summary}
          </p>
        )}
        <div
          className="flex items-center gap-4 text-[10px] uppercase"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "#666" }}
        >
          <span>{article.author}</span>
          <span className="flex items-center gap-1">
            <Calendar size={9} className="text-[#c8f000]/60" />
            {formatDate(article.publishedAt)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={9} className="text-[#c8f000]/60" />
            {estimateReadingTime(article.summary)} min
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ArticleCard({ article, variant = "standard", priority }: ArticleCardProps) {
  switch (variant) {
    case "hero":
      return <HeroCard article={article} priority={priority} />;
    case "featured":
      return <FeaturedCard article={article} priority={priority} />;
    case "compact":
      return <CompactCard article={article} />;
    case "standard":
    default:
      return <StandardCard article={article} priority={priority} />;
  }
}
