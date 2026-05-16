"use client";

import { useState, useEffect, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { ArrowRight, Star, Layers, ShoppingCart, Zap, Tag } from "lucide-react";

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
  originalPrice?: number;
  stockCount?: number;
  isNew?: boolean;
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
  originalPrice,
  stockCount,
  isNew,
  // Destructure the new props
  onWishlistToggle,
  onAddToCart,
  isInWishlist: externalIsInWishlist,
}: ProductCardProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Zustand State
  const addItemToCart = useCartStore((state) => state.addItem);
  const buyItem = useCartStore((state) => state.buyItem);

  // Wishlist internal logic fallback
  const internalAddToWishlist = useWishlistStore((state) => state.addItem);
  const internalRemoveFromWishlist = useWishlistStore((state) => state.removeItem);
  const internalIsInWishlist = useWishlistStore((state) => state.isInWishlist(id));

  // Determine which state/check to use
  const activeIsInWishlist = externalIsInWishlist ? externalIsInWishlist(id) : internalIsInWishlist;

  // Compute display values
  const displayOriginalPrice = originalPrice || product?.originalPrice;
  const displayStockCount = stockCount ?? product?.stockCount;
  const displayIsNew = isNew ?? product?.isNew;
  const hasDiscount = displayOriginalPrice && displayOriginalPrice > price;
  const discountPercent = hasDiscount
    ? Math.round((1 - price / displayOriginalPrice) * 100)
    : 0;
  const isLowStock = displayStockCount !== undefined && displayStockCount <= 5 && displayStockCount > 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`bg-[#111] rounded-2xl animate-pulse w-full h-[28rem] ${className}`} />
    );
  }

  // --- Handlers ---

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onWishlistToggle) {
      onWishlistToggle(product);
      return;
    }

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

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    buyItem({ id, name, price, image, quantity: 1 });
    setTimeout(() => {
      router.push("/checkout");
    }, 100);
  };

  const avgRating = product?.averageRating || 5;

  return (
    <div className="w-full h-full">
      <div
        className={`group relative bg-[#0a0a0a] rounded-xl duration-300 h-full flex flex-col border border-white/8 hover:border-[#c8f000]/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setShowVideo(false); }}
      >
        {/* Image Section */}
        <div className="relative overflow-hidden rounded-t-xl bg-[#111]">
          {/* Top Badges Row */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
            {isWorldCup && (
              <span className="bg-[#c8f000] text-black text-[8px] font-black uppercase italic tracking-tighter px-2 py-1 rounded-sm shadow-lg">
                World Cup 26
              </span>
            )}
            {displayIsNew && (
              <span className="bg-blue-500 text-white text-[8px] font-black uppercase tracking-tighter px-2 py-1 rounded-sm shadow-lg">
                Nuovo
              </span>
            )}
            {hasDiscount && (
              <span className="bg-red-500 text-white text-[8px] font-black uppercase tracking-tighter px-2 py-1 rounded-sm shadow-lg flex items-center gap-1">
                <Tag size={8} /> -{discountPercent}%
              </span>
            )}
            {isLowStock && (
              <span className="bg-orange-500/90 text-white text-[8px] font-black uppercase tracking-tighter px-2 py-1 rounded-sm shadow-lg flex items-center gap-1">
                <Zap size={8} /> Ultimi {displayStockCount}!
              </span>
            )}
            {hasLongSleeve && (
              <div className="bg-[#0a0a0a]/90 backdrop-blur-md border border-white/10 p-1.5 rounded-full shadow-sm flex items-center gap-1">
                <Layers size={10} className="text-white" />
                <span className="text-[8px] font-bold text-white pr-1">LS</span>
              </div>
            )}
          </div>

          <Link href={href}>
            <div
              className={`relative w-full ${imageAspectRatio === "square" ? "aspect-square" : "aspect-[4/5]"} overflow-hidden`}
            >
              {product?.videos?.length > 0 && showVideo ? (
                <video src={product.videos[0]} autoPlay loop muted className="object-cover w-full h-full" />
              ) : (
                <Image
                  src={image || "/images/placeholder.png"}
                  alt={name}
                  fill
                  className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  onMouseEnter={() => {
                    if (product?.videos?.length > 0) setTimeout(() => setShowVideo(true), 500);
                  }}
                />
              )}
            </div>
          </Link>

          {/* Quick-add overlay */}
          <div
            className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <button
              onClick={handleAddToCart}
              className={`w-full py-3 text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                addedToCart
                  ? "bg-green-500 text-white"
                  : "bg-[#c8f000] text-black hover:bg-white hover:text-black"
              }`}
            >
              <ShoppingCart size={13} />
              {addedToCart ? "Aggiunto!" : "Aggiungi al Carrello"}
            </button>
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 z-20 p-2.5 bg-[#0a0a0a]/80 backdrop-blur-md rounded-full shadow-sm hover:bg-[#0a0a0a] transition-all active:scale-90"
          >
            {activeIsInWishlist ? (
              <HeartIconSolid className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-white/60" />
            )}
          </button>
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex-grow">
            <h3 className="text-sm md:text-base font-bold text-white line-clamp-2 leading-tight group-hover:text-[#c8f000] transition-colors">
              {name}
            </h3>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mt-1">
              {team || category || "Jersey"}
            </p>

            {/* Stars row */}
            <div className="mt-2 flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={10}
                    fill={star <= Math.round(avgRating) ? "#c8f000" : "none"}
                    color={star <= Math.round(avgRating) ? "#c8f000" : "#555"}
                  />
                ))}
              </div>
              <span className="text-[9px] text-white/30 font-mono">
                ({product?.reviewCount || product?.reviews?.length || 0})
              </span>
            </div>

            {/* Price row */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-lg font-black text-white">€{Number(price).toFixed(2)}</span>
              {hasDiscount && (
                <span className="text-sm text-white/30 line-through font-medium">
                  €{Number(displayOriginalPrice).toFixed(2)}
                </span>
              )}
              {hasDiscount && (
                <span className="text-[9px] font-black text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full">
                  Risparmi €{(displayOriginalPrice - price).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={handleAddToCart}
              className={`w-full py-3 rounded-lg border-2 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                addedToCart
                  ? "border-green-500 bg-green-500 text-white"
                  : "border-white/15 text-white/80 hover:border-[#c8f000] hover:text-[#c8f000]"
              }`}
            >
              <ShoppingCart size={12} />
              {addedToCart ? "Aggiunto!" : "Aggiungi"}
            </button>
            <button
              onClick={handleBuyNow}
              className="w-full py-3 rounded-lg bg-[#c8f000] text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-lime-900/20"
            >
              Compra Ora <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ProductCard);
