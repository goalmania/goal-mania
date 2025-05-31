import Image from "next/image";
import Link from "next/link";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import type { League } from "@/lib/api/football";

interface LeagueNewsProps {
  league: League;
}

async function getLeagueArticles(league: League) {
  try {
    await connectDB();

    // Get featured articles
    const featuredArticles = await Article.find({
      category: "internationalTeams",
      league: league,
      status: "published",
      featured: true,
    })
      .sort({ publishedAt: -1 })
      .limit(3);

    // Get regular articles
    const regularArticles = await Article.find({
      category: "internationalTeams",
      league: league,
      status: "published",
      featured: { $ne: true },
    })
      .sort({ publishedAt: -1 })
      .limit(6);

    return {
      featured: JSON.parse(JSON.stringify(featuredArticles)),
      regular: JSON.parse(JSON.stringify(regularArticles)),
    };
  } catch (error) {
    console.error(`Failed to fetch ${league} articles:`, error);
    return { featured: [], regular: [] };
  }
}

export async function LeagueNews({ league }: LeagueNewsProps) {
  const { featured, regular } = await getLeagueArticles(league);

  const leagueNameMap: Record<League, string> = {
    premierLeague: "Premier League",
    laliga: "La Liga",
    bundesliga: "Bundesliga",
    ligue1: "Ligue 1",
    serieA: "Serie A",
    "serie-a": "Serie A",
    other: "Altri campionati",
  };

  const leagueName = leagueNameMap[league];

  if (featured.length === 0 && regular.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-black text-lg">
          Nessuna notizia disponibile per {leagueName} al momento. Controlla più
          tardi!
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Featured Articles */}
      {featured.length > 0 && (
        <section className="mb-6 sm:mb-8">
          <h3 className="text-xl font-semibold mb-3 sm:mb-4 px-2 sm:px-0 text-black">
            In Evidenza
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-2 sm:px-0">
            {featured.map((article: any) => (
              <Link
                key={article._id}
                href={`/international/${article.slug}`}
                className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="inline-block px-3 py-1 mb-2 text-xs font-semibold text-white bg-indigo-600 rounded-full">
                      In Evidenza
                    </span>
                    <h2 className="text-base sm:text-xl font-bold text-white mb-1 line-clamp-2">
                      {article.title}
                    </h2>
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <div className="flex items-center text-xs text-black mb-2">
                    <span>
                      {new Date(article.publishedAt).toLocaleDateString(
                        "it-IT"
                      )}
                    </span>
                    <span className="mx-2">•</span>
                    <span>{article.author}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-black line-clamp-2">
                    {article.summary}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Regular Articles */}
      <section>
        <h3 className="text-xl font-semibold mb-3 sm:mb-4 px-2 sm:px-0 text-black">
          Ultime Notizie
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 px-2 sm:px-0">
          {regular.map((article: any) => (
            <Link
              key={article._id}
              href={`/international/${article.slug}`}
              className="group flex flex-col sm:flex-row bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              <div className="relative h-40 sm:h-auto sm:w-1/3">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
              <div className="p-3 sm:p-4 flex-1">
                <div className="flex items-center text-xs text-black mb-2">
                  <span>
                    {new Date(article.publishedAt).toLocaleDateString("it-IT")}
                  </span>
                  <span className="mx-2">•</span>
                  <span>{article.author}</span>
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-black mb-2 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2">
                  {article.title}
                </h2>
                <p className="text-xs sm:text-sm text-black mb-2 line-clamp-2">
                  {article.summary}
                </p>
                <span className="text-indigo-600 text-xs sm:text-sm font-medium">
                  Leggi di più
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
