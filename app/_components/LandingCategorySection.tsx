"use client";

import React, { useRef, useState, useCallback } from "react";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useCartStore } from "@/lib/store/cart";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/types/product";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, A11y } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/free-mode";

interface LandingCategorySectionProps {
  title: string;
  category?: string;
  products?: Product[];
  viewAllHref?: string;
}

async function getCategoryProducts(category: string): Promise<Product[]> {
  try {
    const res = await fetch(
      `/api/products?category=${encodeURIComponent(category)}&noPagination=true`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const rawList = Array.isArray(data) ? data : data.products || [];
    return rawList.map((p: any) => ({
      id: p._id || "",
      slug: p.slug || "",
      name: p.title || "Product",
      price: p.basePrice || 0,
      image: p.images?.[0] || "/images/image.png",
      category: p.category || "Uncategorized",
      team: p.team || "Unknown",
      availablePatches: p.availablePatches || [],
      isMysteryBox: p.isMysteryBox || false,
      videos: p.videos || [],
      badges: p.badges || [],
      product: p,
    }));
  } catch {
    return [];
  }
}

function ArrowBtn({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[6px] transition-all duration-200 active:scale-95"
      style={{
        background: disabled ? "rgba(255,255,255,0.04)" : "#c8f000",
        border: "1px solid transparent",
        color: disabled ? "rgba(255,255,255,0.3)" : "#0a0a0a",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {direction === "prev" ? (
          <polyline points="15 18 9 12 15 6" />
        ) : (
          <polyline points="9 18 15 12 9 6" />
        )}
      </svg>
    </button>
  );
}

export default function LandingCategorySection({
  title,
  category,
  products: providedProducts,
  viewAllHref,
}: LandingCategorySectionProps) {
  const [fetchedProducts, setFetchedProducts] = React.useState<Product[]>([]);
  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const router = useRouter();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();

  React.useEffect(() => {
    if (providedProducts || !category) return;
    getCategoryProducts(category).then(setFetchedProducts);
  }, [category, providedProducts]);

  const products = providedProducts ?? fetchedProducts;

  const handleSwiper = useCallback((swiper: SwiperType) => {
    swiperRef.current = swiper;
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  }, []);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  }, []);

  const handleWishlistToggle = (product: Product) => {
    const id = product.id.toString();
    if (isInWishlist(id)) removeFromWishlist(id);
    else addToWishlist({ id, name: product.name, price: product.price, image: product.image, team: product.team || "" });
  };

  const handleAddToCart = (product: Product) => {
    router.push(`/products/${product.slug || product.id}`);
  };

  if (products.length === 0) return null;

  return (
    <section className="py-10 md:py-16 bg-[#0a0a0a] font-munish">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="gm-eyebrow">Collezione</p>
            <h2 className="gm-section-title !text-[clamp(1.75rem,5vw,2.75rem)]">{title}</h2>
          </div>
          <div className="flex items-center gap-4">
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="hidden text-sm font-bold uppercase tracking-widest transition-opacity duration-200 hover:opacity-70 md:inline-flex"
                style={{ fontFamily: "var(--font-display,sans-serif)", color: "#c8f000" }}
              >
                Vedi tutto
              </Link>
            )}
            <div className="flex items-center gap-2">
              <ArrowBtn
                direction="prev"
                disabled={isBeginning}
                onClick={() => swiperRef.current?.slidePrev()}
              />
              <ArrowBtn
                direction="next"
                disabled={isEnd}
                onClick={() => swiperRef.current?.slideNext()}
              />
            </div>
          </div>
        </div>

        {/* Swiper carousel */}
        {products.length > 3 ? (
          <Swiper
            modules={[FreeMode, A11y]}
            onSwiper={handleSwiper}
            onSlideChange={handleSlideChange}
            onReachBeginning={() => setIsBeginning(true)}
            onReachEnd={() => setIsEnd(true)}
            spaceBetween={12}
            slidesPerView={1.2}
            freeMode={{ enabled: true, momentum: true, momentumRatio: 0.5 }}
            grabCursor={true}
            a11y={{ enabled: true }}
            breakpoints={{
              480:  { slidesPerView: 2.1,  spaceBetween: 14 },
              768:  { slidesPerView: 3,    spaceBetween: 16, freeMode: { enabled: false } },
              1024: { slidesPerView: 4,    spaceBetween: 20, freeMode: { enabled: false } },
            }}
            style={{ paddingBottom: "4px" }}
          >
            {products.map((product) => (
              <SwiperSlide key={product.id} style={{ height: "auto" }}>
                <ProductCard
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.image}
                  category={product.category || ""}
                  team={product.team || ""}
                  href={`/products/${product.slug || product.id}`}
                  imageAspectRatio="square"
                  onWishlistToggle={handleWishlistToggle}
                  onAddToCart={handleAddToCart}
                  isInWishlist={isInWishlist}
                  showWishlistButton={true}
                  product={product}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
                category={product.category || ""}
                team={product.team || ""}
                href={`/products/${product.slug || product.id}`}
                imageAspectRatio="square"
                onWishlistToggle={handleWishlistToggle}
                onAddToCart={handleAddToCart}
                isInWishlist={isInWishlist}
                showWishlistButton={true}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
