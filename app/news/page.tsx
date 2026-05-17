import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import { NewsArticle } from "@/types/news";
import BentoSection from "./BentoSection";
import { Suspense } from "react";
import { LoadingFallback } from "@/components/shared/loading-fallback";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, ArrowRight, MoveRight } from "lucide-react";
import { Facebook, Twitter, Instagram } from "lucide-react";
import { IconBrandTiktok } from "@tabler/icons-react";

import BreakingNewsTicker from "@/components/news/BreakingNewsTicker";
import LiveScoresTicker from "@/components/news/LiveScoresTicker";
import StandingsWidget from "@/components/news/StandingsWidget";
import ArticleCard from "@/components/news/ArticleCard";
import NewsCategoryTabsClient from "./NewsCategoryTabsClient";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "News Calcio | Goal Mania — Serie A, Champions, Calciomercato",
  description:
    "Tutte le notizie di calcio in tempo reale: Serie A, Champions League, Calciomercato, Nazionale. Il meglio del giornalismo calcistico italiano.",
};

async function getNewsArticles(): Promise<{
  featured: NewsArticle[];
  regular: NewsArticle[];
  all: NewsArticle[];
  byCategory: Record<string, NewsArticle[]>;
}> {
  try {
    await connectDB();

    const featuredArticles = await Article.find({ status: "published", featured: true })
      .sort({ publishedAt: -1 })
      .limit(10)
      .lean();

    const regularArticles = await Article.find({
      status: "published",
      featured: { $ne: true },
    })
      .sort({ publishedAt: -1 })
      .limit(30)
      .lean();

    const serialize = (articles: any[]) => JSON.parse(JSON.stringify(articles));
    const normalize = (a: any): NewsArticle => ({ ...a, tags: a.tags ?? [] });

    const featured = serialize(featuredArticles).map(normalize);
    const regular = serialize(regularArticles).map(normalize);
    const all = [...featured, ...regular];

    // Group by category
    const byCategory: Record<string, NewsArticle[]> = {};
    for (const art of all) {
      if (!byCategory[art.category]) byCategory[art.category] = [];
      byCategory[art.category].push(art);
    }

    return { featured, regular, all, byCategory };
  } catch (error) {
    console.error("Failed to fetch news:", (error as Error).message);
    throw new Error("Unable to fetch news articles.");
  }
}

function SectionHeader({ label, href }: { label: string; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <span className="w-5 h-[2px] rounded-full" style={{ background: "#c8f000" }} />
        <span
          className="text-xs uppercase tracking-[4px] font-black"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "#c8f000" }}
        >
          {label}
        </span>
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest transition-colors hover:text-[#c8f000]"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "#555" }}
        >
          Vedi tutti <ArrowRight size={10} />
        </Link>
      )}
    </div>
  );
}

