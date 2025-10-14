import React from "react";
import { Calendar, Clock } from "lucide-react";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import Link from "next/link";

// Helper function to fetch articles
async function getPopularArticles() {
  try {
    await connectDB();

    // Fetch popular articles (featured or most recent)
    const articles = await Article.find({
      status: "published",
      category: "news",
    })
      .sort({ publishedAt: -1 })
      .limit(10)
      .lean();

    return JSON.parse(JSON.stringify(articles));
  } catch (error) {
    console.error("Error fetching popular articles:", error);
    return [];
  }
}

// Helper function to calculate read time
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

interface NewsCardProps {
  article: any;
  isLarge?: boolean;
  className?: string;
}

const NewsCard = ({
  article,
  isLarge = false,
  className = "",
}: NewsCardProps) => {
  const getCategoryLabel = (category?: string) => {
    switch (category?.toLowerCase()) {
      case "serie a":
        return "SERIE A";
      case "champions league":
        return "CHAMPIONS LEAGUE";
      case "news":
        return "NOTIZIE";
      default:
        return category?.toUpperCase() || "SERIE A";
    }
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, "0")} ${d
      .toLocaleDateString("it-IT", {
        month: "short",
      })
      .toUpperCase()}, ${d.getFullYear()}`;
  };

  const readTime = calculateReadTime(article.content || "");

  if (isLarge) {
    return (
      <Link
        href={`/news/${article.slug}`}
        className={`group cursor-pointer ${className}`}
      >
        <div className="relative overflow-hidden rounded-lg bg-gray-900 shadow-xl">
          {/* Background Image */}
          <div className="relative h-64 sm:h-80">
            <img
              src={article.image}
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div>
                <span className="inline-block px-3 py-1.5 bg-[#FFFFFF]/30 backdrop-blur-lg text-white text-xs font-bold uppercase rounded tracking-wide shadow-lg">
                  {getCategoryLabel(article.category)}
                </span>
              </div>
              <h3 className="text-white text-lg sm:text-xl font-bold leading-tight mb-2 group-hover:text-orange-400 transition-colors duration-300">
                {article.title}
              </h3>

              <div className="flex items-center justify-between text-xs text-gray-300 uppercase tracking-wide">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(article.publishedAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {readTime} min
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/news/${article.slug}`}
      className={`group cursor-pointer ${className}`}
    >
      <div className="relative overflow-hidden rounded-lg bg-gray-900 shadow-lg hover:shadow-xl transition-shadow duration-300">
        {/* Background Image */}
        <div className="relative h-48">
          <img
            src={article.image}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="">
              <span className="inline-block px-2 py-1 bg-[#FFFFFF4D] text-white text-xs font-bold uppercase rounded tracking-wide">
                {getCategoryLabel(article.category)}
              </span>
            </div>
            <h3 className="text-white text-sm font-bold leading-tight mb-2 line-clamp-2 group-hover:text-orange-400 transition-colors duration-300">
              {article.title}
            </h3>

            <div className="flex items-center justify-between text-xs text-gray-300 uppercase tracking-wide">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(article.publishedAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {readTime} min
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default async function PopularNewsGrid() {
  const articles = await getPopularArticles();

  if (!articles || articles.length === 0) {
    return null;
  }

  const popularArticles = articles.slice(0, 4);
  const recentArticles = articles.slice(0, 6);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column - Popular News */}
          <div className="lg:col-span-3 space-y-8">
            {/* Header */}
            <div className="relative max-w-lg">
              <div className="absolute -top-6 left-0 bg-gray-900 rounded-[6px] text-white font-semibold py-2 px-6  slanted-card  shadow-md z-10">
                Notizie Più Popolari
              </div>
              <div className="pt-8 border-t-2  border-[#DFDFDF]"></div>
            </div>

            {/* Featured Article */}
            {popularArticles[0] && (
              <NewsCard
                article={popularArticles[0]}
                isLarge={true}
                className="mb-8"
              />
            )}

            {/* Grid of smaller articles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularArticles.slice(1).map((article) => (
                <NewsCard key={article._id} article={article} />
              ))}
            </div>
          </div>

          {/* Right Column - Recent Posts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="relative max-w-lg">
              <div className="absolute -top-6 left-0 bg-gray-900 rounded-[6px] text-white font-semibold py-2 px-6  slanted-card  shadow-md z-10">
                Post Recenti
              </div>
              <div className="pt-8 border-t-2  border-[#DFDFDF]"></div>
            </div>

            {/* Recent Posts List */}
            <div className="space-y-4">
              {recentArticles.map((article) => (
                <Link
                  key={article._id}
                  href={`/news/${article.slug}`}
                  className="group cursor-pointer"
                >
                  <div className="flex gap-3 p-3 bg-white  transition-shadow duration-200 ">
                    {/* Small Image */}
                    <div className="flex-shrink-0">
                      <div className="relative w-16 h-full rounded overflow-hidden">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-1">
                        <p className="px-5 py-2 whitespace-nowrap border-[1.33px] h-[29px] flex items-center w-[90px] border-[#B8C1CD] text-[#6D757F] my-2 rounded-[3.99px] uppercase text-[13px]">
                          {article.category?.toUpperCase() || "NOTIZIE"}
                        </p>
                      </div>

                      {/* Title */}
                      <h4 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2 group-hover:text-orange-600 transition-colors duration-200 mb-1">
                        {article.title}
                      </h4>

                      {/* Meta */}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>
                          {new Date(article.publishedAt).toLocaleDateString("it-IT")}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

