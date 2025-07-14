/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRODUCT_CATEGORIES } from "@/lib/types/product";
import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const categoryToPath = {
  "2024/25": "/shop/2024/25",
  "2025/26": "/shop/2025/26",
  SerieA: "/shop/serieA",
  International: "/shop/international",
  Retro: "/shop/retro",
};

const categoryToLabel = {
  "2024/25": "2024/25 Collection",
  "2025/26": "2025/26 Collection",
  SerieA: "Serie A",
  International: "International",
  Retro: "Retro Collection",
};

export default function ShopNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow sticky top-[46px] sm:top-[64px] z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Desktop Navigation */}
        <div className="hidden md:flex h-14 lg:h-16 justify-between">
          <div className="flex flex-1 justify-center">
            <div className="flex space-x-6 lg:space-x-8">
              <Link
                href="/shop"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  pathname === "/shop"
                    ? "border-b-2 border-indigo-500 text-gray-900"
                    : "border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Featured
              </Link>
              {PRODUCT_CATEGORIES.map((category) => (
                <Link
                  key={category}
                  href={
                    categoryToPath[category] ||
                    `/shop/${category.toLowerCase()}`
                  }
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    pathname === categoryToPath[category]
                      ? "border-b-2 border-indigo-500 text-gray-900"
                      : "border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {categoryToLabel[category] || category}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden py-2 relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-md shadow-sm"
          >
            <span className="truncate">
              {pathname === "/shop"
                ? "Featured"
                : Object.entries(categoryToPath).find(
                    ([_, path]) => path === pathname
                  )
                ? categoryToLabel[
                    Object.entries(categoryToPath).find(
                      ([_, path]) => path === pathname
                    )?.[0] as keyof typeof categoryToLabel
                  ]
                : "Shop Categories"}
            </span>
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform ${
                isMenuOpen ? "transform rotate-180" : ""
              }`}
            />
          </button>

          {isMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg overflow-hidden z-10">
              <div className="py-1">
                <Link
                  href="/shop"
                  className={`block px-4 py-2 text-sm ${
                    pathname === "/shop"
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Featured
                </Link>
                {PRODUCT_CATEGORIES.map((category) => (
                  <Link
                    key={category}
                    href={
                      categoryToPath[category] ||
                      `/shop/${category.toLowerCase()}`
                    }
                    className={`block px-4 py-2 text-sm ${
                      pathname === categoryToPath[category]
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {categoryToLabel[category] || category}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
