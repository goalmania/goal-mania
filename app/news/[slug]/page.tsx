import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import { JerseyAdBlock } from "@/app/_components/JerseyAdBlock";
import ArticleContent from "@/app/_components/ArticleContent";
import ReadingProgressBar from "@/app/_components/ReadingProgressBar";
import ArticleCard from "@/components/news/ArticleCard";
import { NewsArticle } from "@/types/news";
import { Calendar, Clock, BookOpen, Share2, Bookmark, ChevronLeft } from "lucide-react";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    await connectDB();
    const article = await Article.findOne({ slug, category: "news" });
    if (!article) return { title: "Article Not Found" };

    const canonicalUrl = `https://goal-mania.it/news/${slug}`;
    const publishedAt = article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined;

    return {
      title: `${article.title} | Goal Mania`,
      description: article.summary,
      keywords: article.seoKeywords?.join(", ") ?? undefined,
      authors: [{ name: article.author ?? "Redazione Goalmania", url: "https://goal-mania.it" }],
      robots: { index: true, follow: true },
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: article.title,
        description: article.summary,
        url: canonicalUrl,
        siteName: "Goal Mania",
        images: [{ url: article.image, width: 1200, height: 630, alt: article.title }],
        type: "article",
        publishedTime: publishedAt,
        authors: ["https://goal-mania.it"],
        section: "News Calcio",
      },
      twitter: {
        card: "summary_large_image",
        site: "@goalmania",
        title: article.title,
        description: article.summary,
        images: [article.image],
      },
    };
  } catch {
    return { title: "Goal Mania", description: "Ultime notizie calcio" };
  }
}

const CATEGORY_TO_PATH: Record<string, string> = {
  transferMarket: "transfer",
  serieA: "serieA",
  internationalTeams: "international",
  news: "news",
};

async function getArticle(slug: string) {
  try {
    await connectDB();
    const article = await Article.findOne({ slug, category: "news", status: "published" });
    if (!article) {
      // Cross-category fallback: article may have been shared with wrong URL
      const anyArticle = await Article.findOne({ slug, status: "published" });
      if (anyArticle) {
        const section = CATEGORY_TO_PATH[anyArticle.category] ?? "news";
        if (section !== "news") redirect(`/${section}/${slug}`);
      }
      return null;
    }
    return JSON.parse(JSON.stringify(article));
  } catch {
    return null;
  }
}

const STOP_WORDS = new Set([
  "della","dello","degli","delle","nella","nelle","negli",
  "con","per","che","una","uno","the","and","for","dal",
  "dopo","prima","come","quando","dove","cosa","chi","suo","sua",
]);

function extractKeywords(title: string): string[] {
  return title.toLowerCase().split(/\s+/).filter((w) => w.length > 3 && !STOP_WORDS.has(w)).slice(0, 3);
}

const FOOTBALL_TEAMS = [
  "Juventus","Juve","Inter","Milan","Napoli","Roma","Lazio","Atalanta",
  "Fiorentina","Torino","Bologna","Verona","Cagliari","Lecce","Genoa",
  "Udinese","Monza","Empoli","Arsenal","Chelsea","Liverpool","Manchester City",
  "Manchester United","Tottenham","Real Madrid","Barcelona","Atletico Madrid",
  "Bayern","Dortmund","PSG","Monaco",
];

function extractTeamFromTitle(title: string): string | undefined {
  const lower = title.toLowerCase();
  for (const team of FOOTBALL_TEAMS) {
    if (lower.includes(team.toLowerCase())) return team;
  }
  return undefined;
}

async function getRelatedArticles(articleId: string, title: string): Promise<NewsArticle[]> {
  try {
    await connectDB();
    const keywords = extractKeywords(title);
    let related: any[] = [];
    if (keywords.length > 0) {
      related = await Article.find({
        category: "news", status: "published",
        _id: { $ne: articleId },
        $or: keywords.map((kw) => ({ title: { $regex: kw, $options: "i" } })),
      }).sort({ publishedAt: -1 }).limit(3).lean();
    }
    if (related.length < 3) {
      const filler = await Article.find({
        category: "news", status: "published",
        _id: { $nin: [articleId, ...related.map((a) => a._id)] },
      }).sort({ publishedAt: -1 }).limit(3 - related.length).lean();
      related = [...related, ...filler];
    }
    return JSON.parse(JSON.stringify(related)).map((a: any) => ({ ...a, tags: a.tags ?? [] }));
  } catch {
    return [];
  }
}

