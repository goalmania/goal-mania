"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Star, Zap, ShoppingBag } from "lucide-react";

const TOAST_DURATION = 15 * 60; // 15 minutes countdown in seconds

export default function PromoToast() {
  const pathname = usePathname();
  const shouldSuppress =
    pathname?.startsWith('/products/') ||
    pathname === '/cart' ||
    pathname === '/checkout' ||
    pathname?.startsWith('/checkout/');

  const [isVisible, setIsVisible] = useState(false);
  const [featuredProductImage, setFeaturedProductImage] = useState<string>("/images/jersey1.webp");
  const [altText, setAltText] = useState<string>("Prodotto in offerta");
  const [productTitle, setProductTitle] = useState<string>("Maglie da Calcio");
  const [productId, setProductId] = useState<string | null>(null);
  const [reviewCount, setReviewCount] = useState<number>(2500);
  const [averageRating, setAverageRating] = useState<number>(4.9);
  const [countdown, setCountdown] = useState(TOAST_DURATION);

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        const response = await fetch("/api/products?feature=true");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();

        let products: any[] = [];
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          products = data.products;
        } else if (Array.isArray(data) && data.length > 0) {
          products = data;
        }

        if (products.length > 0) {
          const productData = products[Math.floor(Math.random() * products.length)];
          setFeaturedProductImage(productData.images?.[0] || "/images/jersey1.webp");
          setAltText(productData.title || "Prodotto in offerta");
          setProductTitle(productData.title || "Maglie da Calcio");
          setProductId(productData._id || null);

          const reviews = productData.reviews || [];
          setReviewCount(reviews.length > 0 ? reviews.length : 2500);
          if (reviews.length > 0) {
            const avg = reviews.reduce((s: number, r: any) => s + (r.rating || 0), 0) / reviews.length;
            setAverageRating(Number(avg.toFixed(1)));
          }
        }
      } catch {
        // fallback already set
      }
    }
    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    if (localStorage.getItem('promoToastDismissed') === 'true') return;
    const timer = setTimeout(() => setIsVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!isVisible) return;
    const id = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("promoToastDismissed", "true");
    setTimeout(() => {
      localStorage.removeItem("promoToastDismissed");
    }, 12 * 60 * 60 * 1000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return { m, s };
  };

  const formatCount = (count: number) =>
    count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count);

  const { m, s } = formatTime(countdown);
  const productHref = productId ? `/products/${productId}` : "/shop";

  if (shouldSuppress) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.9, transition: { duration: 0.2 } }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[92vw] max-w-[480px]"
        >
          <div
            className="relative overflow-hidden rounded-2xl shadow-2xl"
            style={{
              background: "#0a0a0a",
              border: "1px solid rgba(200,240,0,0.3)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,240,0,0.15)",
            }}
          >
            {/* Lime accent bar at top */}
            <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, #c8f000, rgba(200,240,0,0.3))" }} />

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
              aria-label="Chiudi"
            >
              <X className="h-3.5 w-3.5 text-white/60" />
            </button>

            <div className="flex items-center gap-4 p-4">
              {/* Product image */}
              <Link href={productHref} onClick={handleDismiss} className="flex-shrink-0">
                <div
                  className="relative w-24 h-24 rounded-xl overflow-hidden"
                  style={{ background: "#f5f5f5" }}
                >
                  <Image
                    src={featuredProductImage}
                    alt={altText}
                    fill
                    className="object-contain p-1 hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                </div>
              </Link>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Label */}
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Zap size={11} className="text-[#c8f000]" />
                  <span
                    className="text-[9px] font-black uppercase tracking-[3px] text-[#c8f000]"
                    style={{ fontFamily: "var(--font-mono, monospace)" }}
                  >
                    Offerta Limitata
                  </span>
                </div>

                {/* Title */}
                <p
                  className="font-black uppercase text-white text-sm leading-tight mb-2 line-clamp-2"
                  style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "0.5px" }}
                >
                  {productTitle}
                </p>

                {/* Stars */}
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={10}
                        fill={star <= Math.round(averageRating) ? "#c8f000" : "none"}
                        color={star <= Math.round(averageRating) ? "#c8f000" : "#555"}
                      />
                    ))}
                  </div>
                  <span
                    className="text-[9px] text-white/30"
                    style={{ fontFamily: "var(--font-mono, monospace)" }}
                  >
                    {formatCount(reviewCount)} recensioni
                  </span>
                </div>

                {/* Countdown + CTA */}
                <div className="flex items-center gap-2">
                  {/* Countdown */}
                  <div className="flex items-center gap-1">
                    <Clock size={10} className="text-red-400 flex-shrink-0" />
                    <div className="flex items-center gap-0.5">
                      <span
                        className="text-xs font-black text-red-400 tabular-nums"
                        style={{ fontFamily: "var(--font-mono, monospace)" }}
                      >
                        {m}:{s}
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link href={productHref} onClick={handleDismiss} className="flex-1">
                    <button
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-black uppercase text-black transition-all hover:opacity-90 active:scale-95"
                      style={{
                        background: "#c8f000",
                        fontFamily: "var(--font-display, sans-serif)",
                        fontSize: "0.7rem",
                        letterSpacing: "1.5px",
                        boxShadow: "0 4px 16px rgba(200,240,0,0.25)",
                      }}
                    >
                      <ShoppingBag size={11} />
                      Compra Ora
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
