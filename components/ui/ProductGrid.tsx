"use client";

import ProductCard from "./ProductCard";

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
  const gapClasses = { sm: "gap-2", md: "gap-3 sm:gap-6", lg: "gap-6" };
  const gridColClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6",
  };

  return (
    <div className={`grid ${gridColClasses[gridCols]} ${gapClasses[gap]} ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          price={product.price}
          image={product.image}
          href={`/products/${product.id}`}
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
  );
}
