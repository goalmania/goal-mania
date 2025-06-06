"use client";

import { useState, useEffect } from "react";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useCartStore } from "@/lib/store/cart";
import ProductGrid from "@/app/components/ProductGrid";
import ShopNav from "@/app/components/ShopNav";
import { Suspense } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  team: string;
}

export default function Season2024Client({
  products,
}: {
  products: Product[];
}) {
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-white">
      <ShopNav />
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          2024/25 Collection
        </h2>
        <div className="mt-6">
          <Suspense fallback={<div>Loading...</div>}>
            <ProductGrid
              products={products}
              onWishlistToggle={(product) => {
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
              }}
              onAddToCart={(product) => {
                addToCart({
                  id: product.id.toString(),
                  name: product.name,
                  price: product.price,
                  image: product.image,
                });
              }}
              isInWishlist={isInWishlist}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
