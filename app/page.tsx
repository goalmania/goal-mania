/* eslint-disable @typescript-eslint/no-explicit-any */
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import Image from "next/image";
import Link from "next/link";
import NewsButton from "@/components/home/news-button";
import { Card, CardContent } from "@/components/ui/card";

// Disable caching for this page
export const dynamic = "force-dynamic";

export default async function Home() {
  try {
    // Connect to the database and fetch articles directly
    await connectDB();

    // Get featured articles from all categories
    const featuredArticles = await Article.find({
      status: "published",
      featured: true,
    })
      .sort({ publishedAt: -1 })
      .lean();

    return (
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Featured Articles */}
          {featuredArticles && featuredArticles.length > 0 ? (
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 px-1">
                In Evidenza
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {featuredArticles.map((article: any) => (
                  <Card key={article._id} className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <Link
                      href={`/news/${article.slug}`}
                      className="block h-full"
                    >
                      <div className="relative h-48 sm:h-56 w-full">
                        <Image
                          src={article.image}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>
                      <CardContent className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                        <span className="inline-block px-2 sm:px-3 py-1 mb-1 sm:mb-2 text-xs font-semibold text-white bg-primary rounded-full">
                          {article.category === "news"
                            ? "News"
                            : article.category === "transferMarket"
                            ? "Transfer"
                            : article.category === "serieA"
                            ? "Serie A"
                            : "International"}
                        </span>
                        <h2 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">
                          {article.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-200 line-clamp-2">
                          {article.summary}
                        </p>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </section>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">
                Nessun articolo in evidenza al momento.
              </p>
            </div>
          )}

          <div className="mt-6 sm:mt-8 md:mt-10 text-center">
            <NewsButton />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching articles:", error);
    return (
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <p className="text-center text-gray-600">
            Non è stato possibile caricare le notizie. Riprova più tardi.
          </p>
          <NewsButton />
        </div>
      </div>
    );
  }
}
