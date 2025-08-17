import { getRegularSerieAArticles } from "@/lib/actions/articles";
import Image from "next/image";
import Link from "next/link";

export async function RegularArticles() {
  // Fetch data server-side
  const articles = await getRegularSerieAArticles();

  // Empty state
  if (!articles || articles.length === 0) {
    return (
      <section>
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
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {articles.map((article: any) => (
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
  );
}