"use client";

import { useState, useEffect, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { ArrowRight, Star, Layers } from "lucide-react";

// Store Imports
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  href?: string;
  category?: string;
  team?: string;
  isWorldCup?: boolean;
  hasLongSleeve?: boolean;
  product?: any;
  cardHeight?: "sm" | "md" | "lg";
  imageAspectRatio?: "portrait" | "square" | "landscape";
  availablePatches?: string[];
  className?: string;
  badges?: { text: string; bgColor?: string; color?: string }[];
  videos?: string[];
  // --- Add these to fix the "Property does not exist" errors ---
  onWishlistToggle?: (product: any) => void;
  onAddToCart?: (product: any) => void;
  isInWishlist?: (id: string) => boolean;
  showWishlistButton?: boolean;
  showAddToCartButton?: boolean;
}

function ProductCard({
  id,
  name,
  price,
  image,
  href = `/products/${id}`,
  category,
  team,
  isWorldCup,
  hasLongSleeve,
  product,
  imageAspectRatio = "square",
  className = "",
  // Destructure the new props
  onWishlistToggle,
  onAddToCart,
  isInWishlist: externalIsInWishlist,
}: ProductCardProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Zustand State
  const addItemToCart = useCartStore((state) => state.addItem);
  const buyItem = useCartStore((state) => state.buyItem);
  
  // Wishlist internal logic fallback
  const internalAddToWishlist = useWishlistStore((state) => state.addItem);
  const internalRemoveFromWishlist = useWishlistStore((state) => state.removeItem);
  const internalIsInWishlist = useWishlistStore((state) => state.isInWishlist(id));

  // Determine which state/check to use
  const activeIsInWishlist = externalIsInWishlist ? externalIsInWishlist(id) : internalIsInWishlist;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`bg-gray-100 rounded-2xl animate-pulse w-full h-[28rem] ${className}`} />
    );
  }

  // --- Handlers ---

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If parent provided a handler (like in LandingCategorySection), use it
    if (onWishlistToggle) {
      onWishlistToggle(product);
      return;
    }

    // Otherwise use internal fallback
    if (activeIsInWishlist) {
      internalRemoveFromWishlist(id);
    } else {
      internalAddToWishlist({ id, name, price, image, team: team || "" });
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addItemToCart({ id, name, price, image, quantity: 1 });
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    buyItem({ id, name, price, image, quantity: 1 });
    setTimeout(() => {
      router.push("/checkout");
    }, 100);
  };

  return (
    <div className="w-full h-full">
      <div className={`group relative bg-white rounded-xl duration-300 h-full flex flex-col border border-gray-100 hover:shadow-2xl ${className}`}>
        
        {/* Image Section */}
        <div 
          className="relative overflow-hidden rounded-t-xl bg-gray-50"
          onMouseEnter={() => {
            setIsHovered(true);
            if (product?.videos?.length > 0) setTimeout(() => setShowVideo(true), 500);
          }}
          onMouseLeave={() => {
            setIsHovered(false);
            setShowVideo(false);
          }}
        >
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
            {isWorldCup && (
              <span className="bg-indigo-600 text-white text-[9px] font-black uppercase italic tracking-tighter px-2 py-1 rounded-sm shadow-lg">
                World Cup 26
              </span>
            )}
            {hasLongSleeve && (
              <div className="bg-white/90 backdrop-blur-md border border-gray-200 p-1.5 rounded-full shadow-sm flex items-center gap-1">
                <Layers size={10} className="text-gray-900" />
                <span className="text-[8px] font-bold text-gray-900 pr-1">LS Available</span>
              </div>
            )}
          </div>

          <Link href={href}>
            <div className={`relative w-full ${imageAspectRatio === "square" ? "aspect-square" : "aspect-[4/5]"} overflow-hidden`}>
              {product?.videos?.length > 0 && showVideo ? (
                <video src={product.videos[0]} autoPlay loop muted className="object-cover w-full h-full" />
              ) : (
                <Image
                  src={image || "/images/placeholder.png"}
                  alt={name}
                  fill
                  className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              )}
            </div>
          </Link>

          <button 
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 z-20 p-2.5 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:bg-white transition-all active:scale-90"
          >
            {activeIsInWishlist ? (
              <HeartIconSolid className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex-grow">
            <h3 className="text-sm md:text-base font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
              {name}
            </h3>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-1">
              {team || category || "Jersey"}
            </p>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-lg font-black text-[#0A1A2F]">€{Number(price).toFixed(2)}</span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    size={10} 
                    fill={star <= Math.round(product?.averageRating || 5) ? "#FF7A00" : "none"} 
                    color={star <= Math.round(product?.averageRating || 5) ? "#FF7A00" : "#D1D5DB"} 
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex flex-col gap-2">
            <button
              onClick={handleAddToCart}
              className="w-full py-3 rounded-lg border-2 border-[#0A1A2F] text-[10px] font-black uppercase tracking-widest hover:bg-[#0A1A2F] hover:text-white transition-all flex items-center justify-center gap-2"
            >
              Add to Cart <ArrowRight size={14} />
            </button>
            <button
              onClick={handleBuyNow}
              className="w-full py-3 rounded-lg bg-[#FF7A00] text-black text-[10px] font-black uppercase tracking-widest hover:bg-[#e66e00] transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-100"
            >
              Buy Now <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ProductCard);