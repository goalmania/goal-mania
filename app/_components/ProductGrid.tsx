/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import ProductGridComponent from "@/components/ui/ProductGrid";
import { Product } from "@/lib/types/product";

interface ProductGridProps {
  products: Product[];
  onWishlistToggle: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isInWishlist: (id: string) => boolean;
}

export default function ProductGrid({
  products,
  onWishlistToggle,
  onAddToCart,
  isInWishlist,
}: ProductGridProps) {
  return (
    <ProductGridComponent
      products={products}
      onWishlistToggle={onWishlistToggle}
      onAddToCart={onAddToCart}
      isInWishlist={isInWishlist}
      showWishlistButton={true}
      showAddToCartButton={false}
      gridCols={3}
      gap="md"
      cardHeight="lg"
      imageAspectRatio="portrait"
    />
  );
}
