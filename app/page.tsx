import Image from "next/image";
import Link from "next/link";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";

export default async function Home() {
  try {
    // Connect to the database and fetch articles directly
    await connectDB();

    // Get featured articles
    const featuredArticles = await Article.find({
      category: "news",
      status: "published",
      featured: true,
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean();

    // Get regular articles
    const regularArticles = await Article.find({
      category: "news",
      status: "published",
      featured: { $ne: true },
    })
      .sort({ publishedAt: -1 })
      .limit(9)
      .lean();

    return (
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Featured Articles */}
          {featuredArticles && featuredArticles.length > 0 && (
            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 px-1">
                In Evidenza
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {featuredArticles.map((article: any) => (
                  <Link
                    key={article._id}
                    href={`/news/${article.slug}`}
                    className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="relative h-52 sm:h-60 md:h-64 w-full overflow-hidden">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                        priority={true}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                        <span className="inline-block px-2 sm:px-3 py-1 mb-1 sm:mb-2 text-xs font-semibold text-white bg-indigo-600 rounded-full">
                          Featured
                        </span>
                        <h2 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 sm:mb-2">
                          {article.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-200 line-clamp-2">
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
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 px-1">
              Ultime Notizie
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {regularArticles && regularArticles.length > 0 ? (
                regularArticles.map((article: any) => (
                  <Link
                    key={article._id}
                    href={`/news/${article.slug}`}
                    className="group flex flex-col bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="relative h-36 sm:h-40 md:h-48 w-full">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-3 sm:p-4 flex-1 flex flex-col">
                      <div className="flex flex-wrap items-center text-xs text-gray-600 mb-1 sm:mb-2">
                        <span>
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </span>
                        <span className="mx-1 sm:mx-2">•</span>
                        <span>{article.author}</span>
                      </div>
                      <h2 className="text-sm sm:text-base md:text-lg font-semibold text-black mb-1 sm:mb-2 group-hover:text-indigo-600 transition-colors duration-200">
                        {article.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-4 line-clamp-2">
                        {article.summary}
                      </p>
                      <span className="mt-auto text-indigo-600 text-xs sm:text-sm font-medium">
                        Read more
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-center text-gray-600 col-span-3">
                  Nessuna notizia disponibile al momento.
                </p>
              )}
            </div>
          </section>

          <div className="mt-6 sm:mt-8 md:mt-10 text-center">
            <Link
              href="/news"
              className="inline-flex items-center rounded-md bg-white px-3 py-2 sm:px-3.5 sm:py-2.5 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-600 hover:bg-indigo-50"
            >
              Vedi tutte le notizie
              <span aria-hidden="true" className="ml-1 sm:ml-2">
                →
              </span>
            </Link>
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
          <div className="mt-6 sm:mt-8 text-center">
            <Link
              href="/news"
              className="inline-flex items-center rounded-md bg-white px-3 py-2 sm:px-3.5 sm:py-2.5 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-600 hover:bg-indigo-50"
            >
              Vedi tutte le notizie
              <span aria-hidden="true" className="ml-1 sm:ml-2">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
