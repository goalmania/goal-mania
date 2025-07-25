"use client";

import { useState, useEffect } from "react";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useCartStore } from "@/lib/store/cart";
import ProductGrid from "@/app/_components/ProductGrid";
import { Suspense } from "react";
import { Product } from "@/lib/types/product";
import { useI18n } from "@/lib/hooks/useI18n";
import Link from "next/link";
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline";

interface SerieAClientProps {
  products: Product[];
  teamSlug?: string;
}

export default function SerieAClient({ products, teamSlug }: SerieAClientProps) {
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get team display name
  const getTeamDisplayName = (slug: string) => {
    const teamNames: { [key: string]: string } = {
      inter: "Inter",
      milan: "Milan", 
      juventus: "Juventus",
      napoli: "Napoli",
      roma: "Roma",
      lazio: "Lazio",
      atalanta: "Atalanta",
      fiorentina: "Fiorentina",
      torino: "Torino",
      bologna: "Bologna",
      sassuolo: "Sassuolo",
      udinese: "Udinese",
      monza: "Monza",
      lecce: "Lecce",
      frosinone: "Frosinone",
      cagliari: "Cagliari",
      genoa: "Genoa",
      empoli: "Empoli",
      verona: "Verona",
      salernitana: "Salernitana"
    };
    return teamNames[slug.toLowerCase()] || slug;
  };

  const pageTitle = teamSlug 
    ? `${getTeamDisplayName(teamSlug)} Collection`
    : "Serie A & International Collection";

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="flex items-center hover:text-[#f5963c] transition-colors">
            <HomeIcon className="h-4 w-4 mr-1" />
            {t('navigation.home', 'Home')}
          </Link>
          <ChevronRightIcon className="h-4 w-4" />
          <Link href="/shop" className="hover:text-[#f5963c] transition-colors">
            {t('navigation.shop', 'Shop')}
          </Link>
          <ChevronRightIcon className="h-4 w-4" />
          <Link href="/shop/serieA" className="hover:text-[#f5963c] transition-colors">
            Serie A
          </Link>
          {teamSlug && (
            <>
              <ChevronRightIcon className="h-4 w-4" />
              <span className="text-gray-900 font-medium">
                {getTeamDisplayName(teamSlug)}
              </span>
            </>
          )}
        </nav>

        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          {pageTitle}
        </h2>
        {teamSlug && (
          <p className="mt-2 text-gray-600">
            {t('shop.team.description', 'Discover the official shirts and merchandise for')} {getTeamDisplayName(teamSlug)}
          </p>
        )}
        {!teamSlug && (
          <p className="mt-2 text-gray-600">
            {t('shop.serieA.description', 'Discover our complete collection of Serie A and international team shirts')}
          </p>
        )}
        <div className="mt-6">
          <Suspense fallback={<div>Loading...</div>}>
            <ProductGrid
              products={products}
              onWishlistToggle={(product) => {
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
              }}
              onAddToCart={(product) => {
                addToCart({
                  id: product.id.toString(),
                  name: product.name,
                  price: product.price,
                  image: product.image,
                });
              }}
              isInWishlist={isInWishlist}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
