"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  href?: string;
  category?: string;
  team?: string;
  availablePatches?: string[];
  badges?: Array<{
    text: string;
    color?: string;
    bgColor?: string;
  }>;
  onWishlistToggle?: (product: any) => void;
  isInWishlist?: (id: string) => boolean;
  onAddToCart?: (product: any) => void;
  showWishlistButton?: boolean;
  showAddToCartButton?: boolean;
  imageAspectRatio?: "square" | "portrait" | "landscape";
  cardHeight?: "sm" | "md" | "lg";
  className?: string;
  product?: any; // Full product object for callbacks
}

export default function ProductCard({
  id,
  name,
  price,
  image,
  href = `/products/${id}`,
  category,
  team,
  availablePatches = [],
  badges = [],
  onWishlistToggle,
  isInWishlist,
  onAddToCart,
  showWishlistButton = true,
  showAddToCartButton = false,
  imageAspectRatio = "portrait",
  cardHeight = "md",
  className = "",
  product,
}: ProductCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Height classes based on cardHeight prop
  const heightClasses = {
    sm: "h-[30rem] md:h-[35rem]",
    md: "h-[40rem] md:h-[45rem]",
    lg: "h-[50rem] md:h-[55rem]",
  };

  // Image aspect ratio classes
  const imageAspectClasses = {
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
  };

  // Avoid rendering until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div
        className={`bg-gray-200 rounded-2xl animate-pulse ${heightClasses[cardHeight]} ${className}`}
      />
    );
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWishlistToggle && product) {
      onWishlistToggle(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart && product) {
      onAddToCart(product);
    }
  };

  return (
    <Link href={href} className="h-full w-full">
      <div
        className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden ${heightClasses[cardHeight]} flex flex-col border border-transparent hover:border-[#f5963c] hover:ring-2 hover:ring-[#f5963c] hover:ring-opacity-40 focus-within:border-[#f5963c] focus-within:ring-2 focus-within:ring-[#f5963c] focus-within:ring-opacity-40 transition-all duration-300 m-2 ${className}`}
        style={{ boxShadow: '0 4px 16px 0 rgba(245,150,60,0.10)' }}
      >
        {/* Image section */}
        <div className="flex-shrink-0 relative" style={{ flexBasis: '70%', height: '70%' }}>
          <div className={`relative w-full h-full bg-gray-200 overflow-hidden rounded-t-2xl ${imageAspectClasses[imageAspectRatio]}`}>
            <Image
              src={image || "/images/image.png"}
              alt={name || "Product image"}
              fill
              className="object-cover object-center h-full w-full group-hover:scale-110 transition-transform duration-300 ease-in-out group-hover:shadow-[0_0_0_4px_#f5963c55]"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            />
            
            {/* Wishlist button */}
            {showWishlistButton && onWishlistToggle && (
              <button
                onClick={handleWishlistToggle}
                className="absolute right-2 top-2 rounded-full bg-white/60 backdrop-blur-sm p-1.5 sm:p-2 shadow-sm hover:bg-white/80 transition-colors duration-200 z-10"
                aria-label={
                  isInWishlist && isInWishlist(id)
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
              >
                {isInWishlist && isInWishlist(id) ? (
                  <HeartIconSolid className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
                ) : (
                  <HeartIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />
                )}
              </button>
            )}

            {/* Add to cart button */}
            {showAddToCartButton && onAddToCart && (
              <button
                onClick={handleAddToCart}
                className="absolute left-2 top-2 rounded-full bg-[#f5963c]/80 backdrop-blur-sm p-1.5 sm:p-2 shadow-sm hover:bg-[#f5963c] transition-colors duration-200 z-10 text-white"
                aria-label="Add to cart"
              >
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
              </button>
            )}
            
            {/* Orange animated accent bar on hover */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#f5963c] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </div>
        </div>

        {/* Info section */}
        <div className="flex flex-col flex-grow justify-between p-4 sm:p-6 gap-2" style={{ flexBasis: '20%', height: '20%' }}>
          <div className="mb-2 flex-grow">
            <h3 className="text-sm flex justify-center text-center items-center sm:text-base font-semibold text-gray-900 group-hover:text-[#f5963c] transition-colors duration-200 line-clamp-2">
              {name}
            </h3>
            
            {/* Category and team info */}
            {(category || team) && (
              <div className="mt-2 flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                {category && (
                  <p className="text-xs sm:text-sm text-gray-500">
                    {category}
                  </p>
                )}
                {category && team && (
                  <span className="h-1 w-1 rounded-full bg-gray-300 hidden sm:block"></span>
                )}
                {team && (
                  <p className="text-xs sm:text-sm text-gray-500">
                    {team}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-center mt-auto">
            <p className="text-base sm:text-lg md:text-xl font-bold text-[#f5963c]">
              €{Number(price).toFixed(2)}
            </p>
          </div>

          {/* Badges section */}
          {(availablePatches.length > 0 || badges.length > 0) && (
            <div className="flex flex-wrap gap-1 z-10 mt-2">
              {/* Available patches */}
              {availablePatches.map((patch) => (
                <span
                  key={patch}
                  className="bg-[#f5963c]/80 text-white text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full shadow-sm font-medium border border-[#f5963c]/40 backdrop-blur-sm"
                  style={{ minWidth: 'fit-content' }}
                >
                  {patch === "champions-league"
                    ? "Coppa Europea"
                    : patch === "serie-a"
                    ? "Campionato Nazionale"
                    : patch
                        .split("-")
                        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")}
                </span>
              ))}
              
              {/* Custom badges */}
              {badges.map((badge, index) => (
                <span
                  key={index}
                  className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full shadow-sm font-medium backdrop-blur-sm ${
                    badge.bgColor || 'bg-gray-500/80'
                  } ${
                    badge.color || 'text-white'
                  }`}
                  style={{ minWidth: 'fit-content' }}
                >
                  {badge.text}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
} 