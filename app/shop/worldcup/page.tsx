import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import WorldCupClient from "@/app/_components/WorldCupClient";
import type { Metadata } from "next";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Maglie Mondiali 2026 | Goal Mania",
  description:
    "Scopri la selezione di kit per i Mondiali 2026. Argentina, Brasile, Francia, Italia e tutte le nazionali. Spedizione rapida.",
  openGraph: {
    title: "FIFA World Cup 2026 — Tutte le Nazionali",
    description: "Vesti la tua nazione per il Mondiale 2026.",
  },
};

async function getWorldCupProducts() {
  try {
    await connectDB();
    const products = await Product.find({ isWorldCup: true, isActive: true })
      .sort({ createdAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(products));
  } catch (err) {
    console.error("WorldCup DB error:", err);
    return [];
  }
}

export default async function WorldCupPage() {
  const products = await getWorldCupProducts();

  // Group by country
  const groupedProducts = products.reduce(
    (acc: Record<string, any[]>, p: any) => {
      const key = p.country || p.nationalTeam || "Other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
      return acc;
    },
    {}
  );

  // Sort: alphabetically, "Other" last
  const sortedCountries = Object.keys(groupedProducts).sort((a, b) => {
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return a.localeCompare(b);
  });

  return (
    <WorldCupClient
      products={products}
      groupedProducts={groupedProducts}
      sortedCountries={sortedCountries}
    />
  );
}
