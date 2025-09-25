"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCartIcon,
  SparklesIcon,
  GiftIcon,
} from "@heroicons/react/24/outline";
import { useCartStore } from "@/lib/store/cart";
import { Product } from "@/lib/types/home";
import { useI18n } from "@/lib/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { ArrowRight, MoveRight } from "lucide-react";

interface MysteryBoxPageClientProps {
  products: Product[];
}

export default function MysteryBoxPageClient({
  products,
}: MysteryBoxPageClientProps) {
  const { addItem } = useCartStore();
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});
  const { t } = useI18n();

  const handleAddToCart = async (product: Product) => {
    setLoadingStates((prev) => ({ ...prev, [product.id]: true }));

    try {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        customization: {
          size: "M", // Default size for mystery box
          selectedPatches: [],
          includeShorts: false,
          includeSocks: false,
          isPlayerEdition: false,
          isKidSize: false,
          hasCustomization: false,
          excludedShirts: [], // Start with empty exclusion list
        },
        quantity: 1,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  return (
    <div className="bg-white h-max font-munish">
      <div className=" h-[90px] flex gap-2 items-center justify-center">
        <Link href={"/leagues-overview"}>
          <Button className=" bg-[#FF7A00] text-[#0A1A2F] rounded-full   ">
            Squadre Top del Momento
          </Button>
        </Link>
        <span className="text-[20px] text-black">per le prossime 24 ore</span>
      </div>
      <div className="overflow-hidden gradient">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-22 sm:py-24">
          <div className="text-center flex justify-center flex-col">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 flex text-center justify-center">
              {t("mysteryBox.title")}
              <SparklesIcon className=" h-6 w-6 text-yellow-300 " />
            </h1>

            <p className="mx-auto max-w-3xl text-xl sm:text-2xl text-purple-100 mb-8">
              {t("mysteryBox.description")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className=" p-4 text-white">
                <div className="text-2xl font-bold">
                  <img src={"/box.png"} className="h-35 w-35" />
                </div>
                <div className="text-sm font-bold text-[18px]">
                  {t("mysteryBox.features.surprise")}
                </div>
              </div>
              <div className=" p-4 text-white">
                <img src={"/ball.png"} className="h-30 w-30" />

                <div className="text-sm font-bold text-[18px]">
                  {t("mysteryBox.features.teams")}
                </div>
              </div>
              <div className=" p-4 text-white">
                <img src={"/delivery.png"} className="h-35 w-35" />

                <div className="text-sm font-bold text-[18px]">
                  {t("mysteryBox.features.shipping")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-[#0A1A2F] opacity-85 text-white sm:py-16 py-8 ">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold  mb-4">
              {t("mysteryBox.subtitle")}
            </h2>
            <p className="text-lg text-white max-w-2xl mx-auto">
              {t("mysteryBox.subtitle")}
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <GiftIcon className="mx-auto h-16 w-16  mb-4" />
              <h3 className="text-lg font-medium  mb-2">
                {t("mysteryBox.empty")}
              </h3>
              <p className="text-gray-600">
                {t("mysteryBox.emptyDescription")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-transparent   flex flex-col h-full"
                  tabIndex={0}
                  aria-label={product.name}
                >
                  {/* Product Image */}
                  <div className="relative hidden aspect-square overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 border-b border-gray-100 group-hover:scale-105 transition-transform duration-300 will-change-transform">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      quality={90}
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={true}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                    {/* Mystery Box Badge */}
                    <div className="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 shadow-md">
                      <GiftIcon className="h-4 w-4" />
                      {t("mysteryBox.title")}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-6 flex-col flex-1 hidden">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      {t("mysteryBox.product.description")}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="text-2xl font-bold text-purple-600">
                        €{product.price.toFixed(2)}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-purple-700 bg-purple-50 rounded-full px-2 py-1 font-medium">
                        <svg
                          className="h-4 w-4 text-purple-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {t("mysteryBox.product.trust.freeShipping")}
                      </div>
                    </div>

                    {/* Sizes Display - only show if needed, here always for demo */}
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-2 justify-start items-center">
                        {/* Adult Sizes */}
                        {["S", "M", "L", "XL", "XXL", "3XL"].map((size) => (
                          <span
                            key={size}
                            className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-semibold text-xs shadow-sm border border-purple-200"
                          >
                            {size}
                          </span>
                        ))}
                        {/* Kids Sizes (uncomment if needed) */}
                        {/*
                        {["16", "18", "20", "22", "24", "26"].map((size) => (
                          <span
                            key={size}
                            className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 font-semibold text-xs shadow-sm border border-orange-200"
                          >
                            {size}
                          </span>
                        ))}
                        */}
                      </div>
                    </div>

                    {/* Trust/Info Row */}
                    <div className="flex flex-wrap gap-3 mb-5 mt-auto">
                      <div className="flex items-center gap-1 text-xs text-orange-700 bg-orange-50 rounded-full px-2 py-1 font-medium">
                        <svg
                          className="h-4 w-4 text-orange-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                        {t("mysteryBox.product.trust.secure")}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-pink-700 bg-pink-50 rounded-full px-2 py-1 font-medium">
                        <SparklesIcon className="h-4 w-4 text-pink-400" />
                        {t("mysteryBox.product.trust.premium")}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={loadingStates[product.id]}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-bold text-base hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                        aria-label={t("mysteryBox.product.addToCart")}
                      >
                        {loadingStates[product.id] ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <ShoppingCartIcon className="h-5 w-5" />
                            {t("mysteryBox.product.addToCart")}
                          </>
                        )}
                      </button>
                      <Link
                        href={`/products/${product.id}`}
                        className=" w-full text-center hidden text-purple-600 hover:text-purple-700 font-medium py-2 px-4 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors duration-200"
                        aria-label={t("mysteryBox.product.learnMore")}
                      >
                        {t("mysteryBox.product.learnMore")}
                      </Link>
                    </div>
                  </div>
                  <div className=" flex justify-center p-4">
                    <img src={"/gift.png"} className="h-45 w-45" />
                  </div>
                  <div className="">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={loadingStates[product.id]}
                      className="w-fit bg-[#FF7A00] text-[#0A1A2F] py-3  rounded-full font-medium text-base  flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed "
                      aria-label={t("mysteryBox.product.addToCart")}
                    >
                      {loadingStates[product.id] ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          {t("mysteryBox.product.addToCart")}
                          <MoveRight
                            className="h-6 w-6    mx-auto md:mx-0"
                            strokeWidth={1}
                          />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-[#0A1A2F] md:py-14 py-6 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold  mb-2">
              {t("mysteryBox.process.title")}
            </h2>
            <p className="text-base  max-w-2xl mx-auto">
              {t("mysteryBox.process.description")}
            </p>
          </div>

          <div className="flex  flex-col md:flex-row gap-8">
            <div className="text-center">
              <h3 className="text-xl font-extrabold mb-2 text-[#FF7A00]">
                {t("mysteryBox.steps.step1.title")}
              </h3>
              <p className="text-white w-[80%] mx-auto">
                {t("mysteryBox.steps.step1.description")}
              </p>
            </div>
            <div className="hidden md:flex items-center justify-center">
              <MoveRight
                className="h-6 w-6 text-white mx-auto md:mx-0"
                strokeWidth={1}
              />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-extrabold  mb-2 text-[#FF7A00]">
                {t("mysteryBox.steps.step2.title")}
              </h3>
              <p className="text-white w-[80%] mx-auto">
                {t("mysteryBox.steps.step2.description")}
              </p>
            </div>
            <div className="hidden md:flex items-center justify-center">
              <MoveRight
                className="h-6 w-6 text-white mx-auto md:mx-0"
                strokeWidth={1}
              />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-extrabold  mb-2 text-[#FF7A00]">
                {t("mysteryBox.steps.step3.title")}
              </h3>
              <p className="text-white w-[80%] mx-auto">
                {t("mysteryBox.steps.step3.description")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white text-[#0A1A2F] pt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            {t("mysteryBox.cta.title")}
          </h2>
          <p className="text-lg  mb-8 max-w-2xl mx-auto">
            {t("mysteryBox.cta.description")}
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center bg-[#FF7A00] px-5 py-2 gap-1.5 rounded-full text-[#0A1A2F] font-medium hover:bg-[#FF7A00]/80 transition-colors duration-200"
          >
            {t("mysteryBox.cta.button")}{" "}
            <MoveRight className="h-6 w-6    mx-auto md:mx-0" strokeWidth={1} />
          </Link>
        </div>
      </div>
    </div>
  );
}
