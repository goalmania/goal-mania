"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import ProductCard from "@/components/ui/ProductCard";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  team: string;
  availablePatches?: string[];
  isMysteryBox?: boolean;
  videos?: string[];
  badges?: string[];
  product?: any;
}

export default function LimitedEditionClient() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const router = useRouter();
  const wishlistStore = useWishlistStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = wishlistStore;

  React.useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products?noPagination=true&limit=500');
        if (!res.ok) return;
        const data = await res.json();
        const allProducts = Array.isArray(data) ? data : data.products || [];
        
        // Filter products by specific titles or category
        const filtered = allProducts.filter((product: any) => {
          const title = (product.title || "").toLowerCase();
          const category = (product.category || "").toLowerCase();
          
          return category === "edizioni limitate" || 
                 title.includes("halloween") ||
                 title.includes("lamine yamal") ||
                 title.includes("travis scott") ||
                 (title.includes("barcelona") && title.includes("pink"));
        });

        const mappedProducts = filtered.map((product: any) => ({
          id: product._id || "",
          name: product.title || "Product",
          price: product.basePrice || 0,
          image: product.images?.[0] || "/images/image.png",
          category: product.category || "Limited Edition",
          team: product.team || "Unknown",
          availablePatches: product.availablePatches || [],
          isMysteryBox: product.isMysteryBox || false,
          videos: product.videos || [],
          badges: product.badges || [],
          product,
        }));
        setProducts(mappedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }
    fetchProducts();
  }, []);

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
    <section className="py-6 sm:py-8 md:py-10 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-[#0e1924] mb-4 sm:mb-6 md:mb-8 font-munish">
          Edizioni Limitate
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl text-center mx-auto mb-8 font-munish">
          Scopri le nostre maglie esclusive e in edizione limitata.
        </p>
        <div className="relative pb-16">
          <Swiper
            modules={[Navigation]}
            spaceBetween={20}
            slidesPerView={1.1}
            navigation={{
              nextEl: ".limited-edition-next",
              prevEl: ".limited-edition-prev",
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
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4">
            <button
              aria-label="Previous products"
              className="limited-edition-prev flex items-center justify-center w-10 h-10 rounded-full bg-[#D9D9D9] shadow-md hover:bg-gray-100"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              aria-label="Next products"
              className="limited-edition-next flex items-center justify-center w-10 h-10 rounded-full bg-[#D9D9D9] shadow-md hover:bg-gray-100"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
