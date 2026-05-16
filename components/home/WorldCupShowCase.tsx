"use client";

import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

interface Team {
  name: string;
  id: string;
  flag: string;
}

interface WorldCupShowcaseProps {
  teams?: Team[];
}

export default function WorldCupShowcase({ teams = [] }: WorldCupShowcaseProps) {
  return (
    <section className="py-16 bg-[#0a0a0a] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center relative">
        <h2 className="text-3xl md:text-4xl font-black uppercase italic text-white mb-2 tracking-tighter">
          Mondiali <span className="text-[#c8f000]">2026</span>
        </h2>
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 mb-12">
          Le Nazionali più amate
        </p>

        <div className="relative">
          <Swiper
            modules={[Navigation]}
            spaceBetween={20}
            slidesPerView={3}
            navigation={{
              nextEl: ".swiper-button-next-wc",
              prevEl: ".swiper-button-prev-wc",
            }}
            breakpoints={{
              640: { slidesPerView: 4, spaceBetween: 20 },
              768: { slidesPerView: 6, spaceBetween: 30 },
              1024: { slidesPerView: 8, spaceBetween: 30 },
              1280: { slidesPerView: 9, spaceBetween: 30 },
            }}
            className="logo-slider !overflow-visible mb-10"
          >
            {teams.map((team) => (
              <SwiperSlide key={team.id}>
                <Link
                  href={`/shop/worldcup/${team.id}`}
                  className="group flex flex-col items-center gap-4 transition-transform duration-300 hover:scale-105"
                >
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-gray-100 overflow-hidden bg-[#0a0a0a] p-1 shadow-sm group-hover:border-[#c8f000] group-hover:shadow-md transition-all duration-500">
                    <div className="relative w-full h-full rounded-full overflow-hidden">
                      <Image
                        src={team.flag}
                        alt={team.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                      />
                    </div>
                  </div>
                  
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-[#c8f000] transition-colors">
                    {team.name}
                  </span>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Controls placed below the images */}
          <div className="flex justify-center items-center gap-4 mt-4">
            <button className="swiper-button-prev-wc w-10 h-10 rounded-full border border-white/8 flex items-center justify-center text-white/40 hover:bg-gray-900 hover:text-white transition-all shadow-sm cursor-pointer">
              <span className="text-lg">←</span>
            </button>
            <button className="swiper-button-next-wc w-10 h-10 rounded-full border border-white/8 flex items-center justify-center text-white/40 hover:bg-gray-900 hover:text-white transition-all shadow-sm cursor-pointer">
              <span className="text-lg">→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}