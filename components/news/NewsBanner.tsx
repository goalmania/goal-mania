"use client";

import { useI18n } from "@/lib/hooks/useI18n";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { User, Calendar, Clock, UserCircle, History } from "lucide-react";
import Link from "next/link";
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

interface Article {
  _id: string;
  title: string;
  summary: string;
  image: string;
  author: string;
  publishedAt: string;
  slug: string;
  content: string;
}

interface NewsBannerProps {
  articles: Article[];
  className?: string;
  imageUrl?: string;
}

// Helper function to calculate read time
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date
    .toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();
}

export default function NewsBanner({ articles = [], className, imageUrl }: NewsBannerProps) {
  const containerClasses = `relative overflow-hidden w-full min-h-[510px] lg:min-h-[580px] flex items-end lg:items-end p-4 md:p-8 lg:pl-14 ${
    className || ""
  }`;

  const { t } = useI18n();
  const [activeSlide, setActiveSlide] = useState(0);

  // Get top 2 latest articles sorted by publishedAt
  const latestArticles = [...articles]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 2);

  // Fallback articles if none provided
  const defaultArticles = [
    {
      _id: "1",
      title: "Serie A: Le Sorprese della Nuova Stagione",
      summary:
        "Scopri le squadre che stanno stupendo tutti in questa nuova stagione di Serie A.",
      image: "/images/recentUpdate/news-bg.png",
      author: "Admin",
      publishedAt: new Date().toISOString(),
      slug: "#",
      content: "Article content here...",
    },
    {
      _id: "2",
      title: "Come le Nuove Tattiche Stanno Cambiando il Gioco",
      summary:
        "Analisi delle innovazioni tattiche che stanno rivoluzionando il calcio moderno.",
      image: "/images/recentUpdate/news-bg.png",
      author: "Admin",
      publishedAt: new Date().toISOString(),
      slug: "#",
      content: "Article content here...",
    },
  ];

  const displayArticles = latestArticles.length > 0 ? latestArticles : defaultArticles;

  return (
    <div className={containerClasses}>
      {/* Backgrounds */}
      {/* Mobile - Dynamic background based on active slide */}
      <div className="absolute lg:hidden inset-0">
        <img
          src={displayArticles[activeSlide]?.image || imageUrl || "/images/recentUpdate/news-bg.png"}
          alt={displayArticles[activeSlide]?.title}
          className="w-full h-full object-cover transition-all duration-500"
        />
      </div>
      <div className="absolute lg:hidden inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
      </div>

      {/* Desktop - Show first article image on left, second on right */}
      <div className="absolute hidden lg:block inset-0">
        <div className="w-full h-full flex">
          {/* Left half - First article image */}
          <div className="w-1/2 h-full relative">
            <img
              src={displayArticles[0]?.image || "/images/recentUpdate/news-bg.png"}
              alt={displayArticles[0]?.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          </div>
          {/* Right half - Second article image */}
          <div className="w-1/2 h-full relative">
            <img
              src={displayArticles[1]?.image || "/images/recentUpdate/news-bg.png"}
              alt={displayArticles[1]?.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">
        {/* Mobile: Swiper Carousel */}
        <div className="block lg:hidden w-full pb-10 max-w-md mx-auto">
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true }}
            spaceBetween={20}
            slidesPerView={1}
            className="w-full"
            onSlideChange={(swiper: SwiperType) => setActiveSlide(swiper.activeIndex)}
          >
            {displayArticles.map((article) => (
              <SwiperSlide
                key={article._id}
                className="flex flex-col items-center text-center px-6"
              >
                <Link href={`/news/${article.slug}`} className="w-full">
                  <h1 className="text-white text-xl font-bold mb-4 font-sans hover:text-[#FF7A00] transition-colors">
                    {article.title}
                  </h1>
                  <p className="text-white text-sm font-light leading-relaxed line-clamp-3">
                    {article.summary}
                  </p>
                  <div className="flex items-center justify-center gap-4 text-gray-200 text-xs mt-4">
                    <div className="flex items-center gap-1">
                      <UserCircle className="w-3 h-3" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <History className="w-3 h-3" />
                      <span>{calculateReadTime(article.content)} Min</span>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Desktop: Bottom Split */}
        <div className="hidden lg:flex w-full justify-between items-end absolute bottom-8 left-0 right-0 px-14">
          {displayArticles.map((article) => (
            <Link
              key={article._id}
              href={`/news/${article.slug}`}
              className="text-center flex justify-center flex-col group"
            >
              <h1 className="text-white text-2xl mb-2 font-bold font-sans max-w-xl group-hover:text-[#FF7A00] transition-colors">
                {article.title}
              </h1>

              <div className="flex items-center justify-center gap-6 text-gray-200 text-[12px] lg:text-[14px]">
                <div className="flex items-center gap-2">
                  <UserCircle className="w-4 h-4" />
                  <span>By {article.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(article.publishedAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  <span>{calculateReadTime(article.content)} Mins</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
