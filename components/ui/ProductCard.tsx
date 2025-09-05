"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { PlayIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "@/lib/hooks/useTranslation";

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
  imageAspectRatio = "square",
  cardHeight = "lg",
  className = "",
  product,
}: ProductCardProps) {
  const [mounted, setMounted] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useTranslation();

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
    <Link href={href} className="w-full">
      <div
        className={`group relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col ${className}`}
      >
        {/* Image section */}
        <div
          className="flex-shrink-0 relative"
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
          <div
            className={`relative w-full bg-gray-200 overflow-hidden rounded-t-lg ${
              imageAspectRatio === "square"
                ? "aspect-square"
                : imageAspectClasses[imageAspectRatio]
            }`}
          >
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
                className="h-full w-full object-cover object-center transform group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              />
            )}
          </div>
        </div>

        {/* Info section */}
        <div className="p-2 sm:p-4 flex flex-col flex-grow">
          <div className="mb-2 flex-grow">
            <h3 className="text-xs flex  justify-start text-left items-center sm:text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2">
              {name}
            </h3>

            {/* Category and team info */}
            {(category || team) && (
              <div className="mt-1 flex items-start justify-start gap-1 sm:gap-2 flex-wrap">
                {category && (
                  <p className="text-[10px] sm:text-xs text-gray-500">
                    {category}
                  </p>
                )}
                {category && team && (
                  <span className="h-1 w-1 rounded-full bg-gray-300 hidden sm:block"></span>
                )}
                {team && (
                  <p className="text-[10px] sm:text-xs text-gray-500">{team}</p>
                )}
              </div>
            )}

            <div className=" flex items-center justify-start gap-1 sm:gap-2">
              {/* Wishlist button */}
              {/* {showWishlistButton && onWishlistToggle && ( */}
                <button
                  onClick={handleWishlistToggle}
                  className=" rounded-full bg-white/80 backdrop-blur-sm p-1.5 sm:p-2.5 shadow-md hover:bg-white transition-colors duration-200 "
                  aria-label={
                    isInWishlist && isInWishlist(id)
                      ? t("product.removeFromWishlist")
                      : t("product.addToWishlist")
                  }
                >
                  {isInWishlist && isInWishlist(id) ? (
                    <HeartIconSolid className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                  ) : (
                    <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                  )}
                </button>
              {/* )} */}

              {/* Wishlist button */}
              {/* Add to cart button */}
              {/* {showAddToCartButton && onAddToCart && ( */}
                <button
                  onClick={handleAddToCart}
                  className=" rounded-full bg-[#f5963c]/80 backdrop-blur-sm p-1 shadow-sm hover:bg-[#f5963c] transition-colors duration-200  text-white"
                  aria-label="Add to cart"
                >
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                    />
                  </svg>
                </button>
              {/* )} */}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-start justify-start mt-auto">
            <p className="text-xs sm:text-base md:text-lg font-semibold text-[#F1803A]">
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
                  style={{ minWidth: "fit-content" }}
                >
                  {patch === "champions-league"
                    ? "Coppa Europea"
                    : patch === "serie-a"
                    ? "Campionato Nazionale"
                    : patch
                        .split("-")
                        .map(
                          (word: string) =>
                            word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                </span>
              ))}

              {/* Custom badges */}
              {badges.map((badge, index) => (
                <span
                  key={index}
                  className={`text-[8px] sm:text-[10px] px-1 py-0.5 rounded-full shadow-sm font-medium backdrop-blur-sm ${
                    badge.bgColor || "bg-gray-500/80"
                  } ${badge.color || "text-white"}`}
                  style={{ minWidth: "fit-content" }}
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
