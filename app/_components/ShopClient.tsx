"use client";
import ProductGridWrapper from "@/app/_components/ProductGridWrapper";
import FAQ from "@/app/_components/FAQ";
import Guarantees from "@/app/_components/Guarantees";
import ReviewsSlider from "@/app/_components/ReviewsSlider";
import { Suspense, useState, useMemo } from "react";
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
import { CheckCircle2, SparklesIcon, Star, SlidersHorizontal, X, ChevronDown, Grid3X3, List, TrendingUp, Clock, Tag, ArrowUp, ArrowDown, Percent } from "lucide-react";
import Testimonies from "@/components/shop/testimonies";
import VideoComp from "@/components/home/VideoComp";
import LandingCategorySection from "@/app/_components/LandingCategorySection";
import RestOfWorldClient from "@/app/_components/RestOfWorldClient";
import LimitedEditionClient from "@/app/_components/LimitedEditionClient";
import PremierLeagueClient from "@/app/_components/PremierLeagueClient";
import SerieATeamsClient from "@/app/_components/SerieATeamsClient";

// ── Shop Filter & Sort Bar ──────────────────────────────────────
type SortOption = "bestseller" | "newest" | "price_asc" | "price_desc" | "discount";

interface ShopFilterBarProps {
  totalCount: number;
  shownCount: number;
  onSortChange: (sort: SortOption) => void;
  activeSort: SortOption;
  activeFilters: string[];
  onRemoveFilter: (filter: string) => void;
}

