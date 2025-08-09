'use client';

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { NewsArticle } from "@/types/news";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface NewsCarouselProps {
  articles: NewsArticle[];
}

const NewsCarousel: React.FC<NewsCarouselProps> = ({ articles }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  if (!articles || articles.length === 0) return null;

  // Scroll handler
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8; // Scroll by 80% of visible area
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="mt-16 flex flex-col items-center w-full">
      <h2 className="text-3xl font-bold mb-6 text-[#0e1924] text-center w-full">Latest News</h2>
      <div className="relative w-full flex items-center justify-center max-w-6xl">
        {/* Left Arrow */}
        <Button
          variant={'ghost'}
          size={'icon'}
          onClick={() => scroll("left")}
          className="rounded-full bg-white cursor-pointer"
        >
          <ChevronLeftIcon className="w-4 h-4 text-black" />
        </Button>
        {/* Carousel */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide w-full px-12"
          style={{ scrollBehavior: "smooth" }}
        >
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/news/${article.slug}`}
              className="min-w-[280px] max-w-xs bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out flex-shrink-0 border border-gray-100 hover:border-[#f5963c]"
            >
              <div className="relative w-full h-40 rounded-t-lg overflow-hidden">
                {article.image && (
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 320px"
                    priority={false}
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-[#0e1924] mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <span className="text-sm text-[#f5963c] font-medium">Read more →</span>
              </div>
            </Link>
          ))}
        </div>
        {/* Right Arrow */}
        <Button
          variant={'ghost'}
          size={'icon'}
          onClick={() => scroll("right")}
          className="rounded-full bg-white cursor-pointer"
        >
            <ChevronRightIcon className="w-4 h-4 text-black" />
        </Button>
      </div>
    </div>
  );
};

export default NewsCarousel; 