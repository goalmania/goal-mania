"use client";

import CategoryBrowser from "@/components/shop/CategoryBrowser";
import { Product } from "@/lib/types/product";

export default function Season2024Client({ products }: { products: Product[] }) {
  return <CategoryBrowser products={products as any} title="Maglie 24/25" eyebrow="Stagione 24/25" lead="Le maglie della stagione 24/25. Spedizione gratuita in Italia e reso entro 14 giorni." here="/shop/2024/25" />;
}
