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

// Enable ISR for news listing
export const revalidate = 300;

export const metadata: Metadata = {
  title: "News | Goal Mania",
  description: "Latest football news and updates from Goal Mania",
};

async function getNewsArticles(): Promise<{
  featured: NewsArticle[];
  regular: NewsArticle[];
}> {
  try {
    await connectDB();

    // Fetch featured articles - sorted by publishedAt DESC (newest first)
    const featuredArticles = await Article.find({
      category: "news",
      status: "published",
      featured: true,
    })
      .sort({ publishedAt: -1 })
      .limit(10)
      .lean();

    // Fetch regular articles - sorted by publishedAt DESC (newest first)
    const regularArticles = await Article.find({
      category: "news",
      status: "published",
      featured: { $ne: true },
    })
      .sort({ publishedAt: -1 })
      .limit(12)
      .lean();

    // ✅ Serialize MongoDB documents to plain objects
    const serialize = (articles: any[]) =>
      JSON.parse(JSON.stringify(articles));

    // ✅ Normalize to match NewsArticle (ensure `tags` exists)
    const normalize = (a: any): NewsArticle => ({
      ...a,
      tags: a.tags ?? [],
    });

    return {
      featured: serialize(featuredArticles).map(normalize),
      regular: serialize(regularArticles).map(normalize),
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
  let errorMessage: string | null = null;

  try {
    const { featured, regular } = await getNewsArticles();
    // ✅ Articles are already serialized, just combine them
    allArticles = [...featured, ...regular];
  } catch (error) {
    errorMessage = (error as Error).message;
  }

  const MobilebannerData = {
    imageUrl: `/images/recentUpdate/mobile-news.jpg`,
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      <div className="min-h-screen flex flex-col font-munish bg-gray-50">
        {/* ✅ Pass serialized articles to Client Component */}
        <NewsBanner articles={allArticles} imageUrl={MobilebannerData.imageUrl} />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 flex-1 items-start">
          {/* Breadcrumb */}
          <div className="mb-6 hidden">
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

          <div className="relative max-w-lg mb-8">
            <div className="absolute slanted-card -top-6 left-0 bg-gray-900 rounded-md text-white font-semibold py-2 px-6  z-10">
              In Primo Piano
            </div>
            <div className="pt-8 border-t-2 border-gray-200"></div>
          </div>

          {/* Render logic based on article count */}
          {errorMessage ? (
            <Alert variant="destructive" className="max-w-2xl mx-auto">
              <AlertDescription className="text-center">
                {errorMessage}
              </AlertDescription>
            </Alert>
          ) : allArticles.length > 0 ? (
            <>
              {/* First Section with Sidebar */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                <div className="lg:col-span-2">
                  <BentoSection articles={allArticles.slice(0, 4)} />
                  <div className="mt-4 text-right">
                    <Link
                      href="/news"
                      className="text-sm font-semibold tracking-wide text-gray-900 hover:text-orange-500 uppercase transition-colors duration-200"
                    >
                      See all
                    </Link>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-8">
                  {/* Follow Us Section */}
                  <div className="p-6 ">
                    <div className="relative mb-6">
                      <div className="absolute slanted-card -top-6 left-0 bg-gray-900 rounded-md text-white font-semibold py-2 px-6">
                        Follow Us
                      </div>
                      <div className="pt-8 border-t-2 border-gray-200"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <a
                        href="https://facebook.com/goalmania"
                        className="flex items-center justify-center p-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                      >
                        <Facebook className="w-5 h-5 mr-2" />
                        <span className="font-medium">Facebook</span>
                      </a>
                      <a
                        href="https://twitter.com/goalmania"
                        className="flex items-center justify-center p-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                      >
                        <Twitter className="w-5 h-5 mr-2" />
                        <span className="font-medium">Twitter</span>
                      </a>
                      <a
                        href="https://www.instagram.com/goalmania.it"
                        className="flex items-center justify-center p-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                      >
                        <Instagram className="w-5 h-5 mr-2" />
                        <span className="font-medium">Instagram</span>
                      </a>
                      <a
                        href=":https://www.tiktok.com/@goalmania.it"
                        className="flex items-center justify-center p-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                      >
                        <IconBrandTiktok className="w-5 h-5 mr-2" />
                        <span className="font-medium">Tiktok</span>
                      </a>
                      <a
                        href="https://linkedin.com/company/goalmania"
                        className="flex items-center justify-center p-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                      >
                        <Linkedin className="w-5 h-5 mr-2" />
                        <span className="font-medium">LinkedIn</span>
                      </a>
                      <a
                        href="https://pinterest.com/goalmania"
                        className="flex items-center justify-center p-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                      >
                        <IconBrandPinterest className="w-5 h-5 mr-2" />
                        <span className="font-medium">Pinterest</span>
                      </a>
                    </div>
                  </div>

                  {/* Newsletter Section */}
                  <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg text-center">
                    <div className="relative inline-block mb-4">
                      <Mail className="w-16 h-16 text-gray-400 opacity-20" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <h3 className="text-xl font-semibold whitespace-nowrap">
                          Newsletter Giornaliera
                        </h3>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-6 text-sm">
                      Ricevi tutte le notizie più importanti dal mondo del
                      calcio
                    </p>
                    <form
                      action="/api/newsletter"
                      method="POST"
                      className="flex w-full"
                    >
                      <button
                        type="submit"
                        className="flex items-center mx-auto justify-center bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg shadow-md transition-colors duration-200"
                      >
                        Inserisci la tua e-mail
                        <MoveRight className="w-5 h-5" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Remaining Sections */}
              <div className="flex flex-col gap-16">
                {Array.from({
                  length: Math.ceil((allArticles.length - 4) / 4),
                }).map((_, i) => {
                  const start = 4 + i * 4;
                  const end = start + 4;
                  const sectionArticles = allArticles.slice(start, end);

                  return (
                    <div key={i}>
                      <BentoSection
                        articles={sectionArticles}
                        reverse={i % 2 === 1}
                      />
                      <div className="mt-4 text-right">
                        <Link
                          href="/news"
                          className="text-sm font-semibold tracking-wide text-gray-900 hover:text-orange-500 uppercase transition-colors duration-200"
                        >
                          See all
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <Alert variant="destructive" className="max-w-2xl mx-auto">
              <AlertDescription className="text-center">
                No news articles found.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="py-8 bg-white">
          <PopularNewsGrid />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex w-full max-w-4xl mx-auto h-[230px] lg:h-[250px] bg-gray-900 rounded-2xl overflow-hidden shadow-lg">
            <div className="w-[30%] flex-shrink-0">
              <Image
                src="/images/recentUpdate/banner-ads.png"
                alt="Promotional product"
                width={300}
                height={250}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-[70%] p-6 flex flex-col md:flex-row justify-between items-center text-white">
              <div>
                <p className="text-red-500 text-sm font-semibold mb-1">
                  30% Off
                </p>
                <h2 className="text-xl lg:text-2xl font-bold leading-tight mb-4">
                  Compra la Nuova Maglia Ufficiale
                </h2>
              </div>
              <Link href="/shop">
                <button className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-xl shadow-md transition-colors duration-200">
                  Buy Now
                  <ArrowRight className="w-4 h-4 ml-2" />
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
