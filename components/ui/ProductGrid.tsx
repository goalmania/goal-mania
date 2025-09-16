"use client";

import ProductCard from "./ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  team?: string;
  availablePatches?: string[];
  videos?: string[];
  [key: string]: any; // Allow additional properties
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
  // Grid column classes
  const gridColClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
    6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6",
  };

  // Gap classes
  const gapClasses = {
    sm: "gap-2",
    md: "gap-3 sm:gap-6",
    lg: "gap-6",
  };

  // If more than 3 products -> use Swiper
  if (products.length > 3) {
    return (
      <div className="relative pb-20">
        <Swiper
          modules={[Navigation]}
          navigation={{
            nextEl: ".custom-next",
            prevEl: ".custom-prev",
          }}
          spaceBetween={16}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
          className={`!px-2 ${className}`}
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
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

        {/* Custom Bottom-Center Navigation */}
        <div className="absolute  left-1/2 -translate-x-1/2 flex gap-4 z-10">
          <button className="custom-prev bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-2 shadow">
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
          <button className="custom-next bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-2 shadow">
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
    );
  }

  // Otherwise -> keep existing grid layout
  return (
    <div
      className={`grid ${gridColClasses[gridCols]} ${gapClasses[gap]} ${className}`}
    >
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