function ShopFilterBar({ totalCount, shownCount, onSortChange, activeSort, activeFilters, onRemoveFilter }: ShopFilterBarProps) {
  const [sortOpen, setSortOpen] = useState(false);

  const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: "bestseller", label: "Più Venduti", icon: <TrendingUp size={12} /> },
    { value: "newest", label: "Novità", icon: <Clock size={12} /> },
    { value: "price_asc", label: "Prezzo ↑", icon: <ArrowUp size={12} /> },
    { value: "price_desc", label: "Prezzo ↓", icon: <ArrowDown size={12} /> },
    { value: "discount", label: "Scontati", icon: <Percent size={12} /> },
  ];

  const currentSort = sortOptions.find((s) => s.value === activeSort)!;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Results count */}
        <p className="text-[11px] text-white/40" style={{ fontFamily: "var(--font-mono, monospace)" }}>
          Mostrando <span className="text-white font-black">{shownCount}</span> di{" "}
          <span className="text-white font-black">{totalCount}</span> maglie
        </p>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold transition-all"
            style={{
              background: "#111",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)",
              fontFamily: "var(--font-mono, monospace)",
            }}
          >
            {currentSort.icon}
            {currentSort.label}
            <ChevronDown size={11} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
          </button>

          {sortOpen && (
            <div
              className="absolute right-0 top-full mt-2 z-30 rounded-xl overflow-hidden min-w-[160px]"
              style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 16px 48px rgba(0,0,0,0.6)" }}
            >
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { onSortChange(opt.value); setSortOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-bold text-left transition-all hover:bg-white/5"
                  style={{
                    color: activeSort === opt.value ? "#c8f000" : "rgba(255,255,255,0.6)",
                    fontFamily: "var(--font-mono, monospace)",
                    background: activeSort === opt.value ? "rgba(200,240,0,0.06)" : "transparent",
                  }}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <span
              key={filter}
              className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full cursor-pointer transition-all hover:opacity-80"
              style={{
                background: "rgba(200,240,0,0.1)",
                color: "#c8f000",
                border: "1px solid rgba(200,240,0,0.25)",
                fontFamily: "var(--font-mono, monospace)",
              }}
              onClick={() => onRemoveFilter(filter)}
            >
              {filter}
              <X size={9} />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

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
  videos?: string[];
}

import WorldCupShowcase from "@/components/home/WorldCupShowCase";

export default function ShopClient({
  latestProducts = [],
  bestSellingProducts = [],
  featuredProducts = [],
  mysteryBoxProducts = [],
  videoProducts = [],
  worldCupTeams = [],
}: {
  latestProducts: Product[];
  bestSellingProducts: Product[];
  featuredProducts: Product[];
  mysteryBoxProducts: Product[];
  videoProducts?: Product[];
  worldCupTeams?: any[];
}) {
  const { t } = useI18n();
  const [activeSort, setActiveSort] = useState<SortOption>("bestseller");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [latestVisible, setLatestVisible] = useState(12);

  const handleRemoveFilter = (filter: string) => {
    setActiveFilters((prev) => prev.filter((f) => f !== filter));
  };

  // Sort products based on activeSort
  const sortProducts = (products: Product[]): Product[] => {
    switch (activeSort) {
      case "newest": return [...products]; // assume already newest-first from API
      case "price_asc": return [...products].sort((a, b) => a.price - b.price);
      case "price_desc": return [...products].sort((a, b) => b.price - a.price);
      case "bestseller": return [...products];
      default: return products;
    }
  };

  const sortedLatest = useMemo(() => sortProducts(latestProducts), [latestProducts, activeSort]);
  const sortedBestsellers = useMemo(() => sortProducts(bestSellingProducts), [bestSellingProducts, activeSort]);

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
    <div className="bg-[#0a0a0a] font-munish  ">
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

      {/* World Cup Slider Section */}
      <WorldCupShowcase teams={worldCupTeams} />

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

      {/* Premier League Teams Section */}
      <PremierLeagueClient />

      {/* Serie A Teams Section */}
      <SerieATeamsClient />

      {/* Latest Products Section */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-[47px] font-medium tracking-tight text-white">
            Ultimi prodotti
          </h2>
          <p className="text-[18px] text-white/60 text-center">
            Comfort e stile in un solo capo.
          </p>
        </div>

        {/* Filter bar */}
        <div className="mb-6">
          <ShopFilterBar
            totalCount={sortedLatest.length}
            shownCount={Math.min(latestVisible, sortedLatest.length)}
            onSortChange={setActiveSort}
            activeSort={activeSort}
            activeFilters={activeFilters}
            onRemoveFilter={handleRemoveFilter}
          />
        </div>

        {sortedLatest.length === 0 ? (
          <div className="text-center py-20 rounded-2xl" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-black text-white mb-2" style={{ fontFamily: "var(--font-display, sans-serif)" }}>
              Nessun risultato trovato
            </h3>
            <p className="text-white/40 text-sm mb-6">Prova a rimuovere i filtri attivi</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-black text-black text-sm uppercase tracking-widest transition-all hover:opacity-90"
              style={{ background: "#c8f000", fontFamily: "var(--font-display, sans-serif)" }}
            >
              Vedi tutti i prodotti
            </Link>
          </div>
        ) : (
          <>
            <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-[#111]" />}>
              <ProductGridWrapper products={sortedLatest.slice(0, latestVisible)} />
            </Suspense>

            {latestVisible < sortedLatest.length && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setLatestVisible((v) => v + 8)}
                  className="px-8 py-4 rounded-full font-black uppercase text-sm tracking-widest transition-all hover:opacity-90 hover:-translate-y-0.5"
                  style={{
                    background: "#111",
                    color: "#c8f000",
                    border: "1.5px solid rgba(200,240,0,0.3)",
                    fontFamily: "var(--font-display, sans-serif)",
                    letterSpacing: "2px",
                  }}
                >
                  Carica altri ({sortedLatest.length - latestVisible} rimanenti)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Best Selling Products Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-[47px] font-medium tracking-tight text-white">
            Più venduti
          </h2>
          <p className="text-[18px] text-white/60 text-center">
            Il capo che unisce la comodità di un fit impeccabile alla
            raffinatezza di un design curato nei dettagli.
          </p>
        </div>
        <div className="mb-6">
          <ShopFilterBar
            totalCount={sortedBestsellers.length}
            shownCount={sortedBestsellers.length}
            onSortChange={setActiveSort}
            activeSort={activeSort}
            activeFilters={[]}
            onRemoveFilter={handleRemoveFilter}
          />
        </div>
        {sortedBestsellers.length === 0 ? (
          <div className="text-center py-20 rounded-2xl" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-black text-white mb-2" style={{ fontFamily: "var(--font-display, sans-serif)" }}>
              Nessun bestseller disponibile
            </h3>
            <p className="text-white/40 text-sm">Controlla presto per nuovi arrivi!</p>
          </div>
        ) : (
          <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-[#111]" />}>
            <ProductGridWrapper products={sortedBestsellers} />
          </Suspense>
        )}
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
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-300 hover:to-orange-400 font-bold px-8 py-6 text-lg rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      🎁 Scopri i Mystery Box
                    </Button>
                  </Link>
                  <div className="flex items-center gap-2 bg-[#0a0a0a]/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
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
                  className="bg-[#0a0a0a]/20 text-white/60 px-8 py-6 text-lg rounded-full cursor-not-allowed"
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
                    className="group relative bg-[#0a0a0a]/10 backdrop-blur-sm rounded-2xl border border-white/30 p-6 hover:bg-[#0a0a0a]/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  >
                    {/* Mystery Box Icon */}
                    <div className="absolute top-4 right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm animate-pulse">
                      🎁
                    </div>

                    <div className="aspect-square bg-[#0a0a0a]/20 rounded-xl mb-4 relative overflow-hidden">
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
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-semibold">
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

      {/* Video Section - Always render, VideoComp will show admin videos or demo videos as fallback */}
      <VideoComp products={videoProducts || []} />

      {/* Category Sections */}
      <LandingCategorySection title="Serie A" category="Serie A" />
      <RestOfWorldClient />
      <LimitedEditionClient />
      <LandingCategorySection title="Jackets" category="Jackets" />
      <LandingCategorySection title="Maglie Retro" category="Retro" />

      <ProductShowCase
        featuredProduct={featuredProduct}
        featuredProduct2={featuredProduct2}
        featuredProduct3={featuredProduct3}
      />

      {/* Customer Reviews Section */}
      <Suspense
        fallback={<div className="h-64 bg-[#111] animate-pulse"></div>}
      >
        <div className="hidden">
          <ReviewsSlider />
        </div>
      </Suspense>

      {/* Guarantees Section */}
      <div className="bg-[#0a0a0a] py-16 sm:py-24 hidden">
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
