import Link from "next/link";
import Image from "next/image";

interface NewsItem {
  _id: string;
  slug: string;
  title: string;
  summary?: string;
  image?: string;
  category: string;
  publishedAt?: string;
}

interface Props {
  articles: NewsItem[];
}

const CATEGORY_LABEL: Record<string, string> = {
  news: "News",
  serieA: "Serie A",
  transferMarket: "Mercato",
  internationalTeams: "Internazionale",
};

const CATEGORY_PATH: Record<string, string> = {
  news: "news",
  serieA: "serieA",
  transferMarket: "transfer",
  internationalTeams: "international",
};

function formatDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

export default function HomeNewsStrip({ articles }: Props) {
  if (!articles.length) return null;

  return (
    <section className="py-14 md:py-20" style={{ background: "#080808", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

        {/* Header */}
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-5 h-[1.5px] rounded-full" style={{ background: "#c8f000" }} />
              <span
                className="text-[10px] uppercase tracking-[4px] font-bold"
                style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.7)" }}
              >
                // Ultime Notizie
              </span>
            </div>
            <h2
              className="font-black uppercase leading-none text-white"
              style={{
                fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
                fontSize: "clamp(1.6rem, 4vw, 2.8rem)",
                letterSpacing: "1px",
              }}
            >
              Dal <span style={{ color: "#c8f000" }}>Blog</span>
            </h2>
          </div>
          <Link
            href="/news"
            className="flex-shrink-0 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full transition-colors"
            style={{
              fontFamily: "var(--font-display, sans-serif)",
              color: "#c8f000",
              border: "1px solid rgba(200,240,0,0.35)",
              letterSpacing: "2px",
            }}
          >
            Tutte →
          </Link>
        </div>

        {/* Grid — 2 col mobile, 3 col tablet, 6 col desktop (compact cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {articles.map((article) => {
            const path = CATEGORY_PATH[article.category] ?? "news";
            const label = CATEGORY_LABEL[article.category] ?? "News";
            return (
              <Link
                key={article._id}
                href={`/${path}/${article.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl"
                style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                {/* Thumbnail */}
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
                  {article.image ? (
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    />
                  ) : (
                    <div className="w-full h-full" style={{ background: "#1a1a1a" }} />
                  )}
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7) 100%)" }}
                  />
                  <span
                    className="absolute bottom-2 left-2 text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(200,240,0,0.2)", color: "#c8f000", fontFamily: "var(--font-mono, monospace)" }}
                  >
                    {label}
                  </span>
                </div>

                {/* Title + date */}
                <div className="p-3 flex flex-col gap-1 flex-1">
                  <p
                    className="font-black uppercase text-white leading-tight line-clamp-3 group-hover:text-[#c8f000] transition-colors"
                    style={{
                      fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
                      fontSize: "0.78rem",
                      letterSpacing: "0.3px",
                    }}
                  >
                    {article.title}
                  </p>
                  {article.publishedAt && (
                    <p className="text-white/30 mt-auto" style={{ fontSize: "0.65rem", fontFamily: "var(--font-mono, monospace)" }}>
                      {formatDate(article.publishedAt)}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
