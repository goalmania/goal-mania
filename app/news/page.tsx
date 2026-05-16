import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import { NewsArticle } from "@/types/news";
import BentoSection from "./BentoSection";
import NewsCarousel from "./NewsCarousel";
import { Suspense } from "react";

import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Mail,
  ArrowRight,
  MoveRight,
} from "lucide-react";
import { IconBrandPinterest, IconBrandTiktok } from "@tabler/icons-react";

import { LoadingFallback } from "@/components/shared/loading-fallback";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Alert, AlertDescription } from "@/components/ui/alert";
import NewsBanner from "@/components/news/NewsBanner";
import PopularNewsGrid from "@/components/news/PopularNewsGrid";
import NewsCategoryTabs from "@/app/_components/NewsCategoryTabs";

// Enable ISR for news listing
export const revalidate = 300;

export const metadata: Metadata = {
  title: "News | Goal Mania",
  description: "Latest football news, Serie A updates, transfers and match analysis from Goal Mania",
};

async function getNewsArticles(): Promise<{
  featured: NewsArticle[];
  regular: NewsArticle[];
  all: NewsArticle[];
}> {
  try {
    await connectDB();

    const featuredArticles = await Article.find({
      status: "published",
      featured: true,
    })
      .sort({ publishedAt: -1 })
      .limit(10)
      .lean();

    const regularArticles = await Article.find({
      status: "published",
      featured: { $ne: true },
    })
      .sort({ publishedAt: -1 })
      .limit(20)
      .lean();

    const serialize = (articles: any[]) => JSON.parse(JSON.stringify(articles));
    const normalize = (a: any): NewsArticle => ({ ...a, tags: a.tags ?? [] });

    const featured = serialize(featuredArticles).map(normalize);
    const regular = serialize(regularArticles).map(normalize);

    return {
      featured,
      regular,
      all: [...featured, ...regular],
    };
  } catch (error) {
    console.error("Failed to fetch news articles:", {
      error: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw new Error("Unable to fetch news articles. Please try again later.");
  }
}

export default async function NewsPage() {
  let allArticles: NewsArticle[] = [];
  let featuredArticles: NewsArticle[] = [];
  let errorMessage: string | null = null;

  try {
    const data = await getNewsArticles();
    allArticles = data.all;
    featuredArticles = data.featured;
  } catch (error) {
    errorMessage = (error as Error).message;
  }

  const MobilebannerData = {
    imageUrl: `/images/recentUpdate/mobile-news.jpg`,
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      <div className="min-h-screen flex flex-col" style={{ background: "#0a0a0a", color: "#f5f5f5" }}>
        {/* Hero banner */}
        <NewsBanner articles={allArticles} imageUrl={MobilebannerData.imageUrl} />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 flex-1">

          {errorMessage ? (
            <Alert variant="destructive" className="max-w-2xl mx-auto">
              <AlertDescription className="text-center">{errorMessage}</AlertDescription>
            </Alert>
          ) : allArticles.length > 0 ? (
            <>
              {/* ── Section header ── */}
              <div className="flex items-center gap-3 mb-6">
                <span className="w-5 h-[2px] rounded-full inline-block" style={{ background: "#c8f000" }} />
                <span
                  className="text-xs uppercase tracking-[4px]"
                  style={{ fontFamily: "var(--font-mono, monospace)", color: "#c8f000" }}
                >
                  // In Primo Piano
                </span>
              </div>

              {/* ── Category tabs (client component) ── */}
              <NewsCategoryTabs articles={allArticles} />

              {/* ── First bento section with sidebar ── */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                <div className="lg:col-span-2">
                  <BentoSection articles={allArticles.slice(0, 4)} />
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Follow Us */}
                  <div className="rounded-2xl p-5" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div
                      className="text-[10px] uppercase tracking-[3px] mb-4 flex items-center gap-2"
                      style={{ fontFamily: "var(--font-mono, monospace)", color: "#c8f000" }}
                    >
                      <span className="w-3 h-[1.5px] rounded-full inline-block" style={{ background: "#c8f000" }} />
                      Seguici
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { href: "https://facebook.com/goalmania", icon: <Facebook className="w-4 h-4" />, name: "Facebook" },
                        { href: "https://twitter.com/goalmania", icon: <Twitter className="w-4 h-4" />, name: "Twitter" },
                        { href: "https://www.instagram.com/goalmania.it", icon: <Instagram className="w-4 h-4" />, name: "Instagram" },
                        { href: "https://www.tiktok.com/@goalmania.it", icon: <IconBrandTiktok className="w-4 h-4" />, name: "Tiktok" },
                      ].map((s) => (
                        <a
                          key={s.name}
                          href={s.href}
                          className="flex items-center gap-2 p-2.5 rounded-xl text-white/60 hover:text-[#c8f000] hover:border-[#c8f000]/20 transition-all text-xs font-bold"
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                        >
                          {s.icon}
                          <span style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "1px", textTransform: "uppercase", fontSize: "0.7rem" }}>
                            {s.name}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Newsletter */}
                  <div
                    className="rounded-2xl p-5 text-center"
                    style={{
                      background: "linear-gradient(135deg, #111 0%, rgba(200,240,0,0.04) 100%)",
                      border: "1px solid rgba(200,240,0,0.15)",
                    }}
                  >
                    <div
                      className="text-[10px] uppercase tracking-[3px] mb-3 flex items-center justify-center gap-2"
                      style={{ fontFamily: "var(--font-mono, monospace)", color: "#c8f000" }}
                    >
                      <Mail size={10} />
                      Newsletter Giornaliera
                    </div>
                    <p className="text-xs text-white/40 mb-4 leading-relaxed">
                      Ricevi tutte le notizie più importanti dal mondo del calcio
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

                  {/* Featured article mini-list */}
                  {featuredArticles.slice(4, 7).length > 0 && (
                    <div className="rounded-2xl p-5" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div
                        className="text-[10px] uppercase tracking-[3px] mb-4 flex items-center gap-2"
                        style={{ fontFamily: "var(--font-mono, monospace)", color: "#c8f000" }}
                      >
                        <span className="w-3 h-[1.5px] rounded-full inline-block" style={{ background: "#c8f000" }} />
                        Più Letti
                      </div>
                      <div className="flex flex-col gap-4">
                        {featuredArticles.slice(4, 7).map((art, i) => (
                          <Link
                            key={art.slug}
                            href={`/news/${art.slug}`}
                            className="flex gap-3 group"
                          >
                            <span
                              className="text-2xl font-black leading-none flex-shrink-0 w-6"
                              style={{ fontFamily: "var(--font-display, sans-serif)", color: "rgba(200,240,0,0.2)" }}
                            >
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <h4
                              className="text-xs font-bold uppercase leading-tight text-white/70 group-hover:text-[#c8f000] transition-colors line-clamp-2"
                              style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "0.3px" }}
                            >
                              {art.title}
                            </h4>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Remaining sections ── */}
              <div className="flex flex-col gap-12">
                {Array.from({ length: Math.ceil((allArticles.length - 4) / 4) }).map((_, i) => {
                  const start = 4 + i * 4;
                  const sectionArticles = allArticles.slice(start, start + 4);
                  if (!sectionArticles.length) return null;
                  return (
                    <BentoSection key={i} articles={sectionArticles} reverse={i % 2 === 1} />
                  );
                })}
              </div>
            </>
          ) : (
            <Alert variant="destructive" className="max-w-2xl mx-auto">
              <AlertDescription className="text-center">
                Nessun articolo trovato.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Popular grid */}
        <div className="py-8 bg-[#0a0a0a]">
          <PopularNewsGrid />
        </div>

        {/* Promo banner */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex w-full max-w-4xl mx-auto rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid rgba(200,240,0,0.15)" }}>
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
                  style={{ background: "#c8f000", fontFamily: "var(--font-display, sans-serif)", letterSpacing: "1.5px", boxShadow: "0 4px 20px rgba(200,240,0,0.2)" }}
                >
                  Vai allo Shop
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        <NewsCarousel articles={allArticles} />
      </div>
    </Suspense>
  );
}
