"use client";

import FilterChips from "@/components/shop/FilterChips";
import ProductRail from "@/components/home/ProductRail";
import ThreeForTwo from "@/components/home/ThreeForTwo";
import type { Product } from "@/lib/types/product";

export default function ShopClient({
  latestProducts = [],
  bestSellingProducts = [],
  featuredProducts = [],
  products2627 = [],
  retroProducts = [],
}: {
  latestProducts: Product[];
  bestSellingProducts: Product[];
  featuredProducts: Product[];
  mysteryBoxProducts?: Product[];
  videoProducts?: Product[];
  worldCupTeams?: any[];
  products2627?: Product[];
  retroProducts?: Product[];
}) {
  const picks = (featuredProducts.length ? featuredProducts : [...bestSellingProducts, ...latestProducts]).slice(0, 12);
  const rail = (list: Product[]) => list.slice(0, 12) as any[];

  return (
    <div>
      <header className="mx-auto max-w-[1760px] px-5 pb-3 pt-8 md:px-8 md:pt-14">
        <h1 className="display text-[clamp(2.4rem,7vw,4.5rem)]">Tutte le maglie</h1>
        <p className="mt-3 max-w-[40ch] text-[19px] leading-snug text-[var(--text-2)]">
          Attuali a 35€, retro a 40€. Spedizione gratuita, e se ne prendi 3 ne paghi 2.
        </p>
      </header>
      <FilterChips />

      <ProductRail title="Novità 26/27" href="/shop/2026/27" products={rail(products2627)} priorityFirst />
      <ProductRail title="Scelte per te" href="/shop" products={rail(picks)} />
      <ThreeForTwo products={rail(products2627.length >= 3 ? products2627 : picks).slice(0, 3)} />
      <ProductRail title="Maglie retro" href="/shop/retro" products={rail(retroProducts)} />
      <ProductRail title="Ultimi arrivi" href="/shop" products={rail(latestProducts)} />

    </div>
  );
}
