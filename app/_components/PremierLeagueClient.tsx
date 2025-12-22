"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/navigation";

// Premier League teams
const premierLeagueTeams = [
  {
    name: "Manchester United",
    slug: "manchester-united",
    logo: "https://media.api-sports.io/football/teams/33.png",
  },
  {
    name: "Manchester City",
    slug: "manchester-city",
    logo: "https://media.api-sports.io/football/teams/50.png",
  },
  {
    name: "Liverpool",
    slug: "liverpool",
    logo: "https://media.api-sports.io/football/teams/40.png",
  },
  {
    name: "Arsenal",
    slug: "arsenal",
    logo: "https://media.api-sports.io/football/teams/42.png",
  },
  {
    name: "Chelsea",
    slug: "chelsea",
    logo: "https://media.api-sports.io/football/teams/49.png",
  },
  {
    name: "Newcastle",
    slug: "newcastle",
    logo: "https://media.api-sports.io/football/teams/34.png",
  },
  {
    name: "Tottenham",
    slug: "tottenham",
    logo: "https://media.api-sports.io/football/teams/47.png",
  },
];

export default function PremierLeagueClient() {
  return (
    <div className="bg-white">
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Squadre della Premier League
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
            Seleziona la tua squadra preferita della Premier League per esplorare le loro maglie
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
              {premierLeagueTeams.map((team) => (
                <SwiperSlide key={team.slug}>
                  <a
                    href={`/shop/premier-league/${team.slug}`}
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
    </div>
  );
}
