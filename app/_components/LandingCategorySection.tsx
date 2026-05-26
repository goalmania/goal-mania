"use client";

import React, { useRef, useState, useCallback } from "react";
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
  category: string;
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
      className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95"
      style={{
        background: disabled ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.07)",
        border: disabled
          ? "1px solid rgba(255,255,255,0.04)"
          : "1px solid rgba(200,240,0,0.2)",
        color: disabled ? "rgba(255,255,255,0.15)" : "#c8f000",
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
  viewAllHref,
}: LandingCategorySectionProps) {
  const [products, setProducts] = React.useState<Product[]>([]);
  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const router = useRouter();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();

  React.useEffect(() => {
    getCategoryProducts(category).then(setProducts);
  }, [category]);

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
    router.push(`/products/${product.id}`);
  };

  if (products.length === 0) return null;

  return (
    <section className="py-10 md:py-16 bg-[#0a0a0a] font-munish">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/25 mb-1">
              Collezione
            </p>
            <h2 className="text-xl md:text-2xl font-black uppercase italic text-white leading-none">
              {title}
            </h2>
          </div>
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
                  href={`/products/${product.id}`}
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
                href={`/products/${product.id}`}
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
