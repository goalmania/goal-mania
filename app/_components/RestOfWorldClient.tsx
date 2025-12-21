"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/navigation";
import ShopNav from "@/app/_components/ShopNav";

// Rest of World teams with API-Football IDs
const restOfWorldTeams = [
  {
    name: "Real Madrid",
    slug: "real-madrid",
    league: "La Liga",
    logo: "https://media.api-sports.io/football/teams/541.png",
  },
  {
    name: "Barcelona",
    slug: "barcelona",
    league: "La Liga",
    logo: "https://media.api-sports.io/football/teams/529.png",
  },
  {
    name: "Bayern Munich",
    slug: "bayern-munich",
    league: "Bundesliga",
    logo: "https://media.api-sports.io/football/teams/157.png",
  },
  {
    name: "PSG",
    slug: "psg",
    league: "Ligue 1",
    logo: "https://media.api-sports.io/football/teams/85.png",
  },
  {
    name: "Borussia Dortmund",
    slug: "dortmund",
    league: "Bundesliga",
    logo: "https://media.api-sports.io/football/teams/165.png",
  },
  {
    name: "Atletico Madrid",
    slug: "atletico-madrid",
    league: "La Liga",
    logo: "https://media.api-sports.io/football/teams/530.png",
  },
  {
    name: "Bayer Leverkusen",
    slug: "leverkusen",
    league: "Bundesliga",
    logo: "https://media.api-sports.io/football/teams/168.png",
  },
  {
    name: "RB Leipzig",
    slug: "leipzig",
    league: "Bundesliga",
    logo: "https://media.api-sports.io/football/teams/173.png",
  },
];

export default function RestOfWorldClient() {
  return (
    <div className="bg-white">
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Rest of the World Teams
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
            Explore jerseys from top clubs around the world - La Liga, Bundesliga, Ligue 1 and more
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
                1024: { slidesPerView: 8, spaceBetween: 40 },
              }}
              className="logo-slider"
            >
              {restOfWorldTeams.map((team) => (
                <SwiperSlide key={team.slug}>
                  <a
                    href={`/shop/international/${team.slug}`}
                    className="block"
                  >
                    <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center rounded-full border-2 border-gray-200 p-2 transform transition-transform duration-300 hover:scale-110 cursor-pointer mx-auto">
                      <img
                        src={team.logo}
                        alt={team.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-600 truncate">{team.name}</p>
                    <p className="text-xs text-gray-400">{team.league}</p>
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
