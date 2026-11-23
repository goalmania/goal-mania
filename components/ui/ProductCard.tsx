"use client";

import { useEffect, useState, memo } from "react";
import Link from "next/link";
import { Heart, Zap } from "lucide-react";
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

  const tag = "px-2 py-1 text-[12px] font-extrabold uppercase leading-none tracking-wide";
  return (
    <article className={`group relative flex h-full flex-col bg-[#121211] outline outline-1 -outline-offset-1 outline-white/10 transition-[outline-color] duration-150 hover:outline-[#c8f000] ${className}`}>
      <Link href={href} className="relative block aspect-[4/5] overflow-hidden bg-[#f1f1ec]" aria-label={name}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cld(image, 520)}
          srcSet={`${cld(image, 360)} 360w, ${cld(image, 520)} 520w, ${cld(image, 720)} 720w`}
          sizes="(max-width: 640px) 64vw, 280px"
          alt={name}
          width={520}
          height={650}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          className="absolute inset-0 h-full w-full object-contain p-3 transition-transform duration-300 ease-out group-hover:scale-[1.04]"
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
        <div className="absolute left-0 top-0 flex flex-col items-start gap-px">
          {isWorldCup && <span className={`${tag} bg-[#0a0a0a] text-[#c8f000]`} style={{ fontFamily: "var(--font-display)" }}>Mondiali 26</span>}
          {isNew && <span className={`${tag} bg-[#c8f000] text-[#0a0a0a]`} style={{ fontFamily: "var(--font-display)" }}>Novità</span>}
          {lowStock && (
            <span className={`${tag} flex items-center gap-1 bg-[#ff4444] text-white`} style={{ fontFamily: "var(--font-display)" }}>
              <Zap size={12} /> Ultime {stock}
            </span>
          )}
          {hasDiscount && <span className={`${tag} bg-[#ff4444] text-white`} style={{ fontFamily: "var(--font-display)" }}>-{Math.round((1 - price / (originalPrice as number)) * 100)}%</span>}
        </div>
      </Link>

      <button
        onClick={toggleWish}
        aria-label={liked ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
        aria-pressed={liked}
        className="absolute right-0 top-0 z-10 flex h-11 w-11 items-center justify-center bg-[#0a0a0a]/85 text-white transition-colors hover:text-[#c8f000]"
      >
        <Heart className="h-[21px] w-[21px]" fill={liked ? "#ff4444" : "none"} stroke={liked ? "#ff4444" : "currentColor"} />
      </button>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="truncate text-[13px] font-semibold text-white/65">{team || category || "Maglia"}</p>
        <h3 className="display line-clamp-2 min-h-[2lh] text-[21px] leading-[0.95] text-white">
          <Link href={href}>{shortName}</Link>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <p className="num text-[38px] text-[#c8f000]" aria-label={`${fmt(price)} euro`}>
            {fmt(price)}
            <span className="text-[24px]">€</span>
          </p>
          {hasDiscount && <p className="pb-1 text-[15px] text-white/55 line-through">{fmt(originalPrice as number)}€</p>}
        </div>
        <button
          onClick={() => setSheet(true)}
          className="cut cut-sm mt-1 flex h-12 w-full items-center justify-center bg-[#c8f000] text-[18px] font-extrabold uppercase tracking-wide text-[#0a0a0a] transition-colors hover:bg-[#d8ff1a] active:bg-[#b5d800]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Aggiungi
        </button>
      </div>

      <QuickAddSheet open={sheet} onClose={() => setSheet(false)} product={{ id, slug, name, price, image, category }} />
    </article>
  );
}

export default memo(ProductCard);
