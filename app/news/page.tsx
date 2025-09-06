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

// Enable ISR for news listing
export const revalidate = 300;

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

  const MobilebannerData = {
    imageUrl: `/images/recentUpdate/mobile-news.jpg`, // This uses the uploaded image
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      <div className="bg-gradient-to-b  from-white to-[#e6f1ff] min-h-screen flex flex-col">
        <NewsBanner imageUrl={bannerData.imageUrl} />
        <div className="container mx-auto px-6 sm:px-10 lg:px-20 pt-12 pb-12 flex-1">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>News</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-10 text-left text-[#0e1924] leading-tight">
            Latest News
          </h1>
          {/* Render logic based on article count */}
          {allArticles.length === 1 && (
            <div className="w-full max-w-3xl mx-auto">
              <BentoSection articles={allArticles} />
            </div>
          )}
          {allArticles.length > 1 && (
            <div className="flex flex-col gap-16">
              {Array.from({ length: Math.ceil(allArticles.length / 5) }).map(
                (_, i) => {
                  const start = i * 5;
                  const end = start + 5;
                  const sectionArticles = allArticles.slice(start, end);
                  // If only 1 article in this section, render full width
                  if (sectionArticles.length === 1) {
                    return (
                      <div key={i} className="w-full max-w-3xl mx-auto">
                        <BentoSection articles={sectionArticles} />
                        <div className="mt-3 text-right">
                          <Link
                            href="/news"
                            className="text-xs font-semibold tracking-wide text-[#0e1924] hover:text-[#f5963c] uppercase"
                          >
                            See all
                          </Link>
                        </div>
                      </div>
                    );
                  }
                  // Alternate reverse for every other section
                  return (
                    <div key={i}>
                      <BentoSection
                        articles={sectionArticles}
                        reverse={i % 2 === 1}
                      />
                      <div className="mt-3 text-right">
                        <Link
                          href="/news"
                          className="text-xs font-semibold tracking-wide text-[#0e1924] hover:text-[#f5963c] uppercase"
                        >
                          See all
                        </Link>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
          {allArticles.length === 0 && (
            <Alert className="max-w-2xl mx-auto">
              <AlertDescription className="text-center">
                No news articles found.
              </AlertDescription>
            </Alert>
          )}
        </div>
        <NewsCarousel articles={allArticles} />
      </div>
    </Suspense>
  );
}
