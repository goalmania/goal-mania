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

  return (
    <article className={`group relative h-full ${className}`}>
      <div className="pc">
        <Link href={href} className="pc-stage" aria-label={name}>
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
            className="absolute inset-0 z-[1] h-full w-full object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-[1.05]"
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
              className="absolute inset-0 z-[2] hidden h-full w-full object-contain p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block"
              style={{ mixBlendMode: "multiply", background: "transparent" }}
            />
          )}
          <div className="absolute left-3 top-3 z-[3] flex flex-col items-start gap-1">
            {isWorldCup && <span className="pc-tag bg-[#0a0a0a] text-[var(--lime)]">Mondiali 26</span>}
            {isNew && <span className="pc-tag bg-[var(--lime)] text-[#0a0a0a]">Novità</span>}
            {lowStock && <span className="pc-tag bg-[var(--red)] text-white"><Zap size={12} /> Ultime {stock}</span>}
            {hasDiscount && <span className="pc-tag bg-[var(--red)] text-white">-{Math.round((1 - price / (originalPrice as number)) * 100)}%</span>}
          </div>
        </Link>

        <button
          onClick={toggleWish}
          aria-label={liked ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
          aria-pressed={liked}
          className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full text-[#0a0a0a] transition-transform duration-200 active:scale-90"
        >
          <Heart className="h-[22px] w-[22px]" fill={liked ? "var(--red)" : "none"} stroke={liked ? "var(--red)" : "currentColor"} strokeWidth={2.2} />
        </button>

        <div className="pc-body">
          <p className="pc-team truncate">{team || category || "Maglia"}</p>
          <h3 className="pc-name line-clamp-2 min-h-[2.24em]">
            <Link href={href}>{shortName}</Link>
          </h3>
          <div className="mt-auto flex items-end justify-between gap-2 pt-3">
            <p className="flex items-baseline gap-2" aria-label={`${fmt(price)} euro`}>
              <span className="pc-price">{fmt(price)}€</span>
              {hasDiscount && <span className="text-[14px] text-[var(--text-3)] line-through">{fmt(originalPrice as number)}€</span>}
            </p>
            <button onClick={() => setSheet(true)} className="pc-add" aria-label={`Aggiungi ${shortName} al carrello`}>
              <Plus className="h-5 w-5" strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>

      <QuickAddSheet open={sheet} onClose={() => setSheet(false)} product={{ id, slug, name, price, image, category }} />
    </article>
  );
}

export default memo(ProductCard);
