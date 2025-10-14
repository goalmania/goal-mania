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
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]"
          style={{ width: "700px", maxWidth: "92vw" }}
        >
          <div
            className="relative bg-white overflow-hidden"
            style={{
              height: "320px",
              borderRadius: "20px",
              borderWidth: "1.47px",
              borderColor: "#F1F2F9",
              padding: "20px 25px",
              boxShadow:
                "0px 24px 48px rgba(107, 108, 126, 0.08), 0px 12px 24px rgba(107, 108, 126, 0.12)",
              opacity: 1,
            }}
          >
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 left-3 z-10 w-7 h-7 rounded-full bg-[#0A1A2F] hover:bg-[#0A1A2F]/90 flex items-center justify-center transition-colors"
              aria-label="Chiudi"
            >
              <X className="h-3.5 w-3.5 text-white" />
            </button>

            <div className="flex items-center justify-center h-full" style={{ gap: "30px" }}>
              {/* Left Side Content */}
              <div
                className="flex flex-col justify-center items-center text-center"
                style={{
                  width: "280px",
                  height: "100%",
                  opacity: 1,
                }}
              >
                {/* Logo */}
                <div className="w-[80px] h-[85px] relative mb-4">
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

                {/* Text Content */}
                <div className="space-y-2 mb-4">
                  <h2 className="text-[22px] font-bold text-[#170F49] leading-tight">
                    Offerta a Tempo
                    <br />
                    Limitato
                  </h2>
                  <p className="text-[14px] text-[#6F6C8F] line-clamp-2">
                    {productTitle}
                  </p>
                </div>

                {/* Price + Button */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[20px] font-bold text-[#170F49]">a soli 30€</span>
                  <Link href="/shop">
                    <button
                      onClick={handleDismiss}
                      className="bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white text-[14px] font-semibold px-7 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
                    >
                      Compra Ora →
                    </button>
                  </Link>
                </div>

                {/* Review Content - Dynamic */}
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[12px] font-medium text-[#6F6C8F]">
                    {formatReviewCount(reviewCount)} recensioni {averageRating}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="fill-[#FFD700]"
                        style={{ width: "14px", height: "14px" }}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - Product Image */}
              <div
                className="relative flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 p-4 shadow-inner"
                style={{
                  width: "280px",
                  height: "280px",
                  opacity: 1,
                }}
              >
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
                {/* Decorative corner accent */}
                {/* <div className="absolute top-2 right-2 w-8 h-8 bg-[#FF7A00] rounded-full opacity-20"></div> */}
                {/* <div className="absolute bottom-2 left-2 w-6 h-6 bg-[#0A1A2F] rounded-full opacity-15"></div> */}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
