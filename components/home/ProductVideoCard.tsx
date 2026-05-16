"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlayIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { ArrowRight } from "lucide-react";

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

export default function ProductVideoCard({
  id,
  name,
  price,
  image,
  href = `/products/${id}`,
  videos = [],
  imageAspectRatio = "square",
  cardHeight = "lg",
  className = "",
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

  if (!mounted) {
    return (
      <div
        className={`bg-[#1a1a1a] rounded-2xl animate-pulse ${heightClasses[cardHeight]} ${className}`}
      />
    );
  }

  return (
    <Link href={href} className="w-full">
      <div
        className={`group relative bg-[#0a0a0a] rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col ${className}`}
      >
        {/* Video / PlayIcon Section */}
        <div
          className="flex-shrink-0 relative"
          onMouseEnter={() => {
            setIsHovered(true);
            if (videos.length > 0) {
              setTimeout(() => setShowVideo(true), 400);
            }
          }}
          onMouseLeave={() => {
            setIsHovered(false);
            setShowVideo(false);
          }}
        >
          <div
            className={`relative w-full bg-[#1a1a1a] overflow-hidden rounded-t-lg ${
              imageAspectRatio === "square"
                ? "aspect-square"
                : imageAspectClasses[imageAspectRatio]
            }`}
          >
            {videos.length > 0 ? (
              showVideo && isHovered ? (
                <video
                  src={videos[0]}
                  autoPlay
                  loop
                  muted
                  className="object-cover object-center h-full w-full transition-opacity duration-300"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-black/60">
                  <PlayIcon className="h-12 w-12 text-white opacity-80" />
                </div>
              )
            ) : (
              <div className="">
                <img src={image} />
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="p-2 sm:p-4 flex flex-col flex-grow">
          <div className="mb-2 flex-grow ">
            <h3 className="text-xs flex justify-start text-left  items-center sm:text-lg md:text-xl font-bold text-white  transition-colors duration-200 line-clamp-2">
              {name}
            </h3>
            <div className="bg-black h-0.5 w-1/2"></div>
          </div>

          {/* Price */}
          <div className="flex items-start justify-start mt-auto">
            <p className="text-xs sm:text-base md:text-lg font-semibold text-[#c8f000]">
              €{Number(price).toFixed(2)}
            </p>
          </div>
          <div className="">
            <button className="flex text-[14px] mt-3.5 items-center">
              Leggi Ora <ArrowRight className="h-3 w-3 text-white" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
