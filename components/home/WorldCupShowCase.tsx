"use client";

import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const TOP_10_TEAMS = [
  { name: "Argentina", id: "argentina", flag: "https://flagcdn.com/ar.svg" },
  { name: "Brazil", id: "brazil", flag: "https://flagcdn.com/br.svg" },
  { name: "Italy", id: "italy", flag: "https://flagcdn.com/it.svg" },
  { name: "France", id: "france", flag: "https://flagcdn.com/fr.svg" },
  { name: "England", id: "england", flag: "https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg" },
  { name: "Portugal", id: "portugal", flag: "https://flagcdn.com/pt.svg" },
  { name: "Germany", id: "germany", flag: "https://flagcdn.com/de.svg" },
  { name: "Spain", id: "spain", flag: "https://flagcdn.com/es.svg" },
  { name: "USA", id: "usa", flag: "https://flagcdn.com/us.svg" },
  { name: "Nigeria", id: "nigeria", flag: "https://flagcdn.com/ng.svg" },
];

export default function WorldCupShowcase() {
  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center relative">
        <h2 className="text-3xl md:text-4xl font-black uppercase italic text-gray-900 mb-2 tracking-tighter">
          Mondiali <span className="text-indigo-600">2026</span>
        </h2>
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-12">
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
            {TOP_10_TEAMS.map((team) => (
              <SwiperSlide key={team.id}>
                <Link
                  href={`/worldcup/${team.id}`}
                  className="group flex flex-col items-center gap-4 transition-transform duration-300 hover:scale-105"
                >
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-gray-100 overflow-hidden bg-white p-1 shadow-sm group-hover:border-indigo-500 group-hover:shadow-md transition-all duration-500">
                    <div className="relative w-full h-full rounded-full overflow-hidden">
                      <Image
                        src={team.flag}
                        alt={team.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                      />
                    </div>
                  </div>
                  
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-indigo-600 transition-colors">
                    {team.name}
                  </span>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Controls placed below the images */}
          <div className="flex justify-center items-center gap-4 mt-4">
            <button className="swiper-button-prev-wc w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-900 hover:text-white transition-all shadow-sm cursor-pointer">
              <span className="text-lg">←</span>
            </button>
            <button className="swiper-button-next-wc w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-900 hover:text-white transition-all shadow-sm cursor-pointer">
              <span className="text-lg">→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}