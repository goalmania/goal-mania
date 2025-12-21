"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/navigation";
import ShopNav from "@/app/_components/ShopNav";

// Serie A teams with API-Football IDs
const serieATeams = [
  {
    name: "Inter Milan",
    slug: "inter",
    logo: "https://media.api-sports.io/football/teams/505.png",
  },
  {
    name: "Napoli",
    slug: "napoli",
    logo: "https://media.api-sports.io/football/teams/492.png",
  },
  {
    name: "Roma",
    slug: "roma",
    logo: "https://media.api-sports.io/football/teams/497.png",
  },
  {
    name: "AC Milan",
    slug: "milan",
    logo: "https://media.api-sports.io/football/teams/489.png",
  },
  {
    name: "Juventus",
    slug: "juventus",
    logo: "https://media.api-sports.io/football/teams/496.png",
  },
  {
    name: "Lazio",
    slug: "lazio",
    logo: "https://media.api-sports.io/football/teams/487.png",
  },
  {
    name: "Atalanta",
    slug: "atalanta",
    logo: "https://media.api-sports.io/football/teams/499.png",
  },
];

export default function SerieATeamsClient() {
  return (
    <div className="bg-white">
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Serie A Teams
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
            Select your favorite Serie A team to explore their jerseys and kits
          </p>

          {/* Teams Swiper */}
          <div className="relative">
            <Swiper
              modules={[Navigation]}
              spaceBetween={30}
              slidesPerView={3}
              navigation={{
                nextEl: ".swiper-button-next-custom",
                prevEl: ".swiper-button-prev-custom",
              }}
              breakpoints={{
                640: { slidesPerView: 4, spaceBetween: 20 },
                768: { slidesPerView: 6, spaceBetween: 30 },
                1024: { slidesPerView: 7, spaceBetween: 40 },
              }}
              className="logo-slider"
            >
              {serieATeams.map((team) => (
                <SwiperSlide key={team.slug}>
                  <a
                    href={`/shop/serieA/${team.slug}`}
                    className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center rounded-full border-2 border-gray-200 p-2 transform transition-transform duration-300 hover:scale-110 cursor-pointer"
                  >
                    <img
                      src={team.logo}
                      alt={team.name}
                      className="w-full h-full object-contain"
                    />
                  </a>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>
      <ShopNav />
    </div>
  );
}
