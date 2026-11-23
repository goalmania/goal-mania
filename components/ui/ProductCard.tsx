"use client";

import { useEffect, useState, memo } from "react";
import Link from "next/link";
import { Heart, Plus, Zap } from "lucide-react";
import { useWishlistStore } from "@/lib/store/wishlist";
import { cld } from "@/lib/utils/cloudinary";
import QuickAddSheet from "@/components/shop/QuickAddSheet";

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
  priority?: boolean;
}

const fmt = (n: number) => (Number.isInteger(Number(n)) ? String(Number(n)) : Number(n).toFixed(2).replace(".", ","));

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
  product,
  className = "",
  originalPrice,
  stockCount,
  isNew,
  onWishlistToggle,
  isInWishlist: externalIsInWishlist,
  priority = false,
}: ProductCardProps) {
  const [mounted, setMounted] = useState(false);
  const [sheet, setSheet] = useState(false);
  const addToWishlist = useWishlistStore((s) => s.addItem);
  const removeFromWishlist = useWishlistStore((s) => s.removeItem);
  const inWishlistInternal = useWishlistStore((s) => s.isInWishlist(id));
  useEffect(() => setMounted(true), []);
  const liked = mounted && (externalIsInWishlist ? externalIsInWishlist(id) : inWishlistInternal);

  const secondary = product?.images?.[1] as string | undefined;
  const lowStock = (stockCount ?? product?.stockCount) !== undefined && (stockCount ?? product?.stockCount) <= 3 && (stockCount ?? product?.stockCount) > 0;
  const stock = stockCount ?? product?.stockCount;
  const hasDiscount = !!originalPrice && originalPrice > price;
  const shortName = name.replace(/^Maglia\s+/i, "");

  const toggleWish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWishlistToggle) return onWishlistToggle(product);
    if (liked) removeFromWishlist(id);
    else addToWishlist({ id, name, price, image, team: team || "" });
  };

  const pill = "rounded-full px-2.5 py-1 text-[12px] font-semibold leading-none backdrop-blur-md";
  return (
    <article className={`group relative flex h-full flex-col ${className}`}>
      <Link href={href} className="relative block aspect-[4/5] overflow-hidden rounded-[28px] bg-[#f5f5f7]" aria-label={name}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cld(image, 520)}
          srcSet={`${cld(image, 360)} 360w, ${cld(image, 520)} 520w, ${cld(image, 720)} 720w`}
          sizes="(max-width: 640px) 66vw, 280px"
          alt={name}
          width={520}
          height={650}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          className="absolute inset-0 h-full w-full object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          style={{ mixBlendMode: "multiply" }}
        />
        {secondary && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cld(secondary, 520)}
            alt=""
            width={520}
            height={650}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 hidden h-full w-full object-contain p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block"
            style={{ mixBlendMode: "multiply" }}
          />
        )}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {isWorldCup && <span className={`${pill} bg-black/75 text-white`}>Mondiali 26</span>}
          {isNew && <span className={`${pill} bg-[var(--lime)] text-[#0a0a0a]`}>Novità</span>}
          {lowStock && (
            <span className={`${pill} flex items-center gap-1 bg-[#ff453a] text-white`}>
              <Zap size={12} /> Ultime {stock}
            </span>
          )}
          {hasDiscount && <span className={`${pill} bg-[#ff453a] text-white`}>-{Math.round((1 - price / (originalPrice as number)) * 100)}%</span>}
        </div>
      </Link>

      <button
        onClick={toggleWish}
        aria-label={liked ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
        aria-pressed={liked}
        className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/75 text-[#0a0a0a] backdrop-blur-md transition-transform duration-200 active:scale-90"
      >
        <Heart className="h-[19px] w-[19px]" fill={liked ? "#ff453a" : "none"} stroke={liked ? "#ff453a" : "currentColor"} strokeWidth={2} />
      </button>

      <div className="flex flex-1 flex-col px-1 pt-3">
        <p className="truncate text-[13px] text-[var(--text-3)]">{team || category || "Maglia"}</p>
        <h3 className="mt-0.5 line-clamp-2 text-[17px] font-semibold leading-snug tracking-[-0.01em] text-white">
          <Link href={href}>{shortName}</Link>
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <p className="flex items-baseline gap-1.5" aria-label={`${fmt(price)} euro`}>
            <span className="num text-[22px]">{fmt(price)}€</span>
            {hasDiscount && <span className="text-[14px] text-[var(--text-3)] line-through">{fmt(originalPrice as number)}€</span>}
          </p>
          <button
            onClick={() => setSheet(true)}
            className="btn btn-lime !h-10 !gap-1.5 !px-4 !text-[15px]"
            aria-label={`Aggiungi ${shortName} al carrello`}
          >
            <Plus className="h-4 w-4" strokeWidth={2.6} /> Aggiungi
          </button>
        </div>
      </div>

      <QuickAddSheet open={sheet} onClose={() => setSheet(false)} product={{ id, slug, name, price, image, category }} />
    </article>
  );
}

export default memo(ProductCard);