function splitContentForAd(content: string): string[] {
  const isHtml = content.trim().startsWith("<");
  if (isHtml) {
    const parts = content.split(/(?<=<\/p>)/);
    if (parts.length <= 2) return [content, ""];
    const mid = Math.floor(parts.length / 2);
    return [parts.slice(0, mid).join(""), parts.slice(mid).join("")];
  }
  const paragraphs = content.split("\n\n");
  if (paragraphs.length <= 2) return [content, ""];
  const mid = Math.floor(paragraphs.length / 2);
  return [paragraphs.slice(0, mid).join("\n\n"), paragraphs.slice(mid).join("\n\n")];
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("it-IT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function estimateReadingTime(content?: string): number {
  if (!content) return 5;
  return Math.max(2, Math.ceil(content.split(/\s+/).length / 200));
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const relatedArticles = await getRelatedArticles(article._id, article.title);
  const teamHint = extractTeamFromTitle(article.title);
  const [contentFirstPart, contentSecondPart] = splitContentForAd(article.content);
  const readingTime = estimateReadingTime(article.content);

  const articleUrl = `https://goal-mania.it/news/${article.slug}`;

  // JSON-LD NewsArticle schema — critico per Google Rich Results e AI search (GEO)
  const newsArticleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.summary,
    image: article.image ? [article.image] : [],
    datePublished: article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
    dateModified: article.updatedAt
      ? new Date(article.updatedAt).toISOString()
      : article.publishedAt
      ? new Date(article.publishedAt).toISOString()
      : undefined,
    author: {
      "@type": "Organization",
      name: article.author ?? "Redazione Goalmania",
      url: "https://goal-mania.it",
    },
    publisher: {
      "@type": "Organization",
      name: "Goal Mania",
      url: "https://goal-mania.it",
      logo: {
        "@type": "ImageObject",
        url: "https://goal-mania.it/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    keywords: article.seoKeywords?.join(", ") ?? "calcio, serie a, notizie calcio",
    articleSection: "News Calcio",
    inLanguage: "it-IT",
  };

  // BreadcrumbList schema
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://goal-mania.it" },
      { "@type": "ListItem", position: 2, name: "News", item: "https://goal-mania.it/news" },
      { "@type": "ListItem", position: 3, name: article.title, item: articleUrl },
    ],
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(articleUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(article.title + " " + articleUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(article.title)}`,
  };

  return (
    <div style={{ background: "#0a0a0a", color: "#f5f5f5", minHeight: "100vh" }}>
      {/* JSON-LD structured data — NewsArticle + BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Reading progress bar */}
      <ReadingProgressBar />

      {/* ── Breadcrumb ── */}
      <div
        className="border-b px-6 md:px-10 py-3 flex items-center gap-2"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <Link
          href="/"
          className="text-xs uppercase tracking-widest transition-colors hover:text-[#c8f000]"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "#555" }}
        >
          Home
        </Link>
        <span style={{ color: "#c8f000" }} className="text-xs">/</span>
        <Link
          href="/news"
          className="text-xs uppercase tracking-widest transition-colors hover:text-[#c8f000]"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "#555" }}
        >
          News
        </Link>
        <span style={{ color: "#c8f000" }} className="text-xs">/</span>
        <span
          className="text-xs uppercase tracking-widest truncate max-w-[200px]"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "#333" }}
        >
          {article.title.slice(0, 30)}…
        </span>
      </div>

      {/* ── Hero: Full-width image + title overlay ── */}
      <div className="relative w-full overflow-hidden" style={{ height: "min(70vh, 600px)" }}>
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Multi-layered gradient for dramatic effect */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(10,10,10,0.05) 0%, rgba(10,10,10,0.3) 40%, rgba(10,10,10,0.98) 100%)",
          }}
        />
        {/* Lime accent bar top */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: "linear-gradient(90deg, transparent, #c8f000 30%, #c8f000 70%, transparent)" }}
        />

        {/* Hero content overlaid at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-8 max-w-5xl">
          {/* Category tag */}
          <span
            className="inline-block mb-4 px-3 py-1 rounded-full text-[#0a0a0a] text-[10px] font-black uppercase tracking-[3px]"
            style={{ background: "#c8f000", fontFamily: "var(--font-mono, monospace)" }}
          >
            News
          </span>

          {/* Article title */}
          <h1
            className="font-black uppercase text-white mb-5 leading-[1.03]"
            style={{
              fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
              fontSize: "clamp(2rem, 5.5vw, 4rem)",
              textShadow: "0 2px 40px rgba(0,0,0,0.7)",
              letterSpacing: "0.5px",
            }}
          >
            {article.title}
          </h1>

          {/* Article meta */}
          <div className="flex items-center flex-wrap gap-4">
            {/* Author avatar + name */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-black text-black text-sm flex-shrink-0"
                style={{ background: "#c8f000", fontFamily: "var(--font-display, sans-serif)" }}
              >
                {article.author?.[0]?.toUpperCase() || "G"}
              </div>
              <div>
                <div
                  className="text-xs font-black uppercase text-white"
                  style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "0.5px" }}
                >
                  {article.author}
                </div>
                <div
                  className="text-[9px] uppercase"
                  style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(245,245,245,0.4)" }}
                >
                  Redazione Goal Mania
                </div>
              </div>
            </div>

            <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>

            <time
              dateTime={article.publishedAt}
              className="flex items-center gap-1.5 text-xs uppercase"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(245,245,245,0.5)" }}
            >
              <Calendar size={11} style={{ color: "#c8f000" }} />
              {formatDate(article.publishedAt)}
            </time>

            <div
              className="flex items-center gap-1.5 text-xs uppercase"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(245,245,245,0.5)" }}
            >
              <Clock size={11} style={{ color: "#c8f000" }} />
              {readingTime} min di lettura
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-[60px_1fr_320px] gap-0 lg:gap-6 xl:gap-10">

          {/* ── LEFT: Sticky Share Bar (desktop) ── */}
          <div className="hidden lg:block">
            <div className="sticky top-28 flex flex-col items-center gap-3">
              {/* Share label */}
              <span
                className="text-[8px] uppercase tracking-[3px] rotate-180 writing-mode-vertical"
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  color: "rgba(255,255,255,0.2)",
                  writingMode: "vertical-rl",
                  marginBottom: "8px",
                }}
              >
                Condividi
              </span>

              {/* Twitter */}
              <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                title="Condividi su Twitter"
                className="share-icon-btn group"
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                𝕏
              </a>

              {/* Facebook */}
              <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                title="Condividi su Facebook"
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                f
              </a>

              {/* WhatsApp */}
              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                title="Condividi su WhatsApp"
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "13px",
                }}
              >
                WA
              </a>

              {/* Telegram */}
              <a
                href={shareLinks.telegram}
                target="_blank"
                rel="noopener noreferrer"
                title="Condividi su Telegram"
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "13px",
                }}
              >
                TG
              </a>

              {/* Divider */}
              <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.08)" }} />

              {/* Bookmark */}
              <button
                title="Salva articolo"
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "rgba(200,240,0,0.06)",
                  border: "1px solid rgba(200,240,0,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  color: "#c8f000",
                  cursor: "pointer",
                }}
              >
                <Bookmark size={16} />
              </button>
            </div>
          </div>

          {/* ── CENTER: Article Body ── */}
          <main className="min-w-0">
            {/* Summary callout */}
            {article.summary && (
              <div
                className="rounded-2xl p-6 mb-8"
                style={{
                  background: "rgba(200,240,0,0.05)",
                  border: "1px solid rgba(200,240,0,0.18)",
                }}
              >
                <div
                  className="text-xs uppercase tracking-widest mb-2 flex items-center gap-2"
                  style={{ fontFamily: "var(--font-mono, monospace)", color: "#c8f000" }}
                >
                  <BookOpen size={12} />
                  In Breve
                </div>
                <p
                  className="text-white/80 leading-relaxed"
                  style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "17px", lineHeight: "1.8" }}
                >
                  {article.summary}
                </p>
              </div>
            )}

            {/* First content block */}
            <div
              className="article-prose article-dropcap"
              style={{ fontSize: "18px", lineHeight: "1.85", fontFamily: "var(--font-body, sans-serif)" }}
            >
              <ArticleContent
                content={contentFirstPart}
                className="prose prose-invert prose-lg max-w-none prose-p:leading-[1.85] prose-p:text-white/80 prose-h2:font-black prose-h2:uppercase prose-h2:text-[#c8f000] prose-a:text-[#c8f000]"
              />
            </div>

            {/* Pull quote (if article is long enough) */}
            {article.summary && (
              <blockquote
                className="my-10 pl-6 py-2"
                style={{
                  borderLeft: "4px solid #c8f000",
                  background: "rgba(200,240,0,0.03)",
                  borderRadius: "0 12px 12px 0",
                }}
              >
                <p
                  className="text-xl italic leading-relaxed"
                  style={{
                    fontFamily: "var(--font-body, sans-serif)",
                    color: "rgba(245,245,245,0.85)",
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;{article.summary}&rdquo;
                </p>
              </blockquote>
            )}

            {/* Jersey Ad Block */}
            <div
              className="my-10 rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #111 0%, rgba(200,240,0,0.04) 100%)",
                border: "1px solid rgba(200,240,0,0.12)",
              }}
            >
              <div className="px-5 py-3 border-b" style={{ borderColor: "rgba(200,240,0,0.1)" }}>
                <span
                  className="text-xs uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-mono, monospace)", color: "#c8f000" }}
                >
                  // Maglia Correlata
                </span>
              </div>
              <div className="p-5">
                <JerseyAdBlock jerseyId={article.featuredJerseyId} teamHint={teamHint} />
              </div>
            </div>

            {/* Related article inline (after ad) */}
            {relatedArticles[0] && (
              <div className="my-8">
                <div
                  className="text-[9px] uppercase tracking-[3px] mb-3 flex items-center gap-2"
                  style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.2)" }}
                >
                  <span className="w-3 h-[1px]" style={{ background: "rgba(255,255,255,0.2)" }} />
                  Correlati
                </div>
                <Link
                  href={`/news/${relatedArticles[0].slug}`}
                  className="group flex gap-4 rounded-xl p-3 transition-all duration-200 hover:border-[#c8f000]/20"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="relative w-24 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={relatedArticles[0].image}
                      alt={relatedArticles[0].title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="96px"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <span
                      className="text-[9px] uppercase tracking-widest mb-1"
                      style={{ fontFamily: "var(--font-mono, monospace)", color: "#c8f000" }}
                    >
                      Leggi anche
                    </span>
                    <h4
                      className="font-black uppercase text-sm leading-tight text-white group-hover:text-[#c8f000] transition-colors line-clamp-2"
                      style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "0.3px" }}
                    >
                      {relatedArticles[0].title}
                    </h4>
                    <span
                      className="text-[9px] uppercase mt-1"
                      style={{ fontFamily: "var(--font-mono, monospace)", color: "#444" }}
                    >
                      {new Date(relatedArticles[0].publishedAt).toLocaleDateString("it-IT")}
                    </span>
                  </div>
                </Link>
              </div>
            )}

            {/* Second content block */}
            {contentSecondPart && (
              <div
                className="article-prose"
                style={{ fontSize: "18px", lineHeight: "1.85", fontFamily: "var(--font-body, sans-serif)" }}
              >
                <ArticleContent
                  content={contentSecondPart}
                  className="prose prose-invert prose-lg max-w-none prose-p:leading-[1.85] prose-p:text-white/80 prose-h2:font-black prose-h2:uppercase prose-h2:text-[#c8f000] prose-a:text-[#c8f000]"
                />
              </div>
            )}

            {/* Mobile share bar */}
            <div className="lg:hidden mt-8 mb-4">
              <p
                className="text-[9px] uppercase tracking-[3px] mb-3 flex items-center gap-2"
                style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.3)" }}
              >
                <Share2 size={10} />
                Condividi questo articolo
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Twitter", href: shareLinks.twitter },
                  { label: "Facebook", href: shareLinks.facebook },
                  { label: "WhatsApp", href: shareLinks.whatsapp },
                  { label: "Telegram", href: shareLinks.telegram },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:border-[#c8f000]/30 hover:text-[#c8f000]"
                    style={{
                      fontFamily: "var(--font-display, sans-serif)",
                      letterSpacing: "1px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>

            {/* ── Article Footer ── */}
            <div className="mt-12 pt-8 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              {/* Author bio card */}
              <div
                className="flex items-start gap-4 p-6 rounded-2xl mb-8"
                style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center font-black text-black text-xl flex-shrink-0"
                  style={{ background: "#c8f000", fontFamily: "var(--font-display, sans-serif)" }}
                >
                  {article.author?.[0]?.toUpperCase() || "G"}
                </div>
                <div className="flex-1">
                  <div
                    className="text-[9px] uppercase tracking-[3px] mb-1"
                    style={{ fontFamily: "var(--font-mono, monospace)", color: "#c8f000" }}
                  >
                    // Autore
                  </div>
                  <div
                    className="text-white font-black uppercase tracking-wide text-lg mb-1"
                    style={{ fontFamily: "var(--font-display, sans-serif)" }}
                  >
                    {article.author}
                  </div>
                  <p className="text-sm text-white/40 leading-relaxed" style={{ fontFamily: "var(--font-body, sans-serif)" }}>
                    Giornalista della redazione di Goal Mania. Segue il calcio italiano ed europeo con passione da oltre 10 anni. Specializzato in calciomercato e tattica.
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    {["Twitter", "Instagram"].map((sn) => (
                      <a
                        key={sn}
                        href="#"
                        className="text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-full transition-all hover:text-[#c8f000] hover:border-[#c8f000]/30"
                        style={{
                          fontFamily: "var(--font-mono, monospace)",
                          color: "rgba(255,255,255,0.3)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        {sn}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comments placeholder */}
              <div
                className="rounded-2xl p-8 text-center"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px dashed rgba(255,255,255,0.08)",
                }}
              >
                <div
                  className="text-[10px] uppercase tracking-[3px] mb-2"
                  style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.2)" }}
                >
                  // Commenti
                </div>
                <p
                  className="text-sm font-black uppercase text-white/30 mb-1"
                  style={{ fontFamily: "var(--font-display, sans-serif)" }}
                >
                  Sezione Commenti — Prossimamente
                </p>
                <p className="text-xs text-white/20" style={{ fontFamily: "var(--font-body, sans-serif)" }}>
                  I commenti saranno disponibili presto. Seguici sui social per interagire!
                </p>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-4 flex-wrap mt-8">
                <Link
                  href="/news"
                  className="flex items-center gap-2 text-xs uppercase tracking-widest transition-colors hover:text-[#c8f000]"
                  style={{ fontFamily: "var(--font-mono, monospace)", color: "#666" }}
                >
                  <ChevronLeft size={14} /> Tutte le News
                </Link>
                <Link
                  href="/news"
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-black font-bold text-sm uppercase tracking-wider transition-all hover:opacity-90 hover:-translate-y-0.5"
                  style={{
                    background: "#c8f000",
                    fontFamily: "var(--font-display, sans-serif)",
                    letterSpacing: "2px",
                    boxShadow: "0 4px 20px rgba(200,240,0,0.25)",
                  }}
                >
                  Più News →
                </Link>
              </div>
            </div>
          </main>

          {/* ── RIGHT: Sticky Sidebar ── */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-5">

              {/* Table of contents placeholder */}
              <div
                className="rounded-2xl p-5"
                style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div
                  className="text-xs uppercase tracking-widest mb-4 pb-3 border-b flex items-center gap-2"
                  style={{ fontFamily: "var(--font-mono, monospace)", color: "#c8f000", borderColor: "rgba(200,240,0,0.12)" }}
                >
                  <span className="w-3 h-[2px] rounded-full" style={{ background: "#c8f000" }} />
                  In questo articolo
                </div>
                <div className="flex flex-col gap-2">
                  {[article.title.split(" ").slice(0, 4).join(" "), "Analisi e Commento", "Conclusioni"].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-xs"
                      style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body, sans-serif)" }}
                    >
                      <span style={{ color: "#c8f000", flexShrink: 0, marginTop: "2px", fontFamily: "var(--font-mono, monospace)", fontSize: "10px" }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Share widget */}
              <div
                className="rounded-2xl p-5"
                style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div
                  className="text-xs uppercase tracking-widest mb-4 pb-3 border-b flex items-center gap-2"
                  style={{ fontFamily: "var(--font-mono, monospace)", color: "#c8f000", borderColor: "rgba(200,240,0,0.12)" }}
                >
                  <span className="w-3 h-[2px] rounded-full" style={{ background: "#c8f000" }} />
                  Condividi
                </div>
                {[
                  { label: "Twitter / X", href: shareLinks.twitter, icon: "𝕏" },
                  { label: "Facebook", href: shareLinks.facebook, icon: "f" },
                  { label: "WhatsApp", href: shareLinks.whatsapp, icon: "●" },
                  { label: "Telegram", href: shareLinks.telegram, icon: "✈" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl mb-2 text-xs font-bold uppercase tracking-wider transition-all hover:border-[#c8f000]/20 hover:text-[#c8f000]"
                    style={{
                      fontFamily: "var(--font-display, sans-serif)",
                      letterSpacing: "1px",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    <span style={{ color: "#c8f000", fontSize: "14px", width: "20px", textAlign: "center" }}>{s.icon}</span>
                    {s.label}
                  </a>
                ))}
              </div>

              {/* Related articles */}
              {relatedArticles.length > 0 && (
                <div
                  className="rounded-2xl p-5"
                  style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="text-xs uppercase tracking-widest mb-4 pb-3 border-b flex items-center gap-2"
                    style={{ fontFamily: "var(--font-mono, monospace)", color: "#c8f000", borderColor: "rgba(200,240,0,0.12)" }}
                  >
                    <span className="w-3 h-[2px] rounded-full" style={{ background: "#c8f000" }} />
                    Più letti oggi
                  </div>
                  <div className="flex flex-col gap-4">
                    {relatedArticles.slice(0, 4).map((rel) => (
                      <Link
                        key={rel._id}
                        href={`/news/${rel.slug}`}
                        className="flex gap-3 group"
                      >
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                          <Image
                            src={rel.image}
                            alt={rel.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-[9px] uppercase tracking-widest mb-1"
                            style={{ fontFamily: "var(--font-mono, monospace)", color: "#555" }}
                          >
                            {new Date(rel.publishedAt).toLocaleDateString("it-IT")}
                          </div>
                          <h4
                            className="text-xs font-black uppercase leading-tight transition-colors group-hover:text-[#c8f000] line-clamp-2"
                            style={{ fontFamily: "var(--font-display, sans-serif)", color: "#f5f5f5", letterSpacing: "0.5px" }}
                          >
                            {rel.title}
                          </h4>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter widget */}
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
                  Newsletter
                </div>
                <p className="text-xs text-white/35 mb-4 leading-relaxed">
                  Le notizie più importanti ogni giorno
                </p>
                <Link href="/shop">
                  <button
                    className="flex items-center mx-auto justify-center gap-2 px-5 py-2.5 rounded-full font-black text-black uppercase text-xs tracking-wider transition-all hover:opacity-90"
                    style={{ background: "#c8f000", fontFamily: "var(--font-display, sans-serif)", letterSpacing: "1.5px" }}
                  >
                    Iscriviti
                  </button>
                </Link>
              </div>

              {/* Back to news */}
              <Link
                href="/news"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold uppercase tracking-wider text-sm transition-all hover:opacity-90"
                style={{
                  background: "#c8f000",
                  color: "#0a0a0a",
                  fontFamily: "var(--font-display, sans-serif)",
                  letterSpacing: "2px",
                  boxShadow: "0 4px 20px rgba(200,240,0,0.2)",
                }}
              >
                Tutte le Notizie →
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* ── "Ti Potrebbe Interessare" — 3 article cards ── */}
      {relatedArticles.length > 0 && (
        <section className="border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-14">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="w-5 h-[2px] rounded-full" style={{ background: "#c8f000" }} />
                <span
                  className="text-xs uppercase tracking-[4px]"
                  style={{ fontFamily: "var(--font-mono, monospace)", color: "#c8f000" }}
                >
                  // Ti Potrebbe Interessare
                </span>
              </div>
              <Link
                href="/news"
                className="text-xs uppercase tracking-widest transition-colors hover:text-[#c8f000]"
                style={{ fontFamily: "var(--font-mono, monospace)", color: "#555" }}
              >
                Vedi tutti →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedArticles.map((rel) => (
                <ArticleCard key={rel._id} article={rel} variant="standard" />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
