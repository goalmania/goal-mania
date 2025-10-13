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
import { Calendar, Clock, History, User, UserCircle } from "lucide-react";

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
      <div className="h-fit flex flex-col  bg-transparent text-[#0A1A2F]">
        <div className="relative w-full h-80 md:h-96 rounded-t-xl overflow-hidden">
          <Image
            src={main.image}
            alt={main.title}
            fill
            className="object-cover rounded-md"
          />
        </div>
        <div className="pb-2 pt-4 flex flex-col items-start max-w-lg ">
          <p className="px-5 py-2 border-[1.33px] h-[31px] flex items-center w-[96px] border-[#B8C1CD] text-[#6D757F] my-2 rounded-[3.99px] uppercase text-[16px]">
            {main.category}
          </p>

          <CardTitle className="text-[26px] font-bold line-clamp-2 text-[#0A1A2F]">
            {main.title}
          </CardTitle>
        </div>
        <div className=" pb-4 max-w-lg ">
          <CardDescription className="text-sm text-gray-700 line-clamp-3">
            {main.summary}
          </CardDescription>
        </div>

        <div className="flex items-center gap-6 text-[#6D757F] text-sm lg:text-base">
          <div className="flex items-center gap-2 md:text-[16px] text-[14px] whitespace-nowrap uppercase">
            <UserCircle className="w-4 h-4" />
            <span>B {main.author}</span>
          </div>
          <div className="flex items-center gap-2 md:text-[16px] text-[14px] whitespace-nowrap uppercase">
            <Calendar className="w-4 h-4" />
            <span>{new Date(main.publishedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 md:text-[16px] text-[14px] whitespace-nowrap uppercase">
            <History className="w-4 h-4" />
            <span>20 Mins</span>
          </div>
        </div>
      </div>
    </Link>
  );

  const gridArticles = (
    <div className="grid grid-cols-1 gap-4 w-full mt-10 mx-auto">
      {grid.map((news) => (
        <Link
          key={news._id || news.id}
          href={`/news/${news.slug}`}
          className="block"
        >
          <div className=" text-black grid grid-cols-2 w-full mx-auto  gap-4 transition-shadow duration-200">
            <div className="relative w-full h-32 sm:h-auto  rounded-t-xl overflow-hidden md:order-2 order-1">
              <Image
                src={news.image}
                alt={news.title}
                fill
                className="object-cover rounded-lg"
              />
            </div>

            <div>
              <div className="pb-2 pt-4 flex flex-col items-start max-w-lg order-1 md:order-2 ">
                <p className="px-5 py-2 border-[1.33px] h-[29px] flex items-center w-[90px] border-[#B8C1CD] text-[#6D757F] my-2 rounded-[3.99px] uppercase text-[13px]">
                  {main.category}
                </p>

                <CardTitle className="md:text-[22px] text-[18px] font-bold line-clamp-2 text-[#0A1A2F]">
                  {news.title.length > 10
                    ? `${news.title.slice(0, 55)}...`
                    : news.title}
                </CardTitle>
              </div>
              <div className="flex items-start gap-6 text-[#6D757F] text-sm lg:text-[14px]">
                <div className="flex items-center gap-2 text-[16px] uppercase">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(main.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-6 gap-7 place-content-start `}
    >
      <div className={`col-span-4 `}>{mainArticle}</div>
      {grid.length > 0 && (
        <div className={`col-span-2 max-w-xl `}>{gridArticles}</div>
      )}
    </div>
  );
}
