"use client";

import { useWishlistStore } from "@/lib/store/wishlist";
import { useCartStore } from "@/lib/store/cart";
import { useRouter } from "next/navigation";
import ProductGrid from "./ProductGrid";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  team: string;
}

interface ProductGridWrapperProps {
  products: Product[];
}

export default function ProductGridWrapper({ products }: ProductGridWrapperProps) {
  const router = useRouter();
  const wishlistStore = useWishlistStore();
  const cartStore = useCartStore();

  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = wishlistStore;
  const { addItem: addToCart } = cartStore;

  const handleWishlistToggle = (product: Product) => {
    const productId = product.id.toString();
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist({
        id: productId,
        name: product.name,
        price: product.price,
        image: product.image,
        team: product.team,
      });
    }
  };

  const handleAddToCart = (product: Product) => {
    router.push(`/products/${product.id}`);
  };

  return (
    <ProductGrid
      products={products}
      onWishlistToggle={handleWishlistToggle}
      onAddToCart={handleAddToCart}
      isInWishlist={isInWishlist}
    />
  );
} 