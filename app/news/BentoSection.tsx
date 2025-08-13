import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { NewsArticle } from "@/types/news";

interface BentoSectionProps {
  articles: NewsArticle[];
  reverse?: boolean;
}

export default function BentoSection({ articles, reverse = false }: BentoSectionProps) {
  if (!articles.length) return null;

  const [main, ...grid] = articles;

  const mainArticle = (
    <Link href={`/news/${main.slug}`} className="block w-full h-full">
      <Card className="h-full flex flex-col shadow-md border border-gray-200 bg-white text-black">
        <div className="relative w-full h-80 md:h-96 rounded-t-2xl overflow-hidden">
          <Image src={main.image} alt={main.title} fill className="object-cover" />
        </div>
        <CardHeader className="pb-2 pt-4 px-6">
          <CardTitle className="text-xl font-bold line-clamp-2 text-black">{main.title}</CardTitle>
          <div className="flex items-center text-xs text-gray-500 mt-1 mb-2 gap-2">
            <span>{new Date(main.publishedAt).toLocaleDateString()}</span>
            <span className="mx-1">•</span>
            <span>{main.author}</span>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-4">
          <CardDescription className="text-sm text-gray-700 line-clamp-3">
            {main.summary}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );

  const gridArticles = (
    <div className="grid grid-cols-2 gap-4 w-full max-w-md lg:max-w-lg">
      {grid.map((news) => (
        <Link href={`/news/${news.slug}`} key={news.id} className="block">
          <Card className="shadow-md border border-gray-200 bg-white text-black hover:shadow-lg transition-shadow duration-200">
            <div className="relative w-full h-32 sm:h-36 rounded-t-xl overflow-hidden">
              <Image src={news.image} alt={news.title} fill className="object-cover" />
            </div>
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm font-semibold line-clamp-2 text-black">
                {news.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <div className="flex items-center text-xs text-gray-500 gap-2">
                <span>{new Date(news.publishedAt).toLocaleDateString()}</span>
                <span className="mx-1">•</span>
                <span className="truncate">{news.author}</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );

  return (
    <div className={`flex flex-col md:flex-row gap-8 md:gap-12 items-stretch ${reverse ? 'md:flex-row-reverse' : ''}`}>
      <div className="flex-1 min-w-0">{mainArticle}</div>
      {grid.length > 0 && <div className="flex-shrink-0">{gridArticles}</div>}
    </div>
  );
} 