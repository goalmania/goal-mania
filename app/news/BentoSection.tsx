import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";
import { NewsArticle } from "@/types/news";
import { Calendar, Clock, User } from "lucide-react";

interface BentoSectionProps {
  articles: NewsArticle[];
  reverse?: boolean;
}

export default function BentoSection({
  articles,
  reverse = false,
}: BentoSectionProps) {
  if (!articles.length) return null;

  const [main, ...grid] = articles;



  const mainArticle = (
    <Link href={`/news/${main.slug}`} className="block w-full h-full">
      <div className="h-full flex flex-col  bg-white text-[#0A1A2F]">
        <div className="relative w-full h-80 md:h-96 rounded-t-2xl overflow-hidden">
          <Image
            src={main.image}
            alt={main.title}
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <div className="pb-2 pt-4 flex flex-col items-start ">
          <p className="px-5 py-2 border my-2 rounded-md">{main.category}</p>

          <CardTitle className="text-xl font-bold line-clamp-2 text-[#0A1A2F]">
            {main.title}
          </CardTitle>
     
        </div>
        <div className=" pb-4">
          <CardDescription className="text-sm text-gray-700 line-clamp-3">
            {main.summary}
          </CardDescription>
        </div>

        <div className="flex items-center gap-6 text-[#6D757F] text-sm lg:text-base">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>B {main.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(main.publishedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>20 Mins</span>
          </div>
        </div>
      </div>
    </Link>
  );

  const gridArticles = (
    <div className="grid grid-cols-2 gap-4 w-full max-w-md lg:max-w-lg">
      {grid.map((news) => (
        <Link href={`/news/${news.slug}`} key={news.id} className="block">
          <Card className="shadow-md border border-gray-200 bg-white text-black hover:shadow-lg transition-shadow duration-200">
            <div className="relative w-full h-32 sm:h-36 rounded-t-xl overflow-hidden">
              <Image
                src={news.image}
                alt={news.title}
                fill
                className="object-cover"
              />
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
    <div
      className={`flex flex-col md:flex-row gap-8 md:gap-12 items-stretch ${
        reverse ? "md:flex-row-reverse" : ""
      }`}
    >
      <div className="flex-1 min-w-0">{mainArticle}</div>
      {grid.length > 0 && <div className="flex-shrink-0">{gridArticles}</div>}
    </div>
  );
}
