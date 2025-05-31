"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useTranslation } from "@/lib/hooks/useTranslation";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  const { items: wishlistItems, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until client-side to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const moveToCart = (item: {
    id: string;
    name: string;
    price: number;
    image: string;
  }) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    });
    removeItem(item.id);
    toast.success(`${item.name} moved to your cart`);
  };

  // Ensure image path has proper format
  const getImagePath = (imagePath: string) => {
    if (!imagePath) return "/images/image.png";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) return imagePath;
    return `/${imagePath}`;
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {t("wishlist.empty.title")}
            </h1>
            <p className="mt-4 text-lg text-gray-500">
              {t("wishlist.empty.description")}
            </p>
            <div className="mt-6">
              <Link
                href="/shop"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {t("wishlist.empty.cta")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">
          {t("wishlist.title")}
        </h1>

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {wishlistItems.map((item) => (
            <div key={item.id} className="group relative flex flex-col">
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
                <Image
                  src={getImagePath(item.image)}
                  alt={item.name || "Product image"}
                  className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                  width={500}
                  height={500}
                />
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700">
                    <Link href={`/products/${item.id}`}>{item.name}</Link>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{item.team}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  €{item.price.toFixed(2)}
                </p>
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/products/${item.id}`}
                  className="flex-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {t("wishlist.viewProduct")}
                </Link>
                <button
                  onClick={() => removeItem(item.id)}
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-black shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  {t("wishlist.remove")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
