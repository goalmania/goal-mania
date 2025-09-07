"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function ProductShowCase({
  featuredProduct,
  featuredProduct2,
  featuredProduct3,
}: {
  featuredProduct?: any;
  featuredProduct2?: any;
  featuredProduct3?: any;
}) {
  const slides = [
    featuredProduct && (
      <div className="relative bg-gray-200 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row items-center p-6 md:p-0">
        <div className="md:w-1/2 p-6 order-2 md:order-1 text-center md:text-left">
          <h3 className="text-3xl font-bold text-gray-800 mb-4">
            Qualità Super
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Le nostre maglie sono capi curati nei minimi dettagli con materiali
            premium. Perfetta per i veri appassionati che vogliono collezionare
            emozioni, non solo tessuto.
          </p>
          <a
            href={`/products/${featuredProduct.id}`}
            className="inline-block bg-orange-500 rounded-full text-white px-6 py-3 font-semibold hover:bg-orange-600 transition-colors"
          >
            Buy Now →
          </a>
        </div>
        <div className="md:w-1/2 h-64 md:h-auto overflow-hidden order-1 md:order-2 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-blue-900 clip-product-bg md:clip-product-bg-md"></div>
          <img
            src={featuredProduct.image}
            alt={featuredProduct.name}
            className="relative z-10 w-full h-full object-contain transform scale-110 md:scale-100"
          />
        </div>
      </div>
    ),
    featuredProduct2 && (
      <div className="relative bg-gray-200 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row items-center p-6 md:p-0">
        <div className="md:w-1/2 p-6 order-2 md:order-1 text-center md:text-left">
          <h3 className="text-3xl font-bold text-[#0A1A2F] mb-4">
            Modelli introvabili
          </h3>
          <p className="text-[#0A1A2F] mb-6 leading-relaxed">
            Associa un testo o un'immagine per dare importanza al prodotto, alla
            collezione o all'articolo del blog di tua scelta. Aggiungi dettagli
            sulla disponibilità, sullo stile o fornisci una recensione.
          </p>
          <a
            href={`/products/${featuredProduct2.id}`}
            className="inline-block bg-orange-500 rounded-full text-white px-6 py-3 font-semibold hover:bg-orange-600 transition-colors"
          >
            Buy Now →
          </a>
        </div>
        <div className="md:w-1/2 h-64 md:h-auto overflow-hidden order-1 md:order-2 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-blue-900 clip-product-bg md:clip-product-bg-md"></div>
          <img
            src={featuredProduct2.image}
            alt={featuredProduct2.name}
            className="relative z-10 w-full h-full object-contain transform scale-110 md:scale-100"
          />
        </div>
      </div>
    ),
    featuredProduct3 && (
      <div className="relative bg-gray-200 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row items-center p-6 md:p-0">
        <div className="md:w-1/2 p-6 order-2 md:order-1 text-center md:text-left">
          <h3 className="text-3xl font-bold text-gray-800 mb-4">
            Vestibilità perfetta
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Associa un testo o un'immagine per dare importanza al prodotto, alla
            collezione o all'articolo del blog di tua scelta. Aggiungi dettagli
            sulla disponibilità, sullo stile o fornisci una recensione.
          </p>
          <Link
            href={`/products/${featuredProduct3.id}`}
            className="inline-block bg-orange-500 rounded-full text-white px-6 py-3 font-semibold hover:bg-orange-600 transition-colors"
          >
            Buy Now →
          </Link>
        </div>
        <div className="md:w-1/2 h-64 md:h-auto overflow-hidden order-1 md:order-2 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-blue-900 clip-product-bg md:clip-product-bg-md"></div>
          <img
            src={featuredProduct3.image}
            alt={featuredProduct3.name}
            className="relative z-10 w-full h-full object-contain transform scale-110 md:scale-100"
          />
        </div>
      </div>
    ),
  ].filter(Boolean); // remove empty

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container  mx-auto px-4 lg:px-20 flex justify-start items-start relative">
        <Swiper
          modules={[Navigation, Pagination]}
          navigation={{
            nextEl: ".procustom-next",
            prevEl: ".procustom-prev",
          }}
          spaceBetween={24}
          pagination={{ clickable: true }}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1028: { slidesPerView: 2 },
          }}
          className="!pb-12"
        >
          {slides.map((slide, i) => (
            <SwiperSlide key={i}>{slide}</SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Bottom-Center Navigation */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-10">
          <button className="procustom-prev bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-2 shadow">
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
          <button className="procustom-next bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-2 shadow">
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
    </section>
  );
}
