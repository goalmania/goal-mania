"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import { useTeams } from "@/hooks/useTeams";
import { useI18n } from "@/lib/hooks/useI18n";
import { Skeleton } from "@/components/ui/skeleton";

function ClientSlider({
  isInternational = false,
}: {
  isInternational?: boolean;
}) {
  const { t } = useI18n();
  const {
    teams: rawTeams,
    isLoading,
    error,
  } = useTeams({
    initialLimit: 50,
    initialIsInternational: isInternational,
    initialIsActive: true,
  });

  // Transform API response
  const teams = rawTeams
    .filter((team) => team.logo)
    .map((team) => ({
      _id: team._id,
      name: team.name,
      logo: team.logo,
      href:
        team.href ||
        (isInternational
          ? `/shop/international/${team.slug}`
          : `/shop/serieA/${team.slug}`),
    }));

  const getTitle = () => {
    return isInternational
      ? t("home.internationalTeams")
      : t("home.serieATeams");
  };

  if (error) {
    return (
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            {getTitle()}
          </h2>
          <p className="text-red-600">
            {t("common.error")}: {error}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 text-center">
        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          {getTitle()}
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
         LA TUA SQUADRA like title and Qui trovi tutte le informazioni aggiornate sulla squadra notizie approfondimenti e curiosità. Ma sopratutto potrai scegliere la maglia della tua squadra del cuore attuale o retro
        </p>

        {/* Swiper */}
        <div className="relative">
          {isLoading ? (
            <div className="flex justify-center gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton
                  key={idx}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full"
                />
              ))}
            </div>
          ) : teams.length > 0 ? (
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
              {teams.map((team) => (
                <SwiperSlide key={team._id}>
                  <a
                    href={team.href}
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
          ) : (
            <p className="text-gray-600">{t("common.noData")}</p>
          )}

          {/* Navigation Buttons */}
          {/* <button className="swiper-button-prev-custom absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 hidden sm:block">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-10 h-10 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 
                9.75s4.365 9.75 9.75 9.75 9.75-4.365 
                9.75-9.75S17.385 2.25 12 2.25Zm-4.28 
                9.22a.75.75 0 0 0 0 1.06l3.25 
                3.25a.75.75 0 1 0 1.06-1.06l-1.97-1.97h6.14a.75.75 
                0 0 0 0-1.5H10.06l1.97-1.97a.75.75 
                0 1 0-1.06-1.06l-3.25 3.25Z"
              />
            </svg>
          </button>

          <button className="swiper-button-next-custom absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 hidden sm:block">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-10 h-10 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 
                9.75s4.365 9.75 9.75 9.75 9.75-4.365 
                9.75-9.75S17.385 2.25 12 2.25Zm4.28 
                9.22a.75.75 0 0 0 0-1.06l-3.25-3.25a.75.75 
                0 1 0-1.06 1.06l1.97 1.97H8.06a.75.75 
                0 0 0 0 1.5h6.14l-1.97 1.97a.75.75 
                0 1 0 1.06 1.06l3.25-3.25Z"
              />
            </svg>
          </button> */}

          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4 mt-10">
            <button
              aria-label="Previous featured products"
              className="swiper-button-prev-custom  flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md hover:bg-gray-100"
            >
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              aria-label="Next featured products"
              className="swiper-button-next-custom  flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md hover:bg-gray-100"
            >
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ClientSlider;
