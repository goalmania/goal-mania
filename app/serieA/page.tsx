/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import { LeagueStatistics } from "@/components/LeagueStatistics";

// Disable caching for this page
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Serie A | Goal Mania",
  description:
    "Latest Serie A news, match reports, and analysis from Goal Mania",
};

async function getSerieAArticles() {
  try {
    await connectDB();

    // Get featured articles
    const featuredArticles = await Article.find({
      category: "serieA",
      status: "published",
      featured: true,
    })
      .sort({ publishedAt: -1 })
      .limit(3);

    // Get regular articles
    const regularArticles = await Article.find({
      category: "serieA",
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
    console.error("Failed to fetch Serie A articles:", error);
    return { featured: [], regular: [] };
  }
}

export default async function SerieAPage() {
  const { featured, regular } = await getSerieAArticles();

  return (
    <div className="bg-[#f7f7f9] min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-[#0e1924] tracking-tight">
          Serie A News
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Standings Column - Left Side */}
          <div className="lg:col-span-4 order-2 lg:order-1">
            <div className="sticky top-20">
              <h2 className="text-xl font-bold mb-4 text-[#0e1924]">Serie A</h2>
              <LeagueStatistics league="serie-a" />
            </div>
          </div>

          {/* News Content - Right Side */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            {/* Featured Articles */}
            {featured.length > 0 && (
              <section className="mb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {featured.map((article: any) => (
                    <Link
                      key={article._id}
                      href={`/serieA/${article.slug}`}
                      className="group block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-[#e5e7eb]"
                    >
                      <div className="relative h-60 sm:h-64 w-full overflow-hidden">
                        <Image
                          src={article.image}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                          priority={true}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1924]/80 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <span className="inline-block px-3 py-1 mb-2 text-xs font-semibold text-white bg-[#f5963c] rounded-full shadow transition-all duration-300">
                            Featured
                          </span>
                          <h2 className="text-lg sm:text-xl font-bold text-white mb-2 drop-shadow">
                            {article.title}
                          </h2>
                          <p className="text-sm text-gray-100 line-clamp-2">
                            {article.summary}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Regular Articles */}
            <section>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {regular.map((article: any) => (
                  <Link
                    key={article._id}
                    href={`/serieA/${article.slug}`}
                    className="group flex flex-col bg-white rounded-2xl shadow border border-[#e5e7eb] overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="relative h-40 sm:h-48 w-full">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <span>
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </span>
                        <span className="mx-2">•</span>
                        <span>{article.author}</span>
                      </div>
                      <h2 className="text-base sm:text-lg font-semibold text-[#0e1924] mb-2 group-hover:text-[#f5963c] transition-colors duration-300">
                        {article.title}
                      </h2>
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                        {article.summary}
                      </p>
                      <span className="mt-auto text-[#f5963c] text-sm font-medium group-hover:underline transition-all duration-300">
                        Read more
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {featured.length === 0 && regular.length === 0 && (
              <div className="text-center py-16">
                <p className="text-[#0e1924] text-lg">
                  No Serie A news available yet. Check back soon!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
