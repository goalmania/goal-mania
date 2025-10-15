"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PromoToast() {
  const [isVisible, setIsVisible] = useState(false);
  const [featuredProductImage, setFeaturedProductImage] = useState<string>(
    "/images/jersey1.webp"
  );
  const [altText, setAltText] = useState<string>("Prodotto in offerta");
  const [productTitle, setProductTitle] = useState<string>(
    "Maglie da Calcio - Offerta valida 24/7"
  );
  const [reviewCount, setReviewCount] = useState<number>(2500);
  const [averageRating, setAverageRating] = useState<number>(4.9);

  useEffect(() => {
    console.log("🎯 PromoToast component mounted");
  }, []);

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        console.log("🔍 Fetching featured products...");
        const response = await fetch("/api/products?feature=true");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        console.log("📦 Products data:", data);

        let products = [];
        if (
          data.products &&
          Array.isArray(data.products) &&
          data.products.length > 0
        ) {
          products = data.products;
        } else if (Array.isArray(data) && data.length > 0) {
          products = data;
        }

        let productData = null;
        if (products.length > 0) {
          productData = products[Math.floor(Math.random() * products.length)];
          console.log("✅ Selected product:", productData?.title);
        }

        if (productData) {
          setFeaturedProductImage(
            productData.images?.[0] || "/images/jersey1.webp"
          );
          setAltText(productData.title || "Prodotto in offerta");
          setProductTitle(
            productData.title || "Maglie da Calcio - Offerta valida 24/7"
          );

          // Set review data
          const reviews = productData.reviews || [];
          setReviewCount(reviews.length || 2500);

          // Calculate average rating
          if (reviews.length > 0) {
            const totalRating = reviews.reduce(
              (sum: number, review: any) => sum + (review.rating || 0),
              0
            );
            const avgRating = totalRating / reviews.length;
            setAverageRating(Number(avgRating.toFixed(1)));
          } else {
            setAverageRating(4.9);
          }
        }
      } catch (error) {
        console.error("❌ Error fetching products:", error);
        setFeaturedProductImage("/images/jersey1.webp");
        setAltText("Prodotto in offerta");
        setProductTitle("Maglie da Calcio - Offerta valida 24/7");
        setReviewCount(2500);
        setAverageRating(4.9);
      }
    }
    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    console.log("🚀 Setting up toast visibility...");

    const timer = setTimeout(() => {
      console.log("✨ Showing toast NOW");
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log("👁️ Toast visibility:", isVisible);
  }, [isVisible]);

  const handleDismiss = () => {
    console.log("❌ Toast dismissed");
    setIsVisible(false);
    localStorage.setItem("promoToastDismissed", "true");

    setTimeout(() => {
      localStorage.removeItem("promoToastDismissed");
    }, 12 * 60 * 60 * 1000);
  };

  // Helper function to format review count
  const formatReviewCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className="fixed bottom-6 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-[9999] w-[92%] sm:w-[85%] md:w-[600px] lg:w-[700px] max-w-[95vw]"
        >
          <div className="relative bg-white overflow-hidden rounded-[20px] border border-[#F1F2F9] px-[20px] py-[10px] sm:p-[20px_25px] shadow-[0px_24px_48px_rgba(107,108,126,0.08),0px_12px_24px_rgba(107,108,126,0.12)]">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 left-3 z-10 w-7 h-7 rounded-full bg-[#0A1A2F] hover:bg-[#0A1A2F]/90 flex items-center justify-center transition-colors"
              aria-label="Chiudi"
            >
              <X className="h-3.5 w-3.5 text-white" />
            </button>

            {/* Rectangle-shaped horizontal layout - reduced vertical padding on mobile */}
            <div className="flex flex-row items-center justify-center gap-[15px] sm:gap-[20px] md:gap-[25px] lg:gap-[30px] py-0 sm:py-4 min-h-[180px] sm:min-h-[200px] md:min-h-[220px] lg:h-[240px]">
              {/* Left Side Content */}
              <div className="flex flex-col justify-center items-center text-center w-[50%] sm:w-[48%] md:w-[240px] lg:w-[280px]">
                {/* Logo - proportional sizing */}
                <div className="w-[50px] h-[55px] sm:w-[55px] sm:h-[60px] md:w-[60px] md:h-[65px] lg:w-[65px] lg:h-[70px] relative mb-3 sm:mb-3 md:mb-3.5 lg:mb-4">
                  <Image
                    src="/logos/pop_up_logo.svg"
                    alt="Logo Goal Mania"
                    fill
                    className="object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/logos/pop_up_logo.svg";
                    }}
                    unoptimized
                  />
                </div>

                {/* Text Content - consistent spacing */}
                <div className="space-y-1.5 mb-3 sm:mb-3 md:mb-3.5 lg:mb-4">
                  <h2 className="text-[16px] sm:text-[17px] md:text-[19px] lg:text-[20px] font-bold text-[#170F49] leading-tight">
                    Offerta a Tempo
                    <br />
                    Limitato
                  </h2>
                  <p className="text-[11px] sm:text-[11.5px] md:text-[12.5px] lg:text-[13px] text-[#6F6C8F] line-clamp-1 px-1 sm:px-0">
                    {productTitle}
                  </p>
                </div>

                {/* Price + Button - vertical on mobile, horizontal on desktop */}
                <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 md:gap-3 lg:gap-3 mb-3 sm:mb-3 md:mb-3.5 lg:mb-4 w-full">
                  <span className="text-[14px] sm:text-[16px] md:text-[17px] lg:text-[18px] font-bold text-[#170F49] whitespace-nowrap">
                    a soli 30€
                  </span>
                  <Link href="/shop" className="w-full sm:w-auto">
                    <button
                      onClick={handleDismiss}
                      className="bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white text-[10px] sm:text-[11.5px] md:text-[12.5px] lg:text-[13px] font-semibold px-3 py-1.5 sm:px-4.5 sm:py-1.5 md:px-5 md:py-1.5 lg:px-6 lg:py-2 rounded-full shadow-lg hover:shadow-xl transition-all whitespace-nowrap w-full sm:w-auto"
                    >
                      Compra Ora →
                    </button>
                  </Link>
                </div>

                {/* Review Content - consistent spacing */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] sm:text-[10.5px] md:text-[11px] font-medium text-[#6F6C8F]">
                    {formatReviewCount(reviewCount)} recensioni {averageRating}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="fill-[#FFD700] w-[10px] h-[10px] sm:w-[10.5px] sm:h-[10.5px] md:w-[11px] md:h-[11px] lg:w-[12px] lg:h-[12px]"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - Product Image */}
              <div className="relative flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-3 md:p-3.5 lg:p-4 shadow-inner w-[48%] sm:w-[150px] md:w-[175px] lg:w-[200px] h-[150px] sm:h-[165px] md:h-[180px] lg:h-[200px]">
                <div className="relative w-full h-full">
                  <Image
                    src={featuredProductImage}
                    alt={altText}
                    fill
                    className="object-contain hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/jersey1.webp";
                    }}
                    unoptimized
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
