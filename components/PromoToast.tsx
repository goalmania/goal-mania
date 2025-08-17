"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PromoToast() {
  const [isVisible, setIsVisible] = useState(false);
  const [featuredProductImage, setFeaturedProductImage] = useState<string>(
    "/images/jersey1.webp"
  );
  const [altText, setAltText] = useState<string>("Prodotto in offerta");

  // Fetch all featured products and select a random one
  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        const response = await fetch("/api/products?feature=true");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
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
        }
        if (productData) {
          setFeaturedProductImage(
            productData.images?.[0] || "/images/jersey1.webp"
          );
          setAltText(productData.title || "Prodotto in offerta");
        } else {
          setFeaturedProductImage("/images/jersey1.webp");
          setAltText("Prodotto in offerta");
        }
      } catch {
        setFeaturedProductImage("/images/jersey1.webp");
        setAltText("Prodotto in offerta");
      }
    }
    fetchFeaturedProducts();
  }, []);

  // Check if toast has been dismissed before
  useEffect(() => {
    const toastDismissed = localStorage.getItem("promoToastDismissed");

    if (!toastDismissed) {
      // Show toast after a 5 second delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Set a flag in localStorage to remember that the user dismissed the toast
    localStorage.setItem("promoToastDismissed", "true");

    // Clear the flag after 12 hours to show the toast again
    setTimeout(() => {
      localStorage.removeItem("promoToastDismissed");
    }, 12 * 60 * 60 * 1000); // 12 hours in milliseconds
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center items-center">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 15,
        }}
        className="max-w-md w-full"
      >
        <Card className="relative overflow-hidden border-2 border-[#f5963c] bg-white shadow-2xl">
          {/* Animated background elements */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.05, 0.1, 0.05],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="absolute h-32 w-32 rounded-full bg-[#f5963c]"
            />
          </div>

          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#f5963c] rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#f5963c] rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#f5963c] rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#f5963c] rounded-br-lg" />

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="absolute top-2 right-2 h-6 w-6 text-gray-700 hover:bg-gray-100 z-20"
            aria-label="Close toast"
          >
            <X className="h-3 w-3" />
          </Button>

          <CardContent className="relative z-10 p-4">
            <div className="flex items-center gap-3">
              {/* Product image */}
              <div className="flex-shrink-0">
                <motion.div
                  animate={{
                    y: [0, -2, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="relative w-16 h-16"
                >
                  <div className="absolute inset-0 rounded-md bg-[#f5963c]/20 animate-pulse" />
                  <div className="relative h-full w-full overflow-hidden rounded-md border border-[#f5963c]/30">
                    <Image
                      src={featuredProductImage || "/images/jersey1.webp"}
                      alt={altText}
                      width={64}
                      height={64}
                      className="object-cover h-full w-full transition-transform hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/jersey1.jpeg";
                      }}
                      unoptimized
                    />
                  </div>
                </motion.div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <Badge 
                  variant="secondary" 
                  className="bg-[#f5963c] text-white font-bold text-xs px-2 py-1 mb-1"
                >
                  OFFERTA LIMITATA
                </Badge>
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  MAGLIE DA CALCIO
                </h3>
                <p className="text-xs text-[#f5963c] font-semibold mb-2">
                  A SOLI 30€
                </p>
                
                {/* Action button */}
                <Button
                  asChild
                  size="sm"
                  className="w-full bg-[#f5963c] hover:bg-[#f5963c]/90 text-white font-medium text-xs py-1"
                >
                  <Link href="/shop">
                    Acquista Ora
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
