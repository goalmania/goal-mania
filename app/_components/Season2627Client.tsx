"use client";

import CategoryBrowser from "@/components/shop/CategoryBrowser";
import { Product } from "@/lib/types/product";

export default function Season2627Client({ products }: { products: Product[] }) {
  return <CategoryBrowser products={products as any} title="Maglie calcio 2026/27" eyebrow="Stagione 26/27" lead="Le nuove maglie della stagione 2026/27, Serie A in testa, tutte a 35€. Spedizione gratuita e reso entro 14 giorni." here="/shop/2026/27" />;
}
