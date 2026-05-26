"use client";

import { useState, useEffect, useRef, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { ShoppingCart, Star, Zap, Tag, Eye } from "lucide-react";

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
  onWishlistToggle,
  onAddToCart,
  isInWishlist: externalIsInWishlist,
}: ProductCardProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartFlyAnim, setCartFlyAnim] = useState(false);
  const [viewersCount] = useState(() => Math.floor(Math.random() * 30) + 8);

  const addItemToCart = useCartStore((state) => state.addItem);
  const buyItem = useCartStore((state) => state.buyItem);

  const internalAddToWishlist = useWishlistStore((state) => state.addItem);
  const internalRemoveFromWishlist = useWishlistStore((state) => state.removeItem);
  const internalIsInWishlist = useWishlistStore((state) => state.isInWishlist(id));
  const activeIsInWishlist = externalIsInWishlist ? externalIsInWishlist(id) : internalIsInWishlist;

  const displayOriginalPrice = originalPrice || product?.originalPrice;
  const displayStockCount = stockCount ?? product?.stockCount;
  const displayIsNew = isNew ?? product?.isNew;
  const isBestSeller = product?.isBestSeller ?? product?.isFeatured ?? false;
  const isLimitedEdition = product?.isLimitedEdition ?? false;
  const hasDiscount = displayOriginalPrice && displayOriginalPrice > price;
  const discountPercent = hasDiscount ? Math.round((1 - price / displayOriginalPrice) * 100) : 0;
  const isLowStock = displayStockCount !== undefined && displayStockCount <= 3 && displayStockCount > 0;
  const avgRating = product?.averageRating || 4.8;
  const reviewCount = product?.reviewCount || product?.reviews?.length || 0;

  // Second image for hover effect
  const secondImage = product?.images?.[1] || null;

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <div className={`bg-[#111] rounded-2xl animate-pulse w-full h-[26rem] ${className}`} />;
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWishlistToggle) { onWishlistToggle(product); return; }
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
    setCartFlyAnim(true);
    setTimeout(() => setAddedToCart(false), 2000);
    setTimeout(() => setCartFlyAnim(false), 600);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    buyItem({ id, name, price, image, quantity: 1 });
    setTimeout(() => router.push("/checkout"), 100);
  };

  return (
    <div className="w-full h-full">
      <div
        className={`group relative bg-[#111] rounded-2xl duration-300 h-full flex flex-col overflow-hidden transition-all ${className}`}
        style={{
          border: isHovered ? "1.5px solid rgba(200,240,0,0.35)" : "1.5px solid rgba(255,255,255,0.07)",
          boxShadow: isHovered ? "0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,240,0,0.08)" : "0 4px 16px rgba(0,0,0,0.4)",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Section — 65% of card */}
        <Link href={href} className="block" style={{ flexBasis: "65%" }}>
          <div className="relative overflow-hidden" style={{ paddingBottom: "100%", background: "#F7F7F7" }}>
            {/* Primary image */}
            <Image
              src={image || "/images/placeholder.png"}
              alt={name}
              fill
              className="object-contain transition-all duration-700 ease-in-out p-3"
              style={{
                transform: isHovered && !secondImage ? "scale(1.05)" : "scale(1)",
                opacity: isHovered && secondImage ? 0 : 1,
              }}
              sizes="(max-width: 768px) 50vw, 25vw"
            />

            {/* Second image slides in on hover */}
            {secondImage && (
              <Image
                src={secondImage}
                alt={`${name} - Vista 2`}
                fill
                className="object-contain absolute inset-0 transition-all duration-700 ease-in-out p-3"
                style={{
                  opacity: isHovered ? 1 : 0,
                  transform: isHovered ? "scale(1.03)" : "scale(1.08)",
                }}
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            )}

            {/* Badges — top left */}
            <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1.5">
              {isWorldCup && (
                <span
                  className="text-[9px] font-black uppercase tracking-tight px-2 py-1 rounded-sm shadow-lg"
                  style={{ background: "#c8f000", color: "#000", fontFamily: "var(--font-display, sans-serif)" }}
                >
                  World Cup 26
                </span>
              )}
              {displayIsNew && (
                <span className="text-[9px] font-black uppercase tracking-tight px-2 py-1 rounded-sm shadow-lg text-white" style={{ background: "#3b82f6" }}>
                  NUOVO
                </span>
              )}
              {isBestSeller && (
                <span
                  className="text-[9px] font-black uppercase tracking-tight px-2 py-1 rounded-sm shadow-lg"
                  style={{ background: "rgba(200,240,0,0.15)", color: "#c8f000", border: "1px solid rgba(200,240,0,0.3)", fontFamily: "var(--font-mono, monospace)" }}
                >
                  BESTSELLER
                </span>
              )}
              {isLimitedEdition && (
                <span className="text-[9px] font-black uppercase tracking-tight px-2 py-1 rounded-sm shadow-lg text-white" style={{ background: "#7c3aed" }}>
                  EDIZIONE LIMITATA
                </span>
              )}
              {isLowStock && (
                <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-tight px-2 py-1 rounded-sm shadow-lg text-white" style={{ background: "#f97316" }}>
                  <Zap size={8} /> ULTIMI {displayStockCount}!
                </span>
              )}
              {hasDiscount && (
                <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-tight px-2 py-1 rounded-sm shadow-lg text-white" style={{ background: "#ef4444" }}>
                  <Tag size={8} /> -{discountPercent}%
                </span>
              )}
            </div>

            {/* Wishlist button — top right */}
            <button
              onClick={handleWishlistToggle}
              className="absolute top-2.5 right-2.5 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{
                background: "rgba(10,10,10,0.82)",
                backdropFilter: "blur(8px)",
                border: activeIsInWishlist ? "1.5px solid rgba(239,68,68,0.4)" : "1.5px solid rgba(255,255,255,0.1)",
              }}
            >
              {activeIsInWishlist ? (
                <HeartIconSolid className="h-4.5 w-4.5 text-red-500" />
              ) : (
                <HeartIcon className="h-4.5 w-4.5 text-white/70" />
              )}
            </button>

            {/* Quick-add button slides up on hover */}
            <div
              className="absolute bottom-0 left-0 right-0 z-20 transition-all duration-300"
              style={{
                transform: isHovered ? "translateY(0)" : "translateY(100%)",
                opacity: isHovered ? 1 : 0,
              }}
            >
              <button
                onClick={handleAddToCart}
                className="w-full py-3 flex items-center justify-center gap-2 font-black uppercase text-[11px] tracking-widest transition-all relative overflow-hidden"
                style={{
                  background: addedToCart ? "#22c55e" : "#c8f000",
                  color: "#000",
                  fontFamily: "var(--font-display, sans-serif)",
                  letterSpacing: "2px",
                }}
              >
                {/* Flying cart animation dot */}
                {cartFlyAnim && (
                  <span
                    className="absolute w-2 h-2 rounded-full bg-black animate-ping"
                    style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
                  />
                )}
                <ShoppingCart size={13} />
                {addedToCart ? "Aggiunto!" : "Aggiungi al Carrello"}
              </button>
            </div>
          </div>
        </Link>

        {/* Content — remaining 35% */}
        <div className="flex flex-col flex-grow p-3.5 gap-1.5">
          {/* Viewers counter */}
          <div className="flex items-center gap-1.5">
            <Eye size={10} className="text-white/25" />
            <span className="text-[9px] text-white/25" style={{ fontFamily: "var(--font-mono, monospace)" }}>
              {viewersCount} persone lo stanno guardando
            </span>
          </div>

          {/* Name */}
          <h3
            className="text-sm font-bold text-white line-clamp-2 leading-tight transition-colors"
            style={{
              fontFamily: "var(--font-display, sans-serif)",
              color: isHovered ? "#c8f000" : "#fff",
            }}
          >
            <Link href={href}>{name}</Link>
          </h3>

          <p className="text-[9px] uppercase tracking-[0.18em] text-white/35 font-bold" style={{ fontFamily: "var(--font-mono, monospace)" }}>
            {team || category || "Jersey"}
          </p>

          {/* Stars */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={9} fill={star <= Math.round(avgRating) ? "#c8f000" : "none"} color={star <= Math.round(avgRating) ? "#c8f000" : "#444"} />
              ))}
            </div>
            <span className="text-[9px] text-white/30" style={{ fontFamily: "var(--font-mono, monospace)" }}>
              {avgRating.toFixed(1)} ({reviewCount > 0 ? reviewCount : "—"})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-auto pt-1">
            <span className="text-base font-black text-white" style={{ fontFamily: "var(--font-display, sans-serif)" }}>
              €{Number(price).toFixed(2)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xs text-white/30 line-through" style={{ fontFamily: "var(--font-mono, monospace)" }}>
                  €{Number(displayOriginalPrice).toFixed(2)}
                </span>
                <span
                  className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", fontFamily: "var(--font-mono, monospace)" }}
                >
                  -€{(displayOriginalPrice - price).toFixed(2)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ProductCard);
