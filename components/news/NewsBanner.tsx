"use client";

import { useI18n } from "@/lib/hooks/useI18n";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { User, Calendar, Clock, UserCircle, History } from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

interface NewsBannerProps {
  imageUrl?: string;
  className?: string;
}

export default function NewsBanner({ imageUrl, className }: NewsBannerProps) {
  const containerClasses = `relative overflow-hidden w-full min-h-[510px] lg:min-h-[580px] flex items-end lg:items-end p-4 md:p-8 lg:pl-14 ${
    className || ""
  }`;

  const { t } = useI18n();

  return (
    <div className={containerClasses}>
      {/* Backgrounds */}
      {/* Mobile */}
      <div className="absolute lg:hidden inset-0">
        <img
          src={imageUrl}
          alt={t("banners.alt")}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute lg:hidden inset-0">
        <img
          src={`/images/recentUpdate/home-overlay.png`}
          alt="Banner Overlay"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Desktop */}
      <div className="absolute hidden lg:block inset-0">
        <img
          src={`/images/recentUpdate/news-bg.png`}
          alt="Banner Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative  z-10 w-full">
        {/* Mobile: Swiper Carousel */}
        <div className="block lg:hidden w-full pb-10 max-w-md mx-auto">
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true }}
            spaceBetween={20}
            slidesPerView={1}
            className="w-full"
          >
            {/* Slide 1: Heading */}
            <SwiperSlide className="flex flex-col items-center text-center px-6">
              <h1 className="text-white text-xl font-bold mb-4 font-sans">
                Serie A: Le Sorprese della Nuova Stagione
              </h1>
              <p className="text-white text-sm font-light leading-relaxed">
                Hai una domanda, un suggerimento o semplicemente vuoi salutarci?
                Compila il modulo qui sotto e il nostro team ti risponderà al
                più presto siamo qui per aiutarti!
              </p>
            </SwiperSlide>

            {/* Slide 2: Paragraph */}
            <SwiperSlide className="flex flex-col items-center text-center px-6">
              <h1 className="text-white text-xl font-bold mb-4 font-sans">
                Come le Nuove Tattiche Stanno Cambiando il Gioco
              </h1>
              <p className="text-white text-sm font-light leading-relaxed">
                Hai una domanda, un suggerimento o semplicemente vuoi salutarci?
                Compila il modulo qui sotto e il nostro team ti risponderà al
                più presto siamo qui per aiutarti!
              </p>
            </SwiperSlide>
          </Swiper>
        </div>

        {/* Desktop: Bottom Split */}
        <div className="hidden lg:flex w-full   justify-between items-end absolute bottom-8 left-0 right-0 px-14">
          {/* Left: Heading */}
          <div className="text-center flex justify-center flex-col">
            <h1 className="text-white text-2xl mb-2 font-bold font-sans max-w-xl">
              Serie A: Le Sorprese della Nuova Stagione
            </h1>

            <div className="flex items-center justify-center gap-6 text-gray-200 text-[12px] lg:text-[14px]">
              <div className="flex items-center gap-2">
                <UserCircle className="w-4 h-4" />
                <span>By Admin</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>27 AGOSTO, 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <History className="w-4 h-4" />
                <span>20 Mins</span>
              </div>
            </div>
          </div>

          {/* Right: Info Row */}
          <div className="text-center flex justify-center flex-col">
            <h1 className="text-white text-2xl mb-2 font-bold font-sans max-w-xl">
              Come le Nuove Tattiche Stanno Cambiando il Gioco
            </h1>

            <div className="flex items-center justify-center gap-6 text-gray-200 text-[12px] lg:text-[14px]">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>By Admin</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>27 AGOSTO, 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <History className="w-4 h-4" />
                <span>20 Mins</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
