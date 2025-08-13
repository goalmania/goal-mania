import { getFeaturedSerieAArticles } from "@/lib/actions/articles";
import Image from "next/image";
import Link from "next/link";

export async function FeaturedArticles() {
  // Fetch data server-side
  const articles = await getFeaturedSerieAArticles();

  // Empty state
  if (!articles || articles.length === 0) {
    return (
      <section className="mb-12">
        <div className="text-center py-16">
          <p className="text-[#0e1924] text-lg">
            No Serie A news available yet. Check back soon!
          </p>
        </div>
      </section>
    );
  }

  // Success state
  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {articles.map((article: any) => (
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
  );
}