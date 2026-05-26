"use client";

import { useRef, useState, useCallback } from "react";
import ProductCard from "./ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, A11y } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/free-mode";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  team?: string;
  availablePatches?: string[];
  videos?: string[];
  [key: string]: any;
}

interface ProductGridProps {
  products: Product[];
  onWishlistToggle?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  isInWishlist?: (id: string) => boolean;
  showWishlistButton?: boolean;
  showAddToCartButton?: boolean;
  gridCols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: "sm" | "md" | "lg";
  cardHeight?: "sm" | "lg";
  imageAspectRatio?: "square" | "portrait" | "landscape";
  className?: string;
  customBadges?: (product: Product) => Array<{
    text: string;
    color?: string;
    bgColor?: string;
  }>;
}

// Arrow button component
function ArrowBtn({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95"
      style={{
        background: disabled ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)",
        border: disabled
          ? "1px solid rgba(255,255,255,0.05)"
          : "1px solid rgba(200,240,0,0.25)",
        color: disabled ? "rgba(255,255,255,0.2)" : "#c8f000",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {direction === "prev" ? (
          <polyline points="15 18 9 12 15 6" />
        ) : (
          <polyline points="9 18 15 12 9 6" />
        )}
      </svg>
    </button>
  );
}

export default function ProductGrid({
  products,
  onWishlistToggle,
  onAddToCart,
  isInWishlist,
  showWishlistButton = true,
  showAddToCartButton = false,
  gridCols = 4,
  gap = "md",
  cardHeight = "lg",
  imageAspectRatio = "square",
  className = "",
  customBadges,
}: ProductGridProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const handleSwiper = useCallback((swiper: SwiperType) => {
    swiperRef.current = swiper;
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  }, []);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  }, []);

  const gapClasses = { sm: "gap-2", md: "gap-3 sm:gap-6", lg: "gap-6" };
  const gridColClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
    6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6",
  };

  // Use Swiper carousel for > 3 products
  if (products.length > 3) {
    return (
      <div className={`relative ${className}`}>
        {/* Navigation header */}
        <div className="flex items-center justify-end gap-2 mb-4">
          <ArrowBtn
            direction="prev"
            disabled={isBeginning}
            onClick={() => swiperRef.current?.slidePrev()}
          />
          <ArrowBtn
            direction="next"
            disabled={isEnd}
            onClick={() => swiperRef.current?.slideNext()}
          />
        </div>

        <Swiper
          modules={[Navigation, FreeMode, A11y]}
          onSwiper={handleSwiper}
          onSlideChange={handleSlideChange}
          onReachBeginning={() => setIsBeginning(true)}
          onReachEnd={() => setIsEnd(true)}
          spaceBetween={12}
          slidesPerView={1.2}
          freeMode={{ enabled: true, momentum: true, momentumRatio: 0.5 }}
          grabCursor={true}
          a11y={{ enabled: true }}
          breakpoints={{
            480:  { slidesPerView: 2.1,  spaceBetween: 14 },
            768:  { slidesPerView: 3.1,  spaceBetween: 16, freeMode: { enabled: false } },
            1024: { slidesPerView: 4,    spaceBetween: 20, freeMode: { enabled: false } },
            1280: { slidesPerView: 4,    spaceBetween: 24, freeMode: { enabled: false } },
          }}
          className="!overflow-visible"
          style={{ paddingBottom: "4px" }}
        >
          {products.map((product) => (
            <SwiperSlide key={product.id} style={{ height: "auto" }}>
              <ProductCard
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
                href={`/products/${product.id}`}
                category={product.category}
                team={product.team}
                availablePatches={product.availablePatches}
                videos={product.videos}
                badges={customBadges ? customBadges(product) : []}
                onWishlistToggle={onWishlistToggle}
                isInWishlist={isInWishlist}
                onAddToCart={onAddToCart}
                showWishlistButton={showWishlistButton}
                showAddToCartButton={showAddToCartButton}
                imageAspectRatio={imageAspectRatio}
                cardHeight={cardHeight}
                product={product}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  }

  // Static grid for ≤ 3 products
  return (
    <div className={`grid ${gridColClasses[gridCols]} ${gapClasses[gap]} ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          price={product.price}
          image={product.image}
          href={`/products/${product.id}`}
          category={product.category}
          team={product.team}
          availablePatches={product.availablePatches}
          videos={product.videos}
          badges={customBadges ? customBadges(product) : []}
          onWishlistToggle={onWishlistToggle}
          isInWishlist={isInWishlist}
          onAddToCart={onAddToCart}
          showWishlistButton={showWishlistButton}
          showAddToCartButton={showAddToCartButton}
          imageAspectRatio={imageAspectRatio}
          cardHeight={cardHeight}
          product={product}
        />
      ))}
    </div>
  );
}
