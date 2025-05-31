"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  team: string;
}

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid rendering anything until component is mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="bg-gray-200 rounded-lg h-60 sm:h-80 animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="group relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden h-full flex flex-col"
        >
          <Link
            href={product.id ? `/products/${product.id}` : "#"}
            className="flex-shrink-0"
          >
            <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
              <Image
                src={product.image || "/images/image.png"}
                alt={product.name || "Product image"}
                width={500}
                height={500}
                className="h-full w-full object-cover object-center transform group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onWishlistToggle(product);
                }}
                className="absolute right-2 top-2 rounded-full bg-white/80 backdrop-blur-sm p-1.5 sm:p-2.5 shadow-md hover:bg-white transition-colors duration-200"
                aria-label={
                  isInWishlist(product.id)
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
              >
                {isInWishlist(product.id) ? (
                  <HeartIconSolid className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                ) : (
                  <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                )}
              </button>
            </div>
          </Link>

          <div className="p-2 sm:p-4 flex flex-col flex-grow">
            <div className="mb-2 sm:mb-4 flex-grow">
              <Link href={product.id ? `/products/${product.id}` : "#"}>
                <h3 className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2">
                  {product.name}
                </h3>
              </Link>
              <div className="mt-1 flex items-center gap-1 sm:gap-2 flex-wrap">
                <p className="text-[10px] sm:text-xs text-gray-500">
                  {product.category}
                </p>
                <span className="h-1 w-1 rounded-full bg-gray-300 hidden sm:block"></span>
                <p className="text-[10px] sm:text-xs text-gray-500">
                  {product.team}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <p className="text-xs sm:text-base font-semibold text-black">
                €{Number(product.price).toFixed(2)}
              </p>
              <Link
                href={product.id ? `/products/${product.id}` : "#"}
                className="flex items-center rounded-md bg-indigo-600 px-1.5 py-1 sm:px-2.5 sm:py-1.5 text-[10px] sm:text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors duration-200"
              >
                <span className="hidden sm:inline">View</span> Product
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
