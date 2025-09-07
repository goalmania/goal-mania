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
  Send,
  ArrowRight,
} from "lucide-react";
import { IconBrandPinterest } from "@tabler/icons-react";

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
      <div className=" min-h-screen flex flex-col">
        <NewsBanner imageUrl={MobilebannerData.imageUrl} />
        <div className="container mx-auto px-6 sm:px-10 lg:px-15 pt-12 pb-12 flex-1">
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

          <div className="relative max-w-lg">
            <div className="absolute -top-6 left-0 bg-gray-900 text-white font-semibold py-2 px-6 rounded-r-lg shadow-md z-10">
              In Primo Piano
            </div>
            <div className="pt-8 border-t-2 border-gray-200"></div>{" "}
          </div>

          {/* Render logic based on article count */}
          {allArticles.length === 1 && (
            <div className="w-full max-w-3xl mx-auto border">
              <BentoSection articles={allArticles} />
            </div>
          )}
          {allArticles.length > 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-6">
              <div className="flex flex-col lg:col-span-4 gap-16">
                {Array.from({ length: Math.ceil(allArticles.length / 5) }).map(
                  (_, i) => {
                    const start = i * 4;
                    const end = start + 4;
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

              <div className="hidden lg:block w-full lg:max-w-md  lg:col-span-2 bg-white p-4 space-y-8">
                {/* Follow Us Section */}
                <div className="relative">
                  <div className="absolute -top-6 left-0 bg-gray-900 text-white font-semibold py-2 px-6 rounded-r-lg shadow-md z-10">
                    Follow Us
                  </div>
                  <div className="pt-8 border-t-2 border-gray-200"></div>{" "}
                  {/* Line separator */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {/* Facebook */}
                    <a
                      href="#"
                      className="flex items-center justify-center p-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                      <Facebook className="w-5 h-5 mr-2" />
                      <span className="font-medium">Facebook</span>
                    </a>

                    {/* Twitter */}
                    <a
                      href="#"
                      className="flex items-center justify-center p-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                      <Twitter className="w-5 h-5 mr-2" />
                      <span className="font-medium">Twitter</span>
                    </a>

                    {/* Instagram */}
                    <a
                      href="#"
                      className="flex items-center justify-center p-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                      <Instagram className="w-5 h-5 mr-2" />
                      <span className="font-medium">Instagram</span>
                    </a>

                    {/* YouTube */}
                    <a
                      href="#"
                      className="flex items-center justify-center p-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                      <Youtube className="w-5 h-5 mr-2" />
                      <span className="font-medium">Youtube</span>
                    </a>

                    {/* LinkedIn */}
                    <a
                      href="#"
                      className="flex items-center justify-center p-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                      <Linkedin className="w-5 h-5 mr-2" />
                      <span className="font-medium">LinkedIn</span>
                    </a>

                    {/* Pinterest */}
                    <a
                      href="#"
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
                    <Mail className="w-16 h-16 text-blue-500 opacity-20" />{" "}
                    {/* Large, faded icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Mail className="w-8 h-8 text-blue-400" />{" "}
                      {/* Smaller, vibrant icon */}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    Newsletter Giornaliera
                  </h3>
                  <p className="text-gray-300 mb-6 text-sm">
                    Ricevi tutte le notizie più importanti dal mondo del
                  </p>
                  <button className="flex items-center justify-center w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-200">
                    Inserisci la tua e-mail
                    <Send className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </div>
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

        <div className="flex w-full h-[250px]  lg:h-[300px] bg-gray-900 rounded-xl overflow-hidden shadow-lg md:mx-auto max-w-4xl">
          {/* Image Section */}
          <div className="w-[30%] flex-shrink-0">
            <img
              src={`/images/recentUpdate/banner-ads.png`}
              alt="Promotional product"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content Section */}
          <div className="w-[70%] p-6 flex flex-col justify-center text-white">
            <p className="text-red-500 text-sm font-semibold mb-1">30% Off</p>
            <h2 className="text-xl lg:text-2xl font-bold leading-tight mb-4">
              Compra la Nuova Maglia Ufficiale
            </h2>
            <button className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-200 self-start">
              Buy Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>

        {/* ✅ Add PopularNewsGrid here */}
        {/* <PopularNewsGrid articles={allArticles} /> */}

        <NewsCarousel articles={allArticles} />
      </div>
    </Suspense>
  );
}
