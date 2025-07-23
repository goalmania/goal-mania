"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/hooks/useI18n";

interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
}

export function LimitedOfferPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [featuredProduct, setFeaturedProduct] = useState<FeaturedProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useI18n();

  // Fetch featured product and check if popup has been dismissed
  useEffect(() => {
    const popupDismissed = localStorage.getItem("limitedOfferDismissed");

    const fetchFeaturedProducts = async () => {
      try {
        // Fetch all featured products from the API
        const response = await fetch("/api/products?feature=true");
        if (!response.ok)
          throw new Error(`Error fetching featured products: ${response.status}`);
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
          // Pick a random product
          productData = products[Math.floor(Math.random() * products.length)];
        }
        if (productData) {
          setFeaturedProduct({
            id: productData._id || "",
            name: productData.title || "Featured Product",
            price: productData.basePrice || 0,
            image: productData.images?.[0] || "/images/jersey1.webp",
          });
        } else {
          setFeaturedProduct({
            id: "default",
            name: "Featured Product",
            price: 99.99,
            image: "/images/jersey1.webp",
          });
        }
      } catch (error) {
        setFeaturedProduct({
          id: "default",
          name: "Featured Product",
          price: 99.99,
          image: "/images/jersey1.webp",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();

    if (!popupDismissed) {
      // Show popup after a 2 second delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Set a flag in localStorage to remember that the user dismissed the popup
    localStorage.setItem("limitedOfferDismissed", "true");

    // Clear the flag after 3 hours to show the popup again
    setTimeout(() => {
      localStorage.removeItem("limitedOfferDismissed");
    }, 3 * 60 * 60 * 1000); // 3 hours in milliseconds
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 15,
        }}
        className="relative max-w-md w-full mx-4"
      >
        <Card className="relative overflow-hidden border-2 border-[#f5963c] bg-white shadow-2xl">
          {/* Animated background elements */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.05, 0.1, 0.05],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="absolute h-56 w-56 rounded-full bg-[#f5963c]"
            />
          </div>

          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#f5963c] rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#f5963c] rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#f5963c] rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#f5963c] rounded-br-lg" />

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="absolute top-2 right-2 h-8 w-8 text-gray-700 hover:bg-gray-100 z-20"
            aria-label="Close popup"
          >
            <X className="h-4 w-4" />
          </Button>

          <CardContent className="relative z-10 p-6 text-center space-y-4">
            {/* Header */}
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <Badge 
                variant="secondary" 
                className="bg-[#f5963c] text-white font-bold text-sm px-4 py-2 mb-2"
              >
                {t('popup.limitedOffer')}
              </Badge>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {t('popup.jerseys')}
              </h3>
              <p className="text-lg font-semibold text-[#f5963c]">
                {t('popup.price')}
              </p>
            </motion.div>

            {/* Product section */}
            <div className="flex items-center gap-4">
              {/* Left side - Collection badge */}
              <div className="flex-1">
                <motion.div
                  animate={{
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                  className="bg-gray-100 border border-[#f5963c]/50 rounded-lg p-3"
                >
                  <div className="text-center">
                    <p className="text-xs text-[#f5963c] font-semibold mb-1">
                      COLLEZIONE
                    </p>
                    <p className="text-lg font-bold text-gray-900 mb-1">
                      ESCLUSIVA
                    </p>
                    <p className="text-xs text-[#f5963c] font-semibold">
                      EDIZIONE LIMITATA
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Right side - Product image */}
              <div className="flex-1">
                <motion.div
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="relative w-24 h-24 mx-auto"
                >
                  <div className="absolute inset-0 rounded-lg bg-[#f5963c]/20 animate-pulse" />
                  <div className="relative h-full w-full overflow-hidden rounded-lg border border-[#f5963c]/30">
                    {isLoading ? (
                      <div className="h-full w-full bg-gray-300 animate-pulse" />
                    ) : (
                      <Link href={`/products/${featuredProduct?.id}`}>
                        <Image
                          src={featuredProduct?.image || "/images/jersey1.webp"}
                          alt={featuredProduct?.name || "Prodotto in offerta"}
                          width={96}
                          height={96}
                          className="object-cover h-full w-full transition-transform hover:scale-110"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/images/jersey1.jpeg";
                          }}
                          unoptimized
                        />
                      </Link>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Action button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                asChild
                className="w-full bg-[#f5963c] hover:bg-[#f5963c]/90 text-white font-bold text-lg py-3 shadow-lg"
              >
                <Link
                  href={
                    featuredProduct?.id && featuredProduct.id !== "default"
                      ? `/products/${featuredProduct.id}`
                      : "/shop"
                  }
                >
                  SCOPRI ORA
                </Link>
              </Button>
            </motion.div>

            {/* Footer text */}
            <p className="text-sm text-gray-600 font-medium">
              Offerta valida solo oggi!
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
