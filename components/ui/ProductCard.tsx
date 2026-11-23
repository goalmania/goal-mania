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

  // Inclinazione stabile per ogni maglia (da -1.3 a +1.3 gradi): ogni manifesto e incollato a modo suo
  const h = Array.from(String(id)).reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);
  const rot = (((h % 5) + 5) % 5 - 2) * 0.65;
  const tag = "px-2 py-1 font-[family-name:var(--font-display)] text-[13px] italic uppercase leading-none tracking-[0.03em]";

  return (
    <article className={`group relative h-full ${className}`} style={{ ["--rot" as string]: `${rot}deg`, ["--tape-rot" as string]: `${-rot * 2 - 2}deg` }}>
      <div className="poster tape flex h-full flex-col">
        <Link href={href} className="relative block aspect-[4/5] overflow-hidden" aria-label={name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cld(image, 520)}
            srcSet={`${cld(image, 360)} 360w, ${cld(image, 520)} 520w, ${cld(image, 720)} 720w`}
            sizes="(max-width: 640px) 62vw, 280px"
            alt={name}
            width={520}
            height={650}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
            className="absolute inset-0 h-full w-full object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-[1.06]"
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
          <div className="absolute bottom-2 left-2 flex flex-col items-start gap-1">
            {isWorldCup && <span className={`${tag} bg-[#0a0a0a] text-[var(--lime)]`}>Mondiali 26</span>}
            {isNew && <span className={`${tag} bg-[var(--lime)] text-[#0a0a0a]`}>Novità</span>}
            {lowStock && <span className={`${tag} flex items-center gap-1 bg-[var(--red)] text-white`}><Zap size={12} /> Ultime {stock}</span>}
            {hasDiscount && <span className={`${tag} bg-[var(--red)] text-white`}>-{Math.round((1 - price / (originalPrice as number)) * 100)}%</span>}
          </div>
        </Link>

        <button
          onClick={toggleWish}
          aria-label={liked ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
          aria-pressed={liked}
          className="absolute right-1.5 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full text-[#0a0a0a] transition-transform duration-200 active:scale-90"
        >
          <Heart className="h-[22px] w-[22px]" fill={liked ? "var(--red)" : "none"} stroke={liked ? "var(--red)" : "currentColor"} strokeWidth={2.2} />
        </button>

        <div className="flex flex-1 flex-col px-3 pb-3 pt-1">
          <p className="truncate text-[12px] font-semibold uppercase tracking-[0.08em] text-black/60">{team || category || "Maglia"}</p>
          <h3 className="mt-0.5 line-clamp-2 min-h-[2.1em] text-[22px] leading-[1.02] text-[#0a0a0a]">
            <Link href={href}>{shortName}</Link>
          </h3>
          <div className="mt-auto flex items-end justify-between gap-2 pt-3">
            <p className="flex items-baseline gap-1.5" aria-label={`${fmt(price)} euro`}>
              <span className="num marker-line text-[34px] text-[#0a0a0a]">{fmt(price)}€</span>
              {hasDiscount && <span className="text-[14px] text-black/50 line-through">{fmt(originalPrice as number)}€</span>}
            </p>
            <button
              onClick={() => setSheet(true)}
              className="btn btn-ink !h-11 !gap-1.5 !px-4 !text-[17px]"
              aria-label={`Aggiungi ${shortName} al carrello`}
            >
              <Plus className="h-4 w-4" strokeWidth={3} /> Aggiungi
            </button>
          </div>
        </div>
      </div>

      <QuickAddSheet open={sheet} onClose={() => setSheet(false)} product={{ id, slug, name, price, image, category }} />
    </article>
  );
}

export default memo(ProductCard);
