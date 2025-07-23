"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { Article } from "@/lib/types/home";
import { useI18n } from "@/lib/hooks/useI18n";

interface NewsSectionProps {
  articles: Article[];
}

export default function NewsSection({ articles }: NewsSectionProps) {
  const { t } = useI18n();
  
  if (!articles || articles.length === 0) return null;

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-[#0e1924] mb-6 sm:mb-8 md:mb-10">
          {t('home.latestNews')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {articles.map((article: Article) => (
            <Card key={article._id} className="group overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col bg-white">
              <Link
                href={`/serieA/${article.slug}`}
                className="block h-full flex flex-col"
              >
                <div className="relative h-40 sm:h-48 md:h-56 w-full flex-shrink-0">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                    <span className="inline-block px-2 sm:px-3 py-1 text-xs font-semibold text-white bg-[#f5963c] rounded-full">
                      {article.category === "news"
                        ? t('home.news.news')
                        : article.category === "transferMarket"
                        ? t('home.news.transfer')
                        : article.category === "serieA"
                        ? t('home.news.serieA')
                        : t('home.news.international')}
                    </span>
                  </div>
                </div>
                <CardContent className="p-3 sm:p-4 md:p-6 flex-1 flex flex-col">
                  <h2 className="text-sm sm:text-base md:text-lg font-bold text-[#0e1924] mb-2 line-clamp-2 flex-1">
                    {article.title}
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 line-clamp-3 mb-3">
                    {article.summary}
                  </p>
                  <div className="mt-auto">
                    <span className="text-xs sm:text-sm text-[#f5963c] font-medium group-hover:underline">
                      {t('home.readMore')}
                    </span>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
        <div className="text-center mt-6 sm:mt-8 md:mt-10">
          <Button asChild variant="outline" size="lg" className="border-[#f5963c] text-[#f5963c] hover:bg-[#f5963c] hover:text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg">
            <Link href="/news">
              {t('home.readAllNews')}
              <ChevronRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
} 