export default async function NewsPage() {
  let allArticles: NewsArticle[] = [];
  let featuredArticles: NewsArticle[] = [];
  let byCategory: Record<string, NewsArticle[]> = {};
  let errorMessage: string | null = null;

  try {
    const data = await getNewsArticles();
    allArticles = data.all;
    featuredArticles = data.featured;
    byCategory = data.byCategory;
  } catch (error) {
    errorMessage = (error as Error).message;
  }

  // Article slices for sections
  const heroArticle = featuredArticles[0] || allArticles[0];
  const latestArticles = allArticles.slice(0, 12);
  const serieAArticles = (byCategory["serieA"] || allArticles).slice(0, 4);
  const calciomercatoArticles = (byCategory["transferMarket"] || allArticles.slice(4)).slice(0, 3);
  const championsArticles = (byCategory["news"] || allArticles.slice(7)).slice(0, 3);
  const piuLettiArticles = allArticles.slice(0, 5);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <div className="min-h-screen flex flex-col" style={{ background: "#0a0a0a", color: "#f5f5f5" }}>

        {/* ── 1. Breaking News Ticker ── */}
        <BreakingNewsTicker />

        {/* ── 2. Live Scores Ticker ── */}
        <LiveScoresTicker />

        {errorMessage ? (
          <div className="container mx-auto px-4 py-12">
            <Alert variant="destructive" className="max-w-2xl mx-auto">
              <AlertDescription className="text-center">{errorMessage}</AlertDescription>
            </Alert>
          </div>
        ) : (
          <>
            {/* ── 3. Hero Section ── */}
            {heroArticle && (
              <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <ArticleCard article={heroArticle} variant="hero" priority />
              </section>
            )}

            {/* ── Main Magazine Layout ── */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-10">

                {/* ── LEFT: Main Content ── */}
                <div className="min-w-0">

                  {/* ── Le Ultime Notizie + Category Filter ── */}
                  <section className="mb-12">
                    <SectionHeader label="Le Ultime Notizie" />
                    {allArticles.length > 0 && (
                      <NewsCategoryTabsClient articles={latestArticles} />
                    )}
                  </section>

                  {/* ── Bento: In Primo Piano ── */}
                  {allArticles.length >= 4 && (
                    <section className="mb-12">
                      <SectionHeader label="In Primo Piano" />
                      <BentoSection articles={allArticles.slice(0, 4)} />
                    </section>
                  )}

                  {/* ── Serie A ── */}
                  {serieAArticles.length > 0 && (
                    <section className="mb-12">
                      <SectionHeader label="Serie A" href="/news" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {serieAArticles.map((art, i) => (
                          <ArticleCard key={art.slug} article={art} variant="standard" priority={i === 0} />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* ── Calciomercato + Champions Side-by-Side ── */}
                  {(calciomercatoArticles.length > 0 || championsArticles.length > 0) && (
                    <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Calciomercato */}
                      {calciomercatoArticles.length > 0 && (
                        <div>
                          <SectionHeader label="Calciomercato" href="/news" />
                          <div className="flex flex-col gap-3">
                            {calciomercatoArticles.map((art) => (
                              <ArticleCard key={art.slug} article={art} variant="compact" />
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Champions League */}
                      {championsArticles.length > 0 && (
                        <div>
                          <SectionHeader label="Champions League" href="/news" />
                          <div className="flex flex-col gap-3">
                            {championsArticles.map((art) => (
                              <ArticleCard key={art.slug} article={art} variant="compact" />
                            ))}
                          </div>
                        </div>
                      )}
                    </section>
                  )}

                  {/* ── More Sections: Remaining bento blocks ── */}
                  {allArticles.length > 8 && (
                    <section className="space-y-12">
                      {Array.from({ length: Math.ceil((allArticles.length - 8) / 4) }).map((_, i) => {
                        const start = 8 + i * 4;
                        const chunk = allArticles.slice(start, start + 4);
                        if (!chunk.length) return null;
                        return (
                          <BentoSection key={i} articles={chunk} reverse={i % 2 === 1} />
                        );
                      })}
                    </section>
                  )}
                </div>

                {/* ── RIGHT: Sticky Sidebar ── */}
                <aside className="hidden xl:block">
                  <div className="sticky top-24 space-y-6">

                    {/* Più Letti */}
                    {piuLettiArticles.length > 0 && (
                      <div
                        className="rounded-2xl p-5"
                        style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                          <span className="w-3 h-[2px] rounded-full" style={{ background: "#c8f000" }} />
                          <span
                            className="text-[10px] font-black uppercase tracking-[3px]"
                            style={{ fontFamily: "var(--font-mono, monospace)", color: "#c8f000" }}
                          >
                            Più Letti
                          </span>
                        </div>
                        <div className="flex flex-col gap-4">
                          {piuLettiArticles.map((art, i) => (
                            <Link
                              key={art.slug}
                              href={`/news/${art.slug}`}
                              className="flex gap-3 group items-start"
                            >
                              <span
                                className="text-2xl font-black leading-none flex-shrink-0 w-7 text-center"
                                style={{ fontFamily: "var(--font-display, sans-serif)", color: "rgba(200,240,0,0.2)" }}
                              >
                                {String(i + 1).padStart(2, "0")}
                              </span>
                              <div className="flex-1 min-w-0">
                                <h4
                                  className="text-xs font-black uppercase leading-tight text-white/70 group-hover:text-[#c8f000] transition-colors line-clamp-2"
                                  style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "0.3px" }}
                                >
                                  {art.title}
                                </h4>
                                <span
                                  className="text-[9px] uppercase mt-1 block"
                                  style={{ fontFamily: "var(--font-mono, monospace)", color: "#444" }}
                                >
                                  {new Date(art.publishedAt).toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Standings Widget */}
                    <StandingsWidget />

                    {/* Newsletter */}
                    <div
                      className="rounded-2xl p-5 text-center"
                      style={{
                        background: "linear-gradient(135deg, #111 0%, rgba(200,240,0,0.05) 100%)",
                        border: "1px solid rgba(200,240,0,0.15)",
                      }}
                    >
                      <div
                        className="text-[10px] uppercase tracking-[3px] mb-2 flex items-center justify-center gap-2"
                        style={{ fontFamily: "var(--font-mono, monospace)", color: "#c8f000" }}
                      >
                        <Mail size={10} />
                        Newsletter
                      </div>
                      <p className="text-xs text-white/40 mb-4 leading-relaxed">
                        Ricevi le notizie più importanti ogni giorno nella tua casella email
                      </p>
                      <Link href="/shop">
                        <button
                          className="flex items-center mx-auto justify-center gap-2 px-5 py-2.5 rounded-full font-black text-black uppercase text-xs tracking-wider transition-all hover:opacity-90"
                          style={{ background: "#c8f000", fontFamily: "var(--font-display, sans-serif)", letterSpacing: "1.5px" }}
                        >
                          Iscriviti ora
                          <MoveRight className="w-4 h-4" />
                        </button>
                      </Link>
                    </div>

                    {/* Social Follow */}
                    <div
                      className="rounded-2xl p-5"
                      style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-3 h-[2px] rounded-full" style={{ background: "#c8f000" }} />
                        <span
                          className="text-[10px] font-black uppercase tracking-[3px]"
                          style={{ fontFamily: "var(--font-mono, monospace)", color: "#c8f000" }}
                        >
                          Seguici
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { href: "https://facebook.com/goalmania", icon: <Facebook className="w-3.5 h-3.5" />, name: "Facebook" },
                          { href: "https://twitter.com/goalmania", icon: <Twitter className="w-3.5 h-3.5" />, name: "Twitter" },
                          { href: "https://www.instagram.com/goalmania.it", icon: <Instagram className="w-3.5 h-3.5" />, name: "Instagram" },
                          { href: "https://www.tiktok.com/@goalmania.it", icon: <IconBrandTiktok className="w-3.5 h-3.5" />, name: "Tiktok" },
                        ].map((s) => (
                          <a
                            key={s.name}
                            href={s.href}
                            className="flex items-center gap-2 p-2.5 rounded-xl text-white/50 hover:text-[#c8f000] hover:border-[#c8f000]/20 transition-all text-xs font-bold"
                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                          >
                            {s.icon}
                            <span style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "1px", textTransform: "uppercase", fontSize: "0.65rem" }}>
                              {s.name}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>

                  </div>
                </aside>
              </div>
            </div>

            {/* ── Promo Banner ── */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div
                className="flex w-full max-w-4xl mx-auto rounded-2xl overflow-hidden"
                style={{ background: "#111", border: "1px solid rgba(200,240,0,0.15)" }}
              >
                <div className="w-[28%] flex-shrink-0">
                  <Image
                    src="/images/recentUpdate/banner-ads.png"
                    alt="Promotional product"
                    width={300}
                    height={250}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <span
                      className="text-[9px] uppercase tracking-[3px] text-[#c8f000]"
                      style={{ fontFamily: "var(--font-mono, monospace)" }}
                    >
                      // Offerta Speciale
                    </span>
                    <h2
                      className="text-xl lg:text-2xl font-black uppercase text-white leading-tight mt-1"
                      style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "0.5px" }}
                    >
                      Compra la Nuova Maglia Ufficiale
                    </h2>
                    <p className="text-sm text-white/40 mt-1">Spedizione gratuita · Originale Garantito</p>
                  </div>
                  <Link href="/shop">
                    <button
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-black uppercase text-black text-sm transition-all hover:opacity-90 whitespace-nowrap"
                      style={{
                        background: "#c8f000",
                        fontFamily: "var(--font-display, sans-serif)",
                        letterSpacing: "1.5px",
                        boxShadow: "0 4px 20px rgba(200,240,0,0.2)",
                      }}
                    >
                      Vai allo Shop
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Suspense>
  );
}
