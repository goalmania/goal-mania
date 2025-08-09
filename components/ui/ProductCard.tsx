"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { PlayIcon } from "@heroicons/react/24/solid";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  href?: string;
  category?: string;
  team?: string;
  availablePatches?: string[];
  videos?: string[];
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
  cardHeight?: "sm" | "lg";
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
  videos = [],
  badges = [],
  onWishlistToggle,
  isInWishlist,
  onAddToCart,
  showWishlistButton = true,
  showAddToCartButton = false,
  imageAspectRatio = "portrait",
  cardHeight = "lg",
  className = "",
  product,
}: ProductCardProps) {
  const [mounted, setMounted] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Height classes based on cardHeight prop
  const heightClasses = {
    sm: "h-[20rem] md:h-[25rem]",
    lg: "h-[25rem] md:h-[30rem]",
  };

  // Image aspect ratio classes
  const imageAspectClasses = {
    square: "aspect-square",
    portrait: "aspect-[4/4]",
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
        className={`group relative bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden ${heightClasses[cardHeight]} flex flex-col border border-transparent hover:border-[#f5963c] hover:ring-1 hover:ring-[#f5963c] hover:ring-opacity-40 focus-within:border-[#f5963c] focus-within:ring-1 focus-within:ring-[#f5963c] focus-within:ring-opacity-40 transition-all duration-300 m-1 ${className}`}
        style={{ boxShadow: '0 2px 8px 0 rgba(245,150,60,0.08)' }}
      >
        {/* Image section */}
        <div 
          className="flex-shrink-0 relative" 
          style={{ flexBasis: '65%', height: '65%' }}
          onMouseEnter={() => {
            setIsHovered(true);
            if (videos.length > 0) {
              setTimeout(() => setShowVideo(true), 500);
            }
          }}
          onMouseLeave={() => {
            setIsHovered(false);
            setShowVideo(false);
          }}
        >
          <div className={`relative w-full h-full bg-gray-200 overflow-hidden rounded-t-xl ${imageAspectClasses[imageAspectRatio]}`}>
            {/* Video overlay */}
            {videos.length > 0 && showVideo && isHovered ? (
              <video
                src={videos[0]}
                autoPlay
                loop
                muted
                className="object-cover object-center h-full w-full transition-opacity duration-300"
                style={{ opacity: showVideo ? 1 : 0 }}
              />
            ) : (
              <img
                src={image || "/images/image.png"}
                alt={name || "Product image"}
                className="object-contain object-center h-full w-full transition-transform duration-300 ease-in-out group-hover:shadow-[0_0_0_4px_#f5963c55]"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              />
            )}

            {/* Video indicator */}
            {videos.length > 0 && (
              <div className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-full flex items-center gap-1 text-xs">
                <PlayIcon className="h-2.5 w-2.5" />
                <span>{videos.length}</span>
              </div>
            )}
            
            {/* Wishlist button */}
            {showWishlistButton && onWishlistToggle && (
              <button
                onClick={handleWishlistToggle}
                className="absolute right-1.5 top-1.5 rounded-full bg-white/60 backdrop-blur-sm p-1 shadow-sm hover:bg-white/80 transition-colors duration-200 z-10"
                aria-label={
                  isInWishlist && isInWishlist(id)
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
              >
                {isInWishlist && isInWishlist(id) ? (
                  <HeartIconSolid className="h-3 w-3 text-red-500" />
                ) : (
                  <HeartIcon className="h-3 w-3 text-gray-600" />
                )}
              </button>
            )}

            {/* Add to cart button */}
            {showAddToCartButton && onAddToCart && (
              <button
                onClick={handleAddToCart}
                className="absolute left-1.5 top-1.5 rounded-full bg-[#f5963c]/80 backdrop-blur-sm p-1 shadow-sm hover:bg-[#f5963c] transition-colors duration-200 z-10 text-white"
                aria-label="Add to cart"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
              </button>
            )}
            
            {/* Orange animated accent bar on hover */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#f5963c] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </div>
        </div>

        {/* Info section */}
        <div className="flex flex-col flex-grow justify-between p-2 sm:p-3 gap-1" style={{ flexBasis: '35%', height: '35%' }}>
          <div className="mb-1 flex-grow">
            <h3 className="text-xs flex justify-center text-center items-center sm:text-sm font-semibold text-gray-900 group-hover:text-[#f5963c] transition-colors duration-200 line-clamp-2">
              {name}
            </h3>
            
            {/* Category and team info */}
            {(category || team) && (
              <div className="mt-1 flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                {category && (
                  <p className="text-[10px] sm:text-xs text-gray-500">
                    {category}
                  </p>
                )}
                {category && team && (
                  <span className="h-0.5 w-0.5 rounded-full bg-gray-300 hidden sm:block"></span>
                )}
                {team && (
                  <p className="text-[10px] sm:text-xs text-gray-500">
                    {team}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-center mt-auto">
            <p className="text-sm sm:text-base font-bold text-[#f5963c]">
              €{Number(price).toFixed(2)}
            </p>
          </div>

          {/* Badges section */}
          {(availablePatches.length > 0 || badges.length > 0) && (
            <div className="flex flex-wrap gap-0.5 z-10 mt-1">
              {/* Available patches */}
              {availablePatches.map((patch) => (
                <span
                  key={patch}
                  className="bg-[#f5963c]/80 text-white text-[8px] sm:text-[10px] px-1 py-0.5 rounded-full shadow-sm font-medium border border-[#f5963c]/40 backdrop-blur-sm"
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
                  className={`text-[8px] sm:text-[10px] px-1 py-0.5 rounded-full shadow-sm font-medium backdrop-blur-sm ${
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