"use client";

import Link from "next/link";
import Image from "next/image";
import { Article } from "@/lib/types/home";
import { useI18n } from "@/lib/hooks/useI18n";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface NewsSectionProps {
  articles: Article[];
}

export default function NewsSection({ articles }: NewsSectionProps) {
  const { t } = useI18n();

  if (!articles || articles.length === 0) return null;
  function stripHtml(html: string) {
    return html.replace(/<[^>]*>/g, "");
  }

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-munish">
            {t("home.latestNews") || "Ultime Notizie"}
          </h2>
          <p className="pt-2 text-gray-600 font-munish">
            Scopri le notizie più fresche dal mondo del calcio.
          </p>
        </div>

        <div className="relative">
          <Swiper
            modules={[Navigation]}
            spaceBetween={20}
            slidesPerView={1.2}
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
                  className="block rounded-lg overflow-hidden font-munish transition-shadow"
                >
                  <div className="relative w-full h-64">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="py-4 bg-white">
                    <h3 className="text-[22px] font-bold line-clamp-2 ">
                      {article.title.slice(0, 36)}...
                    </h3>
                    <div className="bg-black h-[2px] w-1/2"></div>
                    <p className="text-sm text-black line-clamp-2 mt-2">
                      {stripHtml(article.content)}
                    </p>
                    <div className="text-xs text-black mt-2 flex items-center">
                      Leggi Ora <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="flex justify-center gap-4 mt-6">
            <button className="news-prev w-10 h-10 flex items-center justify-center rounded-full bg-white shadow hover:bg-gray-100">
              <ChevronLeft />
            </button>
            <button className="news-next w-10 h-10 flex items-center justify-center rounded-full bg-white shadow hover:bg-gray-100">
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
