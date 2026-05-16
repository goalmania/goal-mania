import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import { JerseyAdBlock } from "@/app/_components/JerseyAdBlock";
import ArticleContent from "@/app/_components/ArticleContent";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

// Enable ISR for news article pages
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
      category: "news",
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
      description: "Latest football news and updates",
    };
  }
}

// Function to get the article data
async function getArticle(slug: string) {
  try {
    await connectDB();

    const article = await Article.findOne({
      slug: slug,
      category: "news",
      status: "published",
    });

    if (!article) return null;

    return JSON.parse(JSON.stringify(article));
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

const STOP_WORDS = new Set([
  "della", "dello", "degli", "delle", "nella", "nelle", "negli", "negli",
  "con", "per", "che", "una", "uno", "the", "and", "for", "dal", "dal",
  "dopo", "prima", "come", "quando", "dove", "cosa", "chi", "suo", "sua",
]);

function extractKeywords(title: string): string[] {
  return title
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w))
    .slice(0, 3);
}

const FOOTBALL_TEAMS = [
  "Juventus", "Juve", "Inter", "Milan", "Napoli", "Roma", "Lazio", "Atalanta",
  "Fiorentina", "Torino", "Bologna", "Verona", "Cagliari", "Lecce", "Genoa",
  "Udinese", "Monza", "Empoli", "Salernitana", "Sassuolo",
  "Arsenal", "Chelsea", "Liverpool", "Manchester City", "Manchester United",
  "Tottenham", "Newcastle", "West Ham", "Aston Villa",
  "Real Madrid", "Barcelona", "Atletico Madrid", "Sevilla", "Valencia",
  "Bayern", "Dortmund", "Leipzig",
  "PSG", "Paris Saint-Germain", "Monaco", "Marseille",
  "Portugal", "Netherlands", "Belgium", "France", "Spain", "Germany",
  "England", "Brazil", "Argentina", "Italia",
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
        category: "news",
        status: "published",
        _id: { $ne: articleId },
        $or: keywords.map((kw) => ({ title: { $regex: kw, $options: "i" } })),
      })
        .sort({ publishedAt: -1 })
        .limit(3)
        .lean();
    }

    if (related.length < 3) {
      const existingIds = related.map((a) => a._id);
      const filler = await Article.find({
        category: "news",
        status: "published",
        _id: { $nin: [articleId, ...existingIds] },
      })
        .sort({ publishedAt: -1 })
        .limit(3 - related.length)
        .lean();
      related = [...related, ...filler];
    }

    return JSON.parse(JSON.stringify(related));
  } catch (error) {
    console.error("Error fetching related articles:", error);
    return [];
  }
}

function splitContentForAd(content: string): string[] {
  const isHtml = content.trim().startsWith("<");

  if (isHtml) {
    // Split on closing paragraph tags without breaking mid-tag
    const parts = content.split(/(?<=<\/p>)/);
    if (parts.length <= 2) return [content, ""];
    const mid = Math.floor(parts.length / 2);
    return [parts.slice(0, mid).join(""), parts.slice(mid).join("")];
  }

  const paragraphs = content.split("\n\n");
  if (paragraphs.length <= 2) return [content, ""];
  const mid = Math.floor(paragraphs.length / 2);
  return [
    paragraphs.slice(0, mid).join("\n\n"),
    paragraphs.slice(mid).join("\n\n"),
  ];
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article._id, article.title);

  const teamHint = extractTeamFromTitle(article.title);
  const [contentFirstPart, contentSecondPart] = splitContentForAd(article.content);

  return (
    <div className="container mx-auto px-4 py-8 bg-white">
      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/news">News</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{article.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <article className="max-w-3xl mx-auto text-black">
        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center text-sm text-gray-700 mb-3">
            <time dateTime={article.publishedAt}>
              {new Date(article.publishedAt).toLocaleDateString("it-IT", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <span className="mx-2">•</span>
            <span>{article.author}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-4">
            {article.title}
          </h1>
          <p className="text-lg text-gray-800 mb-6">{article.summary}</p>
        </header>

        {/* Article Featured Image */}
        <Card className="overflow-hidden mb-8">
          <div className="relative h-[50vh] w-full">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
            />
          </div>
        </Card>

        {/* First part of article content */}
        <ArticleContent
          content={contentFirstPart}
          className="prose prose-lg max-w-none mb-8 text-black"
        />

        {/* Jersey Ad Block */}
        <div className="my-8">
          <Separator className="mb-6" />
          <JerseyAdBlock jerseyId={article.featuredJerseyId} teamHint={teamHint} />
          <Separator className="mt-6" />
        </div>

        {/* Second part of article content */}
        {contentSecondPart && (
          <ArticleContent
            content={contentSecondPart}
            className="prose prose-lg max-w-none mb-12 text-black"
          />
        )}

        {/* Article Footer */}
        <footer className="border-t border-gray-200 pt-6 mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Author</h3>
              <p className="text-sm text-gray-600">{article.author}</p>
            </div>
            <Link
              href="/news"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              ← Back to News
            </Link>
          </div>
        </footer>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="max-w-5xl mx-auto mt-16">
          <h2 className="text-2xl font-bold mb-6 text-black">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.map((related: any) => (
              <Link key={related._id} href={`/news/${related.slug}`}>
                <Card className="group flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <div className="relative h-48 w-full">
                    <Image
                      src={related.image}
                      alt={related.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                    />
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <span>{new Date(related.publishedAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-black mb-2 group-hover:text-indigo-600 transition-colors duration-200">
                      {related.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {related.summary}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
