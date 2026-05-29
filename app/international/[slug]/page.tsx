import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import ArticleContent from "@/app/_components/ArticleContent";
import { JerseyAdBlock } from "@/app/_components/JerseyAdBlock";

const INTL_TEAMS = [
  "Arsenal", "Chelsea", "Liverpool", "Manchester City", "Manchester United",
  "Tottenham", "Newcastle", "West Ham", "Aston Villa",
  "Real Madrid", "Barcelona", "Atletico Madrid", "Sevilla", "Valencia",
  "Bayern", "Dortmund", "Leipzig", "PSG", "Paris Saint-Germain",
  "Portugal", "Netherlands", "Belgium", "France", "Spain", "Germany",
  "England", "Brazil", "Argentina", "Italia",
];

function extractTeamFromTitle(title: string): string | undefined {
  const lower = title.toLowerCase();
  for (const team of INTL_TEAMS) {
    if (lower.includes(team.toLowerCase())) return team;
  }
  return undefined;
}

// Enable ISR for international article pages
export const revalidate = 300;

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    await connectDB();

    const article = await Article.findOne({
      slug: slug,
      category: "internationalTeams",
    });

    if (!article) {
      return {
        title: "Article Not Found",
        description:
          "The article you are looking for does not exist or has been removed.",
      };
    }

    const canonicalUrl = `https://goal-mania.it/international/${slug}`;
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
        section: "Calcio Internazionale",
      },
      twitter: {
        card: "summary_large_image",
        site: "@goalmania",
        title: article.title,
        description: article.summary,
        images: [article.image],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Goal Mania",
      description: "Ultime notizie calcio internazionale",
    };
  }
}

// Function to get the article data
async function getArticle(slug: string) {
  try {
    await connectDB();

    const article = await Article.findOne({
      slug: slug,
      category: "internationalTeams",
      status: "published",
    });

    if (!article) return null;

    return JSON.parse(JSON.stringify(article));
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

// Get related articles
async function getRelatedArticles(articleId: string) {
  try {
    await connectDB();

    const relatedArticles = await Article.find({
      category: "internationalTeams",
      status: "published",
      _id: { $ne: articleId },
    })
      .sort({ publishedAt: -1 })
      .limit(3);

    return JSON.parse(JSON.stringify(relatedArticles));
  } catch (error) {
    console.error("Error fetching related articles:", error);
    return [];
  }
}

export default async function InternationalArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article._id);
  const teamHint = extractTeamFromTitle(article.title);

  const articleUrl = `https://goal-mania.it/international/${article.slug}`;
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
      logo: { "@type": "ImageObject", url: "https://goal-mania.it/logo.png" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    keywords: article.seoKeywords?.join(", ") ?? "calcio internazionale, Champions League, Premier League",
    articleSection: "Calcio Internazionale",
    inLanguage: "it-IT",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://goal-mania.it" },
      { "@type": "ListItem", position: 2, name: "Internazionale", item: "https://goal-mania.it/international" },
      { "@type": "ListItem", position: 3, name: article.title, item: articleUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    <div className="container mx-auto px-4 py-8 bg-[#0a0a0a]">
      <article className="max-w-3xl mx-auto text-white">
        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center text-sm text-white mb-3">
            <time dateTime={article.publishedAt}>
              {new Date(article.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <span className="mx-2">•</span>
            <span>{article.author}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {article.title}
          </h1>
          <p className="text-lg text-white mb-6">{article.summary}</p>
        </header>

        {/* Article Featured Image */}
        <div className="relative h-[50vh] w-full mb-8 rounded-lg overflow-hidden">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
          />
        </div>

        {/* Article content */}
        <ArticleContent
          content={article.content}
          className="prose prose-lg max-w-none mb-8 text-white"
        />

        {/* Jersey popup — maglia della squadra dell'articolo */}
        <JerseyAdBlock jerseyId={article.featuredJerseyId} teamHint={teamHint} />

        {/* Article Footer */}
        <footer className="border-t border-white/8 pt-6 mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white">Author</h3>
              <p className="text-sm text-white">{article.author}</p>
            </div>
            <Link
              href="/international/laliga"
              className="text-sm font-medium text-[#c8f000] hover:text-[#c8f000]"
            >
              ← Torna ai Campionati Esteri
            </Link>
          </div>
        </footer>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="max-w-5xl mx-auto mt-16">
          <h2 className="text-2xl font-bold mb-6 text-white">
            Related International News
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.map((related: any) => (
              <Link
                key={related._id}
                href={`/international/${related.slug}`}
                className="group flex flex-col bg-[#0a0a0a] rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={related.image}
                    alt={related.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center text-xs text-white mb-2">
                    <span>
                      {new Date(related.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#c8f000] transition-colors duration-200">
                    {related.title}
                  </h3>
                  <p className="text-sm text-white mb-4 line-clamp-2">
                    {related.summary}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
    </>
  );
}
