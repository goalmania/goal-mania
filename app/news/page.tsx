import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import { NewsArticle } from "@/types/news";
import BentoSection from "./BentoSection";
import NewsCarousel from "./NewsCarousel";
import { Suspense } from "react";
import { LoadingFallback } from "@/components/shared/loading-fallback";

// Disable caching for this page
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News | Goal Mania",
  description: "Latest football news and updates from Goal Mania",
};

async function getNewsArticles() {
  try {
    await connectDB();

    // Get featured articles
    const featuredArticles = await Article.find({
      category: "news",
      status: "published",
      featured: true,
    })
      .sort({ publishedAt: -1 })
      .limit(3);

    // Get regular articles
    const regularArticles = await Article.find({
      category: "news",
      status: "published",
      featured: { $ne: true },
    })
      .sort({ publishedAt: -1 })
      .limit(12);

    return {
      featured: JSON.parse(JSON.stringify(featuredArticles)),
      regular: JSON.parse(JSON.stringify(regularArticles)),
    };
  } catch (error) {
    console.error("Failed to fetch news articles:", error);
    return { featured: [], regular: [] };
  }
}

export default async function NewsPage() {
  // Fetch real articles
  const { featured, regular } = await getNewsArticles();
  const allArticles: NewsArticle[] = [...featured, ...regular];

  return (
    <Suspense fallback={<LoadingFallback />}>

    <div className="bg-gradient-to-b from-white to-blue-50 min-h-screen flex flex-col">
      <div className="container mx-auto px-6 sm:px-10 lg:px-20 pt-12 pb-12 flex-1">
        <h1 className="text-5xl font-serif font-bold mb-10 text-left text-black leading-tight">Latest News</h1>
        {/* Render logic based on article count */}
        {allArticles.length === 1 && (
          <div className="w-full max-w-3xl mx-auto">
            <BentoSection articles={allArticles} />
          </div>
        )}
        {allArticles.length > 1 && (
          <div className="flex flex-col gap-16">
            {Array.from({ length: Math.ceil(allArticles.length / 4) }).map((_, i) => {
              const start = i * 4;
              const end = start + 4;
              const sectionArticles = allArticles.slice(start, end);
              // If only 1 article in this section, render full width
              if (sectionArticles.length === 1) {
                return (
                  <div key={i} className="w-full max-w-3xl mx-auto">
                    <BentoSection articles={sectionArticles} />
                  </div>
                );
              }
              // Alternate reverse for every other section
              return (
                <BentoSection
                  key={i}
                  articles={sectionArticles}
                  reverse={i % 2 === 1}
                />
              );
            })}
          </div>
        )}
        {allArticles.length === 0 && (
          <div className="text-center text-gray-500">No news articles found.</div>
        )}
      </div>
      <NewsCarousel articles={allArticles} />
    </div>
    </Suspense>
  );
}
