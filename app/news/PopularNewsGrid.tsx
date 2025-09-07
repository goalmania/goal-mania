'use client';

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Image from "next/image";
import { NewsArticle } from "@/types/news";

interface PopularNewsGridProps {
  articles: NewsArticle[];
}

const NewsCard: React.FC<{ article: NewsArticle; className?: string }> = ({
  article,
  className,
}) => (
  <div
    className={`relative w-full h-full rounded-xl overflow-hidden ${className}`}
  >
    {article.image && (
      <Image
        src={article.image}
        alt={article.title}
        fill
        className="absolute inset-0 w-full h-full object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    )}
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

    <div className="absolute bottom-4 left-4 right-4 text-white">
      <span className="text-[10px] uppercase font-semibold bg-blue-700 px-2 py-0.5 rounded">
        {article.category || "NEWS"}
      </span>
      <h3 className="text-base lg:text-lg font-bold mt-2 leading-snug line-clamp-2">
        {article.title}
      </h3>
      <div className="flex items-center text-gray-300 text-xs mt-2 gap-4">
        <span>
          {new Date(article.publishedAt).toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>
    </div>
  </div>
);

const PopularNewsGrid: React.FC<PopularNewsGridProps> = ({ articles }) => {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="w-full mt-16">
      <h2 className="text-xl lg:text-2xl font-bold mb-6 text-[#0e1924] border-l-4 border-[#0e1924] pl-3">
        Notizie Più Popolari
      </h2>

      {/* Mobile Slider */}
      <div className="md:hidden">
        <Swiper
          modules={[Pagination]}
          spaceBetween={16}
          slidesPerView={1.1}
          pagination={{ clickable: true }}
          className="p-2"
        >
          {articles.map((article) => (
            <SwiperSlide key={article.id}>
              <NewsCard article={article} className="h-80" />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-4">
        {articles.slice(0, 5).map((article, i) => {
          const gridSpan =
            i === 0
              ? "col-span-2 row-span-2 h-[400px]" // big feature
              : i === 1
              ? "col-span-2 h-[200px]" // wide
              : "col-span-1 h-[200px]"; // small
          return (
            <NewsCard
              key={article.id}
              article={article}
              className={`${gridSpan}`}
            />
          );
        })}
      </div>
    </section>
  );
};

export default PopularNewsGrid;
