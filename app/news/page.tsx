import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import { Card, CardContent } from "@/components/ui/card";

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
  const { featured, regular } = await getNewsArticles();

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-black">
          Latest Football News
        </h1>

        {/* Featured Articles */}
        {featured.length > 0 && (
          <section className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {featured.map((article: any) => (
                <Card key={article._id} className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <Link href={`/news/${article.slug}`} className="block h-full">
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
                      <div className="flex items-center text-xs text-white mb-2">
                        <span>
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </span>
                        <span className="mx-2">•</span>
                        <span>{article.author}</span>
                      </div>
                      <h2 className="text-base sm:text-lg font-bold text-white mb-2">
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
        )}

        {/* Regular Articles */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {regular.map((article: any) => (
              <Card key={article._id} className="group overflow-hidden hover:shadow-md transition-shadow duration-300">
                <Link href={`/news/${article.slug}`} className="flex flex-col h-full">
                  <div className="relative h-40 sm:h-48 w-full">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    />
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center text-xs text-gray-600 mb-2">
                      <span>
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                      <span className="mx-2">•</span>
                      <span>{article.author}</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-semibold text-black mb-2 group-hover:text-primary transition-colors duration-200">
                      {article.title}
                    </h2>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                      {article.summary}
                    </p>
                    <span className="mt-auto text-primary text-sm font-medium">
                      Read more
                    </span>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </section>

        {featured.length === 0 && regular.length === 0 && (
          <div className="text-center py-16">
            <p className="text-black text-lg">
              No news articles available yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
