"use client";

import CategoryBrowser from "@/components/shop/CategoryBrowser";
import { Product } from "@/lib/types/product";

export default function Season2025Client({ products }: { products: Product[] }) {
  return <CategoryBrowser products={products as any} title="Maglie 25/26" eyebrow="Stagione 25/26" lead="Tutte le squadre della stagione 25/26. Maglie a 35€, spedizione gratuita e reso entro 14 giorni." here="/shop/2025/26" />;
}
