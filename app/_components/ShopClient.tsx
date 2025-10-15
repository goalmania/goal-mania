"use client";
import ProductGridWrapper from "@/app/_components/ProductGridWrapper";
import FAQ from "@/app/_components/FAQ";
import Guarantees from "@/app/_components/Guarantees";
import ReviewsSlider from "@/app/_components/ReviewsSlider";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import ShopSearchBar from "./ShopSearchBar";
import { TeamCarousel } from "@/components/home/TeamCarousel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/hooks/useI18n";
import ShopBanner from "@/components/shop/ShopBanner";
import ShopImageCard from "@/components/home/ShopImageCard";
import ProductShowCase from "@/components/shop/ProductShowcase";
import FaqSection from "./FaqSection";
import FeaturesCardStats from "@/components/shop/FeaturesCardStats";
import { CheckCircle2, SparklesIcon, Star } from "lucide-react";
import Testimonies from "@/components/shop/testimonies";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  team: string;
  availablePatches?: string[];
}

export default function ShopClient({
  season2025Products = [],
  featuredProducts = [],
  mysteryBoxProducts = [],
}: {
  season2025Products: Product[];
  featuredProducts: Product[];
  mysteryBoxProducts: Product[];
}) {
  const { t } = useI18n();

  // Extract featured products
  const featuredProduct = featuredProducts[0] || null;
  const featuredProduct2 = featuredProducts[1] || null;
  const featuredProduct3 = featuredProducts[2] || null;

  // SHOP BANNER CONTENT
  const ShopbannerData = {
    title: `${t("Trova la Maglia che Rispecchia il Tuo Tifo")}`,
    subtitle: `${t(
      " Esplora la nostra vasta gamma di capi realizzati con cura, pensati per esaltare la tua individualità e soddisfare il tuo senso dello stile."
    )}`,
    buttons: [
      { text: `${t("Ultime Notizie")}`, href: `news` },
      { text: `${t("Maglie Attuali")}`, href: `/shop/2025/26` },
      { text: `${t("Maglie Retro")}`, href: `/shop/retro` },
    ],
    imageUrl: `/images/recentUpdate/product-banner.jpg`, // This uses the uploaded image
  };

  return (
    <div className="bg-white font-munish  ">
      <ShopSearchBar />

      <section className="relative">
        <img
          src={`/images/recentUpdate/mobile-banner-logo.png`}
          alt="Banner Background"
          className="w-15 h-15 absolute z-10  lg:hidden  top-10 right-3 "
        />
        <ShopBanner
          title={ShopbannerData.title}
          subtitle={ShopbannerData.subtitle}
          buttons={ShopbannerData.buttons}
          imageUrl={ShopbannerData.imageUrl}
        />
      </section>
      <div className="hidden">
        <TeamCarousel />

        {/* Customer Satisfaction Message */}
        <div className="bg-gray-800 py-10 sm:py-16 hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
                Oltre 1200 Clienti Felici ⭐️{" "}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base md:text-lg text-white">
                Oltre 1200 persone hanno scelto di fare parte della nostra
                famiglia di clienti soddisfatti. La qualità dei nostri prodotti
                e l&apos;attenzione che dedichiamo a ogni dettaglio hanno reso
                ogni acquisto un&apos;esperienza positiva.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Maglie 2025/26 Section */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <h2 className="text-[47px] font-medium tracking-tight text-[#0A1A2F]">
            Ultimi prodotti
          </h2>
          <p className="text-[18px]  text-[#333333] text-center ">
            Comfort e stile in un solo capo.
          </p>
        </div>
        <div className="my-6">
          {season2025Products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nessun prodotto disponibile in questa categoria.</p>
            </div>
          ) : (
            <Suspense fallback={<div>Loading...</div>}>
              <ProductGridWrapper products={season2025Products} />
            </Suspense>
          )}
        </div>
      </div>

      {/* Maglie 2025/26 Section */}
      <div className="mx-auto max-w-7xl px-4  sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <h2 className="text-[47px] font-medium tracking-tight text-[#0A1A2F]">
            Più venduti
          </h2>
          <p className="text-[18px]  text-[#333333] text-center ">
            Il capo che unisce la comodità di un fit impeccabile alla
            raffinatezza di un design curato nei dettagli.
          </p>
        </div>
        <div className="my-6">
          {season2025Products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nessun prodotto disponibile in questa categoria.</p>
            </div>
          ) : (
            <Suspense fallback={<div>Loading...</div>}>
              <ProductGridWrapper products={season2025Products} />
            </Suspense>
          )}
        </div>
      </div>

      {/* Mystery Box Section */}
      <div className="overflow-hidden gradient">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center flex justify-center flex-col">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 flex text-center justify-center items-center gap-2">
              {t("mysteryBox.title")}
              <SparklesIcon className="h-6 w-6 text-yellow-300" />
            </h1>

            <p className="mx-auto max-w-3xl text-xl sm:text-2xl text-purple-100 mb-8">
              {t("mysteryBox.description")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {mysteryBoxProducts.length > 0 ? (
                <>
                  <Link href="/shop/mystery-box">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 hover:from-yellow-300 hover:to-orange-400 font-bold px-8 py-6 text-lg rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      🎁 Scopri i Mystery Box
                    </Button>
                  </Link>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                    <CheckCircle2 className="w-5 h-5 text-green-300" />
                    <span className="text-white font-medium">
                      {mysteryBoxProducts.length} Box Disponibili
                    </span>
                  </div>
                </>
              ) : (
                <Button
                  size="lg"
                  disabled
                  className="bg-white/20 text-white/60 px-8 py-6 text-lg rounded-full cursor-not-allowed"
                >
                  Disponibile Presto
                </Button>
              )}
            </div>
          </div>

          {/* Mystery Box Products Grid - Centered for 1-2 items */}
          {mysteryBoxProducts.length > 0 && (
            <div className="mt-12 flex justify-center">
              <div
                className={`grid gap-6 ${
                  mysteryBoxProducts.length === 1
                    ? "grid-cols-1 max-w-md"
                    : mysteryBoxProducts.length === 2
                    ? "grid-cols-1 sm:grid-cols-2 max-w-3xl"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full"
                }`}
              >
                {mysteryBoxProducts.map((product, index) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group relative bg-white/10 backdrop-blur-sm rounded-2xl border border-white/30 p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  >
                    {/* Mystery Box Icon */}
                    <div className="absolute top-4 right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm animate-pulse">
                      🎁
                    </div>

                    <div className="aspect-square bg-white/20 rounded-xl mb-4 relative overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover object-center group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>

                    <h3 className="text-white font-bold text-lg mb-2 group-hover:text-yellow-300 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-purple-100 text-sm mb-4">
                      Contenuto a sorpresa • Valore garantito
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-white">
                        €{product.price.toFixed(2)}
                      </span>
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-4 py-2 rounded-full font-semibold">
                        Scopri →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ProductShowCase
        featuredProduct={featuredProduct}
        featuredProduct2={featuredProduct2}
        featuredProduct3={featuredProduct3}
      />

      {/* Customer Reviews Section */}
      <Suspense
        fallback={<div className="h-64 bg-gray-100 animate-pulse"></div>}
      >
        <div className="hidden">
          <ReviewsSlider />
        </div>
      </Suspense>

      {/* Guarantees Section */}
      <div className="bg-gray-50 py-16 sm:py-24 hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Guarantees />
        </div>
      </div>

      {/* Customer Satisfaction Banner */}
      <div className=" p-6">
        <div className=" ">
          <Testimonies />
        </div>
      </div>
      <FeaturesCardStats />

      {/* FAQ Section */}
      <div className="">
        <FAQ />
      </div>
    </div>
  );
}
