"use client";

import { useState, useEffect, useRef, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { ShoppingCart, Star, Zap, Tag } from "lucide-react";

import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";

interface ProductCardProps {
  id: string;
  slug?: string;
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
  slug,
  name,
  price,
  image,
  href = `/products/${slug || id}`,
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

  const addItemToCart = useCartStore((state) => state.addItem);
  const buyItem = useCartStore((state) => state.buyItem);

  const internalAddToWishlist = useWishlistStore((state) => state.addItem);
  const internalRemoveFromWishlist = useWishlistStore((state) => state.removeItem);
  const internalIsInWishlist = useWishlistStore((state) => state.isInWishlist(id));
  const activeIsInWishlist = externalIsInWishlist ? externalIsInWishlist(id) : internalIsInWishlist;

  const displayOriginalPrice = originalPrice || product?.originalPrice;
  const displayStockCount = stockCount ?? product?.stockCount;
  const displayIsNew = isNew ?? product?.isNew;
    const isLimitedEdition = product?.isLimitedEdition ?? false;
  const hasDiscount = displayOriginalPrice && displayOriginalPrice > price;
  const discountPercent = hasDiscount ? Math.round((1 - price / displayOriginalPrice) * 100) : 0;
  const isLowStock = displayStockCount !== undefined && displayStockCount <= 3 && displayStockCount > 0;
  const avgRating = product?.averageRating || 0;
  const reviewCount = product?.reviewCount || product?.reviews?.length || 0;
  const hasRealReviews = reviewCount > 0 && avgRating > 0;

  // Second image for hover effect
  const secondImage = product?.images?.[1] || null;

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <div className={`bg-[#111] rounded-[10px] animate-pulse w-full h-[26rem] ${className}`} />;
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
        className={`group relative flex h-full flex-col overflow-hidden rounded-[10px] bg-[#101010] transition-colors duration-200 ${className}`}
        style={{ border: isHovered ? "1px solid rgba(200,240,0,0.6)" : "1px solid rgba(255,255,255,0.1)" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Immagine: fondo chiaro, le foto con sfondo bianco si fondono (multiply) */}
        <Link href={href} className="block">
          <div className="relative overflow-hidden" style={{ paddingBottom: "112%", background: "#f1f1ec" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image || "/images/placeholder.png"}
              alt={name}
              className="absolute inset-0 h-full w-full object-contain p-3 transition-opacity duration-500"
              style={{ mixBlendMode: "multiply", opacity: isHovered && secondImage ? 0 : 1 }}
              loading="lazy"
            />
            {secondImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={secondImage}
                alt={`${name} - vista 2`}
                className="absolute inset-0 h-full w-full object-contain p-3 transition-opacity duration-500"
                style={{ mixBlendMode: "multiply", opacity: isHovered ? 1 : 0 }}
                loading="lazy"
              />
            )}

            {/* Etichette: solo fatti veri */}
            <div className="absolute left-2 top-2 z-20 flex flex-col items-start gap-1">
              {isWorldCup && (
                <span className="rounded-[3px] bg-[#0a0a0a] px-2 py-1 text-[10px] font-black uppercase tracking-wide text-[#c8f000]" style={{ fontFamily: "var(--font-display, sans-serif)" }}>
                  World Cup 26
                </span>
              )}
              {displayIsNew && (
                <span className="rounded-[3px] bg-[#c8f000] px-2 py-1 text-[10px] font-black uppercase tracking-wide text-[#0a0a0a]" style={{ fontFamily: "var(--font-display, sans-serif)" }}>
                  Novità
                </span>
              )}
              {isLimitedEdition && (
                <span className="rounded-[3px] bg-[#0a0a0a] px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white" style={{ fontFamily: "var(--font-display, sans-serif)" }}>
                  Edizione limitata
                </span>
              )}
              {isLowStock && (
                <span className="flex items-center gap-1 rounded-[3px] bg-[#ff4444] px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white" style={{ fontFamily: "var(--font-display, sans-serif)" }}>
                  <Zap size={9} /> Ultimi {displayStockCount}
                </span>
              )}
              {hasDiscount && (
                <span className="flex items-center gap-1 rounded-[3px] bg-[#ff4444] px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white" style={{ fontFamily: "var(--font-display, sans-serif)" }}>
                  <Tag size={9} /> -{discountPercent}%
                </span>
              )}
            </div>

            <button
              onClick={handleWishlistToggle}
              aria-label={activeIsInWishlist ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
              className="absolute right-2 top-2 z-20 flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#0a0a0a]/85 transition-transform active:scale-90"
            >
              {activeIsInWishlist ? (
                <HeartIconSolid className="h-5 w-5 text-[#ff4444]" />
              ) : (
                <HeartIcon className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
        </Link>

        {/* Info */}
        <div className="flex flex-grow flex-col gap-1.5 p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/60" style={{ fontFamily: "var(--font-mono, monospace)" }}>
            {team || category || "Maglia"}
          </p>
          <h3
            className="line-clamp-2 text-[17px] font-bold uppercase leading-[1.05] text-white"
            style={{ fontFamily: "var(--font-display, sans-serif)" }}
          >
            <Link href={href}>{name}</Link>
          </h3>

          {hasRealReviews && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={11} fill={star <= Math.round(avgRating) ? "#c8f000" : "none"} color={star <= Math.round(avgRating) ? "#c8f000" : "#555"} />
                ))}
              </div>
              <span className="text-[11px] text-white/60" style={{ fontFamily: "var(--font-mono, monospace)" }}>
                {avgRating.toFixed(1)} ({reviewCount})
              </span>
            </div>
          )}

          <div className="mt-auto flex items-baseline gap-2 pt-1">
            <span className="text-[26px] font-extrabold leading-none text-[#c8f000]" style={{ fontFamily: "var(--font-display, sans-serif)", fontVariantNumeric: "tabular-nums" }}>
              €{Number(price).toFixed(2).replace(".00", "")}
            </span>
            {hasDiscount && (
              <span className="text-sm text-white/50 line-through" style={{ fontFamily: "var(--font-mono, monospace)" }}>
                €{Number(displayOriginalPrice).toFixed(0)}
              </span>
            )}
            <span className="ml-auto text-[11px] font-semibold uppercase tracking-wide text-white/60" style={{ fontFamily: "var(--font-display, sans-serif)" }}>
              Spedizione gratis
            </span>
          </div>

          {/* La taglia si sceglie nella scheda: niente aggiunta al carrello senza taglia */}
          <Link
            href={href}
            className="mt-2 flex min-h-[44px] items-center justify-center gap-2 rounded-[6px] bg-[#c8f000] text-[13px] font-black uppercase tracking-[0.14em] text-[#0a0a0a] transition-colors hover:bg-[#d8ff1a] active:translate-y-px"
            style={{ fontFamily: "var(--font-display, sans-serif)" }}
          >
            <ShoppingCart size={15} />
            Scegli la taglia
          </Link>
        </div>
      </div>
    </div>
  );
}

export default memo(ProductCard);
