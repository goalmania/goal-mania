"use client";

import Link from "next/link";
import Image from "next/image";
import { Article } from "@/lib/types/home";
import { useI18n } from "@/lib/hooks/useI18n";

// ✅ Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

interface NewsSectionProps {
  articles: Article[];
}

export default function NewsSection({ articles }: NewsSectionProps) {
  const { t } = useI18n();

  if (!articles || articles.length === 0) return null;

  return (
    <section className="py-20 sm:py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-[#0e1924]   ">
            {/* {t("home.latestNews")} */}
            Ultime Notizie
          </h2>

          <p className="pt-2 text-lg text-gray-600 font-medium ">
           Scopri le notizie più fresche e importanti dal mondo del calcio, aggiornate in tempo reale..
          </p>
        </div>

        {articles.length > 2 ? (
          <div className="relative">
            <Swiper
              modules={[Navigation]}
              spaceBetween={20}
              slidesPerView={1}
              navigation={{
                nextEl: ".news-next",
                prevEl: ".news-prev",
              }}
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 20 },
                1024: { slidesPerView: 3, spaceBetween: 30 },
              }}
              className="news-slider"
            >
              {articles.map((article: Article) => (
                <SwiperSlide key={article._id}>
                  <Link
                    href={`/${
                      article.category === "transferMarket"
                        ? "transfer"
                        : article.category
                    }/${article.slug}`}
                    className="relative block group h-48 sm:h-56 md:h-[500px] w-full overflow-hidden rounded-lg"
                  >
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
                    {/* Play Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center bg-white/80 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          className="w-6 h-6 text-[#f5963c] ml-1"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* ✅ Navigation buttons at bottom center */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4 mt-5">
              <button className="news-prev w-10 h-10 flex items-center justify-center rounded-full bg-white shadow hover:bg-gray-100">
                ◀
              </button>
              <button className="news-next w-10 h-10 flex items-center justify-center rounded-full bg-white shadow hover:bg-gray-100">
                ▶
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {articles.map((article: Article) => (
              <Link
                key={article._id}
                href={`/${
                  article.category === "transferMarket"
                    ? "transfer"
                    : article.category
                }/${article.slug}`}
                className="relative block group h-48 sm:h-56 md:h-64 w-full overflow-hidden rounded-lg"
              >
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
                {/* Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center bg-white/80 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      className="w-6 h-6 text-[#f5963c] ml-1"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
