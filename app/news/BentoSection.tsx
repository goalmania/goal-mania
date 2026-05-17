import Image from "next/image";
import Link from "next/link";
import { NewsArticle } from "@/types/news";
import { Calendar, Clock, ArrowRight } from "lucide-react";

function getArticleUrl(article: NewsArticle): string {
  const slug = article.slug;
  switch (article.category) {
    case "transferMarket": return `/transfer/${slug}`;
    case "serieA": return `/serieA/${slug}`;
    case "internationalTeams": return `/international/${slug}`;
    default: return `/news/${slug}`;
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

function estimateReadingTime(summary?: string): number {
  if (!summary) return 3;
  return Math.max(2, Math.ceil(summary.split(/\s+/).length / 200));
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

interface BentoSectionProps {
  articles: NewsArticle[];
  reverse?: boolean;
}

export default function BentoSection({ articles, reverse = false }: BentoSectionProps) {
  if (!articles.length) return null;

  const [hero, ...rest] = articles;
  const sideArticles = rest.slice(0, 3);
  const bottomArticles = articles.slice(0, 3); // for second row

  return (
    <div className="flex flex-col gap-5">
      {/* ── Top Row: Hero (50%) + 3 side articles ── */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-5 ${reverse ? "lg:grid-flow-col-dense" : ""}`}>

        {/* Hero article — full-height image with gradient overlay */}
        <div className={reverse ? "lg:col-start-2" : ""}>
          <Link
            href={getArticleUrl(hero)}
            className="group relative flex rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1"
            style={{
              background: "#111",
              border: "1px solid rgba(255,255,255,0.06)",
              minHeight: "400px",
            }}
          >
            <Image
              src={hero.image}
              alt={hero.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {/* Deep gradient from bottom */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to top, rgba(10,10,10,0.98) 0%, rgba(10,10,10,0.5) 55%, rgba(10,10,10,0.05) 100%)",
              }}
            />
            {/* Lime hover line */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
              style={{ background: "linear-gradient(90deg, #c8f000, rgba(200,240,0,0.3))" }}
            />

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <CategoryPill category={hero.category} />
              <h2
                className="mt-3 font-black uppercase leading-[1.05] text-white group-hover:text-[#c8f000] transition-colors"
                style={{
                  fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
                  fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                  letterSpacing: "0.5px",
                  textShadow: "0 2px 20px rgba(0,0,0,0.6)",
                }}
              >
                {hero.title}
              </h2>
              {hero.summary && (
                <p
                  className="mt-2 text-sm leading-relaxed line-clamp-2"
                  style={{ color: "rgba(245,245,245,0.6)", fontFamily: "var(--font-body, sans-serif)" }}
                >
                  {hero.summary}
                </p>
              )}
              <div
                className="mt-3 flex items-center gap-3 text-[10px] uppercase"
                style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(245,245,245,0.35)" }}
              >
                <span>{hero.author}</span>
                <span style={{ color: "#c8f000" }}>·</span>
                <span className="flex items-center gap-1">
                  <Calendar size={9} className="text-[#c8f000]" />
                  {formatDate(hero.publishedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={9} className="text-[#c8f000]" />
                  {estimateReadingTime(hero.summary)} min
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Right side: stacked 3 smaller articles */}
        <div className={`flex flex-col gap-3 ${reverse ? "lg:col-start-1 lg:row-start-1" : ""}`}>
          {sideArticles.map((article) => (
            <Link
              key={article.slug}
              href={getArticleUrl(article)}
              className="group flex gap-4 rounded-xl overflow-hidden transition-all duration-300 p-3 flex-1"
              style={{
                background: "#111",
                border: "1px solid rgba(255,255,255,0.06)",
                minHeight: "118px",
              }}
            >
              {/* Thumbnail */}
              <div className="relative w-28 rounded-lg overflow-hidden flex-shrink-0 bg-[#1a1a1a]">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-400 group-hover:scale-110"
                  sizes="112px"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                <CategoryPill category={article.category} />
                <h3
                  className="font-black uppercase leading-tight text-sm text-white line-clamp-2 group-hover:text-[#c8f000] transition-colors"
                  style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "0.3px" }}
                >
                  {article.title}
                </h3>
                <div
                  className="flex items-center gap-2 text-[9px] uppercase"
                  style={{ fontFamily: "var(--font-mono, monospace)", color: "#555" }}
                >
                  <Calendar size={8} className="text-[#c8f000]/50" />
                  {formatDate(article.publishedAt)}
                  <span>·</span>
                  <Clock size={8} className="text-[#c8f000]/50" />
                  {estimateReadingTime(article.summary)} min
                </div>
              </div>
            </Link>
          ))}

          {sideArticles.length < 3 && (
            <Link
              href="/news"
              className="flex items-center justify-center gap-2 rounded-xl py-4 text-[10px] uppercase tracking-widest transition-all hover:border-[#c8f000]/30 hover:text-[#c8f000] flex-1"
              style={{
                fontFamily: "var(--font-mono, monospace)",
                color: "#555",
                border: "1px dashed rgba(255,255,255,0.08)",
              }}
            >
              Vedi tutte le news <ArrowRight size={10} />
            </Link>
          )}
        </div>
      </div>

      {/* ── Bottom Row: 3 equal-width article cards ── */}
      {bottomArticles.length >= 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {bottomArticles.map((article) => (
            <Link
              key={`bottom-${article.slug}`}
              href={getArticleUrl(article)}
              className="group flex flex-col rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="relative overflow-hidden" style={{ height: "170px" }}>
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute top-3 left-3">
                  <CategoryPill category={article.category} />
                </div>
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                  style={{ background: "linear-gradient(90deg, #c8f000, rgba(200,240,0,0.3))" }}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(17,17,17,0.5) 0%, transparent 60%)" }}
                />
              </div>
              <div className="flex flex-col flex-1 p-4 gap-2">
                <h3
                  className="font-black uppercase leading-tight text-sm text-white group-hover:text-[#c8f000] transition-colors line-clamp-2"
                  style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "0.3px" }}
                >
                  {article.title}
                </h3>
                <div
                  className="flex items-center gap-3 text-[9px] uppercase mt-auto"
                  style={{ fontFamily: "var(--font-mono, monospace)", color: "#555" }}
                >
                  <span className="flex items-center gap-1">
                    <Calendar size={8} className="text-[#c8f000]/50" />
                    {formatDate(article.publishedAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={8} className="text-[#c8f000]/50" />
                    {estimateReadingTime(article.summary)} min
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
