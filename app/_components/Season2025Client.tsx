"use client";

import CategoryBrowser from "@/components/shop/CategoryBrowser";
import { Product } from "@/lib/types/product";

export default function Season2025Client({ products }: { products: Product[] }) {
  return <CategoryBrowser products={products as any} title="Maglie 25/26" eyebrow="Stagione 25/26" lead="Le maglie della stagione 25/26, a 35€ come le nuove. Spedizione gratuita in Italia e reso entro 14 giorni." here="/shop/2025/26" />;
}
