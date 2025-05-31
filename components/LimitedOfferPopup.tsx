"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
}

export function LimitedOfferPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [featuredProduct, setFeaturedProduct] =
    useState<FeaturedProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch featured product and check if popup has been dismissed
  useEffect(() => {
    const popupDismissed = localStorage.getItem("limitedOfferDismissed");

    const fetchFeaturedProducts = async () => {
      try {
        // Fetch all featured products from the API
        const response = await fetch("/api/products?feature=true");
        if (!response.ok)
          throw new Error(
            `Error fetching featured products: ${response.status}`
          );
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 15,
        }}
        className="relative max-w-md w-full overflow-hidden rounded-lg shadow-2xl"
        style={{
          backgroundColor: "#101c2d",
          border: "4px solid #f1803a",
          boxShadow: "0 0 30px rgba(241, 128, 58, 0.6)",
        }}
      >
        {/* Corner embellishments */}
        <div className="absolute top-0 left-0 w-16 h-16">
          <div
            className="absolute top-0 left-0 w-full h-full border-t-4 border-l-4 rounded-tl-lg"
            style={{ borderColor: "#f1803a" }}
          ></div>
          <div className="absolute top-0 left-0 w-8 h-8 bg-gradient-to-br from-yellow-400 to-transparent opacity-70 rounded-tl-md"></div>
        </div>
        <div className="absolute top-0 right-0 w-16 h-16">
          <div
            className="absolute top-0 right-0 w-full h-full border-t-4 border-r-4 rounded-tr-lg"
            style={{ borderColor: "#f1803a" }}
          ></div>
          <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-yellow-400 to-transparent opacity-70 rounded-tr-md"></div>
        </div>
        <div className="absolute bottom-0 left-0 w-16 h-16">
          <div
            className="absolute bottom-0 left-0 w-full h-full border-b-4 border-l-4 rounded-bl-lg"
            style={{ borderColor: "#f1803a" }}
          ></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 bg-gradient-to-tr from-yellow-400 to-transparent opacity-70 rounded-bl-md"></div>
        </div>
        <div className="absolute bottom-0 right-0 w-16 h-16">
          <div
            className="absolute bottom-0 right-0 w-full h-full border-b-4 border-r-4 rounded-br-lg"
            style={{ borderColor: "#f1803a" }}
          ></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-yellow-400 to-transparent opacity-70 rounded-br-md"></div>
        </div>

        <div className="relative p-8">
          {/* Animated background elements */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="absolute h-56 w-56 rounded-full"
              style={{ backgroundColor: "#f1803a" }}
            ></motion.div>
          </div>

          {/* Stars or sparkles */}
          <div className="absolute top-10 right-10">
            <motion.div
              animate={{
                opacity: [0.4, 1, 0.4],
                rotate: 360,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="text-yellow-400 text-2xl font-bold"
            >
              ✦
            </motion.div>
          </div>
          <div className="absolute bottom-16 left-12">
            <motion.div
              animate={{
                opacity: [0.4, 1, 0.4],
                rotate: 360,
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
              className="text-yellow-400 text-xl font-bold"
            >
              ✦
            </motion.div>
          </div>

          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 hover:bg-white/10 rounded-full p-1 transition-colors z-20"
            aria-label="Dismiss"
          >
            <XMarkIcon className="h-6 w-6 text-white" />
          </button>

          <div className="relative z-10 text-center space-y-5 py-2">
            <motion.div
              className="flex justify-center"
              animate={{ y: [0, -5, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <h3
                className="text-2xl font-bold px-5 py-2 rounded-full transform rotate-[-3deg]"
                style={{
                  backgroundColor: "#f1803a",
                  color: "white",
                  textShadow: "1px 1px 3px rgba(0,0,0,0.3)",
                }}
              >
                OFFERTA LIMITATA
              </h3>
            </motion.div>

            <p className="text-white font-bold text-lg -mt-2">
              MAGLIE DA CALCIO A SOLI 30€
            </p>

            <div className="flex flex-row items-center">
              {/* Left side content */}
              <div className="flex-1 text-left pr-4">
                <p className="text-xl font-bold text-white mb-3">
                  MAGLIE DA CALCIO A SOLI 30€
                </p>

                <motion.div
                  animate={{
                    scale: [1, 1.03, 1],
                    rotate: [-1, 1, -1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                  className="max-w-[200px] py-3 px-4 border-2 border-dashed rounded-md"
                  style={{ borderColor: "#f1803a" }}
                >
                  <div className="text-sm font-medium text-white">
                    <span className="text-xs block text-yellow-400 font-bold">
                      COLLEZIONE
                    </span>
                    <span
                      className="block text-2xl font-extrabold tracking-wider my-1"
                      style={{
                        color: "#f1803a",
                        textShadow: "0px 0px 8px rgba(241, 128, 58, 0.5)",
                      }}
                    >
                      ESCLUSIVA
                    </span>
                    <span className="text-xs block text-yellow-400 font-bold">
                      EDIZIONE LIMITATA
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Right side product image */}
              <div className="flex-1">
                <motion.div
                  animate={{
                    y: [0, -5, 0],
                    rotate: [-2, 2, -2],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="relative w-32 h-32 mx-auto"
                >
                  <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-pulse"></div>
                  <div className="relative h-full w-full overflow-hidden rounded-lg">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#f1803a]/30 to-transparent z-10"></div>
                    {isLoading ? (
                      <div className="h-full w-full bg-gray-300 animate-pulse"></div>
                    ) : (
                      <Link href={`/products/${featuredProduct?.id}`}>
                        <Image
                          src={featuredProduct?.image || "/images/jersey1.webp"}
                          alt={featuredProduct?.name || "Prodotto in offerta"}
                          width={128}
                          height={128}
                          className="object-cover h-full w-full transition-transform hover:scale-110"
                          onError={(e) => {
                            // Fallback if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.src = "/images/jersey1.jpeg"; // fallback to JPEG
                          }}
                          unoptimized
                        />
                      </Link>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="text-sm font-bold text-white pt-1">
              <span>MAGLIE DA CALCIO A SOLI 30€</span>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="pt-2"
            >
              <Link
                href={
                  featuredProduct?.id && featuredProduct.id !== "default"
                    ? `/products/${featuredProduct.id}`
                    : "/shop"
                }
                className="block w-full py-3 px-6 rounded-md font-bold text-lg shadow-lg transition-all"
                style={{
                  backgroundColor: "#f1803a",
                  color: "white",
                  boxShadow: "0 4px 0 rgba(211, 98, 28, 1)",
                }}
              >
                SCOPRI ORA
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// TODO: Ensure /public/images/jersey1.webp and /public/images/jersey1.jpeg exist and are valid images for the popup fallback.
