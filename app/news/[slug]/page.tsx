import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import { JerseyAdBlock } from "@/app/_components/JerseyAdBlock";
import ArticleContent from "@/app/_components/ArticleContent";
import ReadingProgressBar from "@/app/_components/ReadingProgressBar";

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
    return {
      title: article.title,
      description: article.summary,
      openGraph: {
        title: article.title,
        description: article.summary,
        images: [article.image],
      },
    };
  } catch {
    return { title: "Goal Mania", description: "Latest football news" };
  }
}

async function getArticle(slug: string) {
  try {
    await connectDB();
    const article = await Article.findOne({ slug, category: "news", status: "published" });
    if (!article) return null;
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
  "Udinese","Monza","Empoli","Salernitana","Sassuolo",
  "Arsenal","Chelsea","Liverpool","Manchester City","Manchester United",
  "Tottenham","Newcastle","West Ham","Aston Villa",
  "Real Madrid","Barcelona","Atletico Madrid","Sevilla","Valencia",
  "Bayern","Dortmund","Leipzig","PSG","Paris Saint-Germain","Monaco","Marseille",
  "Portugal","Netherlands","Belgium","France","Spain","Germany",
  "England","Brazil","Argentina","Italia",
];

function extractTeamFromTitle(title: string): string | undefined {
  const lower = title.toLowerCase();
  for (const team of FOOTBALL_TEAMS) {
    if (lower.includes(team.toLowerCase())) return team;
  }
  return undefined;
}

async function getRelatedArticles(articleId: string, title: string) {
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
    return JSON.parse(JSON.stringify(related));
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

  const articleUrl = `https://goal-mania.it/news/${article.slug}`;

  return (
    <div
      style={{
        background: "#0a0a0a",
        color: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
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
          style={{ fontFamily: "var(--font-mono, monospace)", color: "#888" }}
        >
          Home
        </Link>
        <span style={{ color: "#c8f000" }} className="text-xs">/</span>
        <Link
          href="/news"
          className="text-xs uppercase tracking-widest transition-colors hover:text-[#c8f000]"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "#888" }}
        >
          News
        </Link>
        <span style={{ color: "#c8f000" }} className="text-xs">/</span>
        <span
          className="text-xs uppercase tracking-widest truncate max-w-[200px]"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "#555" }}
        >
          {article.title.slice(0, 30)}…
        </span>
      </div>

      {/* ── Hero Section ── */}
      <div className="relative w-full overflow-hidden" style={{ height: "min(65vh, 580px)" }}>
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,10,10,0.1) 0%, rgba(10,10,10,0.5) 50%, rgba(10,10,10,0.98) 100%)",
          }}
        />
        {/* Lime accent line at top of hero */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: "linear-gradient(90deg, transparent, #c8f000, transparent)" }}
        />

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-5xl mx-auto">
          {/* Category tag */}
          <span
            className="inline-block mb-3 px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-widest"
            style={{ background: "#c8f000", fontFamily: "var(--font-mono, monospace)" }}
          >
            // News
          </span>

          {/* Title */}
          <h1
            className="font-black uppercase text-white mb-4 leading-[1.05]"
            style={{
              fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
              fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
              textShadow: "0 2px 30px rgba(0,0,0,0.6)",
              letterSpacing: "0.5px",
            }}
          >
            {article.title}
          </h1>

          {/* Meta */}
          <div
            className="flex items-center gap-4 text-xs uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(245,245,245,0.6)" }}
          >
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            <span style={{ color: "#c8f000" }}>·</span>
            <span>{article.author}</span>
            <span style={{ color: "#c8f000" }}>·</span>
            <span style={{ color: "#c8f000" }}>⏱ 5 min</span>
          </div>
        </div>
      </div>

      {/* ── Main Layout: Content + Sidebar ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">

          {/* ── Article Body ── */}
          <main>
            {/* Summary callout */}
            {article.summary && (
              <div
                className="rounded-2xl p-6 mb-8"
                style={{
                  background: "rgba(200,240,0,0.06)",
                  border: "1px solid rgba(200,240,0,0.2)",
                }}
              >
                <div
                  className="text-xs uppercase tracking-widest mb-2"
                  style={{ fontFamily: "var(--font-mono, monospace)", color: "#c8f000" }}
                >
                  // In Breve
                </div>
                <p className="text-white/80 text-lg leading-relaxed" style={{ fontFamily: "var(--font-body, sans-serif)" }}>
                  {article.summary}
                </p>
              </div>
            )}

            {/* First content block */}
            <div className="article-prose">
              <ArticleContent
                content={contentFirstPart}
                className="prose prose-invert prose-lg max-w-none"
              />
            </div>

            {/* ── Jersey Ad Block ── */}
            <div
              className="my-10 rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #111 0%, rgba(200,240,0,0.05) 100%)",
                border: "1px solid rgba(200,240,0,0.15)",
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

            {/* Second content block */}
            {contentSecondPart && (
              <div className="article-prose">
                <ArticleContent
                  content={contentSecondPart}
                  className="prose prose-invert prose-lg max-w-none"
                />
              </div>
            )}

            {/* ── Article Footer ── */}
            <div
              className="mt-12 pt-6 border-t flex items-center justify-between gap-4 flex-wrap"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm"
                  style={{ background: "#c8f000", fontFamily: "var(--font-display, sans-serif)" }}
                >
                  {article.author?.[0]?.toUpperCase() || "GM"}
                </div>
                <div>
                  <div
                    className="text-xs uppercase tracking-widest mb-0.5"
                    style={{ fontFamily: "var(--font-mono, monospace)", color: "#888" }}
                  >
                    // Autore
                  </div>
                  <div
                    className="text-white font-bold uppercase tracking-wide"
                    style={{ fontFamily: "var(--font-display, sans-serif)" }}
                  >
                    {article.author}
                  </div>
                </div>
              </div>
              <Link
                href="/news"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-bold text-sm uppercase tracking-wider transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{
                  background: "#c8f000",
                  fontFamily: "var(--font-display, sans-serif)",
                  letterSpacing: "2px",
                }}
              >
                ← Tutte le News
              </Link>
            </div>
          </main>

          {/* ── Sticky Sidebar ── */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-5">

              {/* Share widget */}
              <div
                className="rounded-2xl p-5"
                style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div
                  className="text-xs uppercase tracking-widest mb-4 pb-3 border-b flex items-center gap-2"
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    color: "#c8f000",
                    borderColor: "rgba(200,240,0,0.15)",
                  }}
                >
                  <span className="w-3 h-[2px] rounded-full inline-block" style={{ background: "#c8f000" }} />
                  Condividi
                </div>
                {[
                  {
                    label: "Twitter / X",
                    href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(articleUrl)}`,
                    icon: "𝕏",
                  },
                  {
                    label: "Facebook",
                    href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`,
                    icon: "f",
                  },
                  {
                    label: "WhatsApp",
                    href: `https://wa.me/?text=${encodeURIComponent(article.title + " " + articleUrl)}`,
                    icon: "●",
                  },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-btn"
                  >
                    <span className="text-[#c8f000] text-sm w-5 text-center">{s.icon}</span>
                    {s.label}
                  </a>
                ))}
              </div>

              {/* Related articles sidebar */}
              {relatedArticles.length > 0 && (
                <div
                  className="rounded-2xl p-5"
                  style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="text-xs uppercase tracking-widest mb-4 pb-3 border-b flex items-center gap-2"
                    style={{
                      fontFamily: "var(--font-mono, monospace)",
                      color: "#c8f000",
                      borderColor: "rgba(200,240,0,0.15)",
                    }}
                  >
                    <span className="w-3 h-[2px] rounded-full inline-block" style={{ background: "#c8f000" }} />
                    Leggi anche
                  </div>
                  <div className="flex flex-col gap-4">
                    {relatedArticles.slice(0, 4).map((rel: any) => (
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
                            className="text-[10px] uppercase tracking-widest mb-1"
                            style={{ fontFamily: "var(--font-mono, monospace)", color: "#888" }}
                          >
                            {new Date(rel.publishedAt).toLocaleDateString("it-IT")}
                          </div>
                          <h4
                            className="text-xs font-bold uppercase leading-tight transition-colors group-hover:text-[#c8f000] line-clamp-2"
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

              {/* Back to news CTA */}
              <Link
                href="/news"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-white font-bold uppercase tracking-wider text-sm transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{
                  background: "#c8f000",
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

      {/* ── Related Articles — Full Width Grid ── */}
      {relatedArticles.length > 0 && (
        <section
          className="border-t"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-14">
            {/* Section header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span
                  className="w-5 h-[2px] rounded-full inline-block"
                  style={{ background: "#c8f000" }}
                />
                <span
                  className="text-xs uppercase tracking-[4px]"
                  style={{ fontFamily: "var(--font-mono, monospace)", color: "#c8f000" }}
                >
                  // Articoli Correlati
                </span>
              </div>
              <Link
                href="/news"
                className="text-xs uppercase tracking-widest transition-colors hover:text-[#c8f000]"
                style={{ fontFamily: "var(--font-mono, monospace)", color: "#888" }}
              >
                Vedi tutti →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedArticles.map((rel: any, i: number) => (
                <Link
                  key={rel._id}
                  href={`/news/${rel.slug}`}
                  className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-400 hover:-translate-y-2"
                  style={{
                    background: "#111",
                    border: "1px solid rgba(255,255,255,0.06)",
                    transitionDuration: `${350 + i * 50}ms`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,240,0,0.2)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 48px rgba(0,0,0,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={rel.image}
                      alt={rel.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {/* Lime line on hover */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                      style={{ background: "linear-gradient(90deg, #c8f000, rgba(200,240,0,0.3))" }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5 flex flex-col">
                    <div
                      className="text-[10px] uppercase tracking-widest mb-2"
                      style={{ fontFamily: "var(--font-mono, monospace)", color: "#888" }}
                    >
                      {new Date(rel.publishedAt).toLocaleDateString("it-IT", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <h3
                      className="font-black uppercase leading-tight mb-3 transition-colors group-hover:text-[#c8f000] flex-1"
                      style={{
                        fontFamily: "var(--font-display, sans-serif)",
                        fontSize: "1rem",
                        letterSpacing: "0.5px",
                        color: "#f5f5f5",
                      }}
                    >
                      {rel.title}
                    </h3>
                    {rel.summary && (
                      <p
                        className="text-sm leading-relaxed line-clamp-2"
                        style={{ color: "rgba(245,245,245,0.5)", fontFamily: "var(--font-body, sans-serif)" }}
                      >
                        {rel.summary}
                      </p>
                    )}
                    <div
                      className="mt-4 text-xs uppercase tracking-widest transition-colors group-hover:text-[#c8f000]"
                      style={{ fontFamily: "var(--font-mono, monospace)", color: "#555" }}
                    >
                      Leggi →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
