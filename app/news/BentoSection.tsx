import Image from "next/image";
import Link from "next/link";
import { NewsArticle } from "@/types/news";
import { Calendar, Clock, ArrowRight } from "lucide-react";

function getArticleUrl(article: NewsArticle): string {
  const slug = article.slug;
  switch (article.category) {
    case "transferMarket":
      return `/transfer/${slug}`;
    case "serieA":
      return `/serieA/${slug}`;
    case "internationalTeams":
      return `/international/${slug}`;
    default:
      return `/news/${slug}`;
  }
}

function getCategoryLabel(cat: string): string {
  const map: Record<string, string> = {
    news: "News",
    serieA: "Serie A",
    transferMarket: "Mercato",
    internationalTeams: "Nazionale",
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
  const words = summary.split(/\s+/).length;
  return Math.max(2, Math.ceil(words / 200));
}

interface BentoSectionProps {
  articles: NewsArticle[];
  reverse?: boolean;
}

export default function BentoSection({ articles, reverse = false }: BentoSectionProps) {
  if (!articles.length) return null;

  const [main, ...rest] = articles;
  const sideArticles = rest.slice(0, 3);

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-5 gap-5 ${reverse ? "lg:grid-flow-col-dense" : ""}`}>
      {/* ── Main / Hero Article ── */}
      <div className={`lg:col-span-3 ${reverse ? "lg:col-start-3" : ""}`}>
        <Link
          href={getArticleUrl(main)}
          className="group flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-400 hover:-translate-y-1"
          style={{
            background: "#111",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,240,0,0.2)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 48px rgba(0,0,0,0.5)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
        >
          {/* Image */}
          <div className="relative overflow-hidden" style={{ height: "280px" }}>
            <Image
              src={main.image}
              alt={main.title}
              fill
              className="object-cover transition-transform duration-600 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
            />
            {/* Category pill overlay */}
            <div className="absolute top-4 left-4 z-10">
              <span
                className="inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[3px]"
                style={{
                  background: "#c8f000",
                  color: "#0a0a0a",
                  fontFamily: "var(--font-mono, monospace)",
                }}
              >
                {getCategoryLabel(main.category)}
              </span>
            </div>
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(17,17,17,0.9) 0%, transparent 60%)" }}
            />
            {/* Lime line on hover */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
              style={{ background: "linear-gradient(90deg, #c8f000, rgba(200,240,0,0.3))" }}
            />
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col p-6">
            <h2
              className="font-black uppercase leading-tight text-white text-xl mb-3 group-hover:text-[#c8f000] transition-colors"
              style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "0.5px" }}
            >
              {main.title}
            </h2>
            {main.summary && (
              <p
                className="text-sm leading-relaxed line-clamp-3 mb-4 flex-1"
                style={{ color: "rgba(245,245,245,0.55)", fontFamily: "var(--font-body, sans-serif)" }}
              >
                {main.summary}
              </p>
            )}
            <div className="flex items-center justify-between">
              <div
                className="flex items-center gap-4 text-[10px] uppercase"
                style={{ fontFamily: "var(--font-mono, monospace)", color: "#888" }}
              >
                <span className="flex items-center gap-1.5">
                  <Calendar size={10} className="text-[#c8f000]" />
                  {formatDate(main.publishedAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={10} className="text-[#c8f000]" />
                  {estimateReadingTime(main.summary)} min
                </span>
              </div>
              <span
                className="text-[10px] uppercase tracking-widest flex items-center gap-1 group-hover:text-[#c8f000] transition-colors"
                style={{ fontFamily: "var(--font-mono, monospace)", color: "#555" }}
              >
                Leggi <ArrowRight size={10} />
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* ── Side Articles ── */}
      <div className={`lg:col-span-2 flex flex-col gap-4 ${reverse ? "lg:col-start-1 lg:row-start-1" : ""}`}>
        {sideArticles.map((article) => (
          <Link
            key={article.slug}
            href={getArticleUrl(article)}
            className="group flex gap-4 rounded-xl overflow-hidden transition-all duration-300"
            style={{
              background: "#111",
              border: "1px solid rgba(255,255,255,0.06)",
              padding: "12px",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,240,0,0.18)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
            }}
          >
            {/* Thumbnail */}
            <div className="relative w-24 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-[#1a1a1a]">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-400 group-hover:scale-110"
                sizes="96px"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <span
                className="text-[9px] font-black uppercase tracking-[2px] mb-1.5"
                style={{ fontFamily: "var(--font-mono, monospace)", color: "#c8f000" }}
              >
                {getCategoryLabel(article.category)}
              </span>
              <h3
                className="font-black uppercase leading-tight text-sm text-white line-clamp-2 group-hover:text-[#c8f000] transition-colors"
                style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "0.3px" }}
              >
                {article.title}
              </h3>
              <div
                className="mt-1.5 flex items-center gap-2 text-[9px] uppercase"
                style={{ fontFamily: "var(--font-mono, monospace)", color: "#555" }}
              >
                <Calendar size={8} className="text-[#c8f000]/60" />
                {formatDate(article.publishedAt)}
                <span>·</span>
                <Clock size={8} className="text-[#c8f000]/60" />
                {estimateReadingTime(article.summary)} min
              </div>
            </div>
          </Link>
        ))}

        {sideArticles.length < 3 && (
          <Link
            href="/news"
            className="flex items-center justify-center gap-2 rounded-xl py-4 text-[10px] uppercase tracking-widest transition-all hover:border-[#c8f000]/30 hover:text-[#c8f000]"
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
  );
}
