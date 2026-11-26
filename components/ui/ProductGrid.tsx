"use client";

import { useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import { useBackMemory, useRememberedState } from "@/lib/hooks/useListMemory";

// Le prime 36 maglie sono nella pagina; le altre arrivano mentre scorri (o col pulsante). Pagina leggera anche con 200 maglie.
const STEP = 36;

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  team?: string;
  availablePatches?: string[];
  videos?: string[];
  [key: string]: any;
}

interface ProductGridProps {
  products: Product[];
  onWishlistToggle?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  isInWishlist?: (id: string) => boolean;
  showWishlistButton?: boolean;
  showAddToCartButton?: boolean;
  gridCols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: "sm" | "md" | "lg";
  cardHeight?: "sm" | "lg";
  imageAspectRatio?: "square" | "portrait" | "landscape";
  className?: string;
  customBadges?: (product: Product) => Array<{
    text: string;
    color?: string;
    bgColor?: string;
  }>;
}

export default function ProductGrid({
  products,
  onWishlistToggle,
  onAddToCart,
  isInWishlist,
  showWishlistButton = true,
  showAddToCartButton = false,
  gridCols = 4,
  gap = "md",
  cardHeight = "lg",
  imageAspectRatio = "square",
  className = "",
  customBadges,
}: ProductGridProps) {
  const gapClasses = { sm: "gap-2", md: "gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10", lg: "gap-6" };
  const gridColClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6",
  };

  const [n, setN] = useRememberedState("n", STEP);
  useBackMemory();
  const more = useRef<HTMLDivElement>(null);
  const hasMore = n < products.length;
  useEffect(() => {
    const el = more.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setN((v) => v + STEP), { rootMargin: "900px" });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, n]);

  return (
    <>
    <div className={`grid ${gridColClasses[gridCols]} ${gapClasses[gap]} ${className}`}>
      {products.slice(0, n).map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          slug={product.slug}
          name={product.name}
          price={product.price}
          image={product.image}
          href={`/products/${product.slug || product.id}`}
          category={product.category}
          team={product.team}
          availablePatches={product.availablePatches}
          videos={product.videos}
          badges={customBadges ? customBadges(product) : []}
          onWishlistToggle={onWishlistToggle}
          isInWishlist={isInWishlist}
          onAddToCart={onAddToCart}
          showWishlistButton={showWishlistButton}
          showAddToCartButton={showAddToCartButton}
          imageAspectRatio={imageAspectRatio}
          cardHeight={cardHeight}
          product={product}
        />
      ))}
    </div>
    {hasMore && (
      <div ref={more} className="mt-10 flex justify-center">
        <button type="button" onClick={() => setN((v) => v + STEP)} className="btn btn-glass">
          Mostra altre {Math.min(STEP, products.length - n)} maglie
        </button>
      </div>
    )}
    </>
  );
}
