"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import ProductCard from "@/components/ui/ProductCard";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useCartStore } from "@/lib/store/cart";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/types/product";
import { useI18n } from "@/lib/hooks/useI18n";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const router = useRouter();
  const wishlistStore = useWishlistStore();
  const cartStore = useCartStore();
  const { t } = useI18n();

  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = wishlistStore;
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
        team: product.team || "",
      });
    }
  };

  const handleAddToCart = (product: Product) => {
    router.push(`/products/${product.id}`);
  };

  if (products.length === 0) return null;

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-[#0e1924] mb-6 sm:mb-8 md:mb-10">
          {t("home.featuredProducts")}
        </h2>

            <p className="text-lg text-gray-600 max-w-2xl text-center mx-auto mb-12">
   Scopri la nostra selezione di maglie, accessori e articoli ufficiali per vivere il calcio ogni giorno.
        </p>

        {/* ===== Conditionally render Swiper when more than 3 products ===== */}
        {products.length > 3 ? (
          <div className="relative">
            {/* Swiper: horizontal, responsive slidesPerView */}
            <Swiper
              modules={[Navigation]}
              spaceBetween={20}
              slidesPerView={1.1}
              navigation={{
                nextEl: ".featured-next",
                prevEl: ".featured-prev",
              }}
              breakpoints={{
                640: { slidesPerView: 2.2, spaceBetween: 16 },
                768: { slidesPerView: 3, spaceBetween: 20 },
                1024: { slidesPerView: 3.5, spaceBetween: 24 },
              }}
              className="py-2"
            >
              {products.map((product) => (
                <SwiperSlide key={product.id} className="p-2">
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.image}
                    category={product.category || ""}
                    team={product.team || ""}
                    availablePatches={product.availablePatches || []}
                    href={`/products/${product.id}`}
                    cardHeight="lg"
                    imageAspectRatio="portrait"
                    onWishlistToggle={handleWishlistToggle}
                    onAddToCart={handleAddToCart}
                    isInWishlist={isInWishlist}
                    showWishlistButton={true}
                    product={product}
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Left / Right navigation - positioned vertically centered */}
            {/* Bottom Center Navigation */}
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4 ">
              <button
                aria-label="Previous featured products"
                className="featured-prev flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md hover:bg-gray-100"
              >
                <svg
                  className="w-5 h-5 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <button
                aria-label="Next featured products"
                className="featured-next flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md hover:bg-gray-100"
              >
                <svg
                  className="w-5 h-5 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

           
          </div>
        ) : (
          /* Original Grid for <= 3 products (kept intact) */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
                category={product.category || ""}
                team={product.team || ""}
                availablePatches={product.availablePatches || []}
                href={`/products/${product.id}`}
                cardHeight="lg"
                imageAspectRatio="portrait"
                onWishlistToggle={handleWishlistToggle}
                onAddToCart={handleAddToCart}
                isInWishlist={isInWishlist}
                showWishlistButton={true}
                product={product}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-30 ">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-[#f5963c] text-[#f5963c] hover:bg-[#f5963c] hover:text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg"
          >
            <Link href="/shop">
              {t("home.viewAllProducts")}
              <ChevronRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
