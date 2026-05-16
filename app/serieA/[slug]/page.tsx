/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import ArticleContent from "@/app/_components/ArticleContent";
import { JerseyAdBlock } from "@/app/_components/JerseyAdBlock";

const SERIE_A_TEAMS = [
  "Juventus", "Juve", "Inter", "Milan", "Napoli", "Roma", "Lazio", "Atalanta",
  "Fiorentina", "Torino", "Bologna", "Verona", "Cagliari", "Lecce", "Genoa",
  "Udinese", "Monza", "Empoli", "Salernitana", "Sassuolo",
];

function extractTeamFromTitle(title: string): string | undefined {
  const lower = title.toLowerCase();
  for (const team of SERIE_A_TEAMS) {
    if (lower.includes(team.toLowerCase())) return team;
  }
  return undefined;
}

// Enable ISR for article pages
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
      category: "serieA",
    });

    if (!article) {
      return {
        title: "Article Not Found",
        description:
          "The article you are looking for does not exist or has been removed.",
      };
    }

    return {
      title: article.title,
      description: article.summary,
      openGraph: {
        title: article.title,
        description: article.summary,
        images: [article.image],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Goal Mania",
      description: "Latest Serie A news and updates",
    };
  }
}

// Function to get the article data
async function getArticle(slug: string) {
  try {
    await connectDB();

    const article = await Article.findOne({
      slug: slug,
      category: "serieA",
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
      category: "serieA",
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

export default async function SerieAArticlePage({
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

  return (
    <div className="container mx-auto px-4 py-8 bg-[#0a0a0a]">
      <article className="max-w-3xl mx-auto text-white">
        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center text-sm text-white/70 mb-3">
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
          <p className="text-lg text-white/80 mb-6">{article.summary}</p>
        </header>

        {/* Article Featured Image */}
        <div className="relative h-[50vh] w-full mb-8 rounded-lg overflow-hidden">
          <Image
            src={article.image ?? "/product-placeholder-img.jpg"}
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
              <p className="text-sm text-white/80">{article.author}</p>
            </div>
            <Link
              href="/serieA"
              className="text-sm font-medium text-[#c8f000] hover:text-[#c8f000]"
            >
              ← Back to Serie A News
            </Link>
          </div>
        </footer>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="max-w-5xl mx-auto mt-16">
          <h2 className="text-2xl font-bold mb-6">Related Serie A News</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.map((related: any) => (
              <Link
                key={related._id}
                href={`/serieA/${related.slug}`}
                className="group flex flex-col bg-[#0a0a0a] rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={related.image ?? "/product-placeholder-img.jpg"}
                    alt={related.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center text-xs text-white/50 mb-2">
                    <span>
                      {new Date(related.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#c8f000] transition-colors duration-200">
                    {related.title}
                  </h3>
                  <p className="text-sm text-white/60 mb-4 line-clamp-2">
                    {related.summary}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
