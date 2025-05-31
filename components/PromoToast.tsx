"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";

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

  // TODO: Ensure /public/images/jersey1.webp and /public/images/jersey1.jpeg exist and are valid images for the popup fallback.

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 flex justify-center items-center">
      <div className="animate-slide-up max-w-md w-full bg-accent rounded-lg shadow-lg border-2 border-primary overflow-hidden">
        <div className="relative p-4">
          {/* Pulsing circle background effect */}
          <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
            <div className="absolute h-32 w-32 bg-white/20 rounded-full animate-ping"></div>
            <div className="absolute h-24 w-24 bg-white/30 rounded-full"></div>
          </div>

          <div className="relative z-10">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 bg-primary/10 hover:bg-primary/20 rounded-full p-1 transition-colors"
              aria-label="Dismiss"
            >
              <XMarkIcon className="h-5 w-5 text-white" />
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-4 text-center">
              <div className="flex-shrink-0">
                <Image
                  src={featuredProductImage || "/images/jersey1.webp"}
                  alt={altText}
                  width={80}
                  height={80}
                  className="rounded-md object-cover border border-gray-200 shadow-sm"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/jersey1.jpeg";
                  }}
                  unoptimized
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">
                  OFFERTA LIMITATA
                </h3>
                <p className="text-sm text-white/90 mb-3">
                  MAGLIE DA CALCIO A SOLI 30€
                </p>
                <Link
                  href="/shop"
                  className="block w-full bg-primary text-black py-2 px-4 rounded-md font-medium text-sm hover:bg-primary/80 transition-colors duration-200"
                >
                  Acquista Ora
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
