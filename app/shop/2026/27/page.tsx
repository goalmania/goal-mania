import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import type { Metadata } from "next";
import Season2627Client from "@/app/_components/Season2627Client";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Maglie Calcio 2026/27 | Nuova Stagione — Goal Mania",
  description:
    "Acquista le maglie calcio della stagione 2026/27 a partire da €30. Inter, Milan, Juventus, Napoli, Liverpool, Real Madrid, Bayern Monaco e altri. Spedizione gratuita in Italia.",
  keywords: [
    "maglie calcio 2026/27",
    "maglie 2026 27",
    "nuove maglie calcio",
    "maglie stagione 2026",
    "maglie Serie A 2026/27",
    "maglie Premier League 2026/27",
    "maglie Real Madrid 2026/27",
    "maglie Bayern Monaco 2026/27",
  ],
  alternates: {
    canonical: "https://goal-mania.it/shop/2026/27",
  },
  openGraph: {
    title: "Maglie Calcio 2026/27 | Goal Mania",
    description:
      "Le nuove maglie della stagione 2026/27. Inter, Milan, Liverpool, Real Madrid, Bayern, PSG a partire da €30. Spedizione gratuita.",
    url: "https://goal-mania.it/shop/2026/27",
    type: "website",
  },
};

async function getCurrentSeasonProducts() {
  try {
    await connectDB();
    const products = await Product.find({
      $or: [
        { category: "2026/27" },
        { title: { $regex: "2026[-/]27", $options: "i" } },
      ],
      isActive: true,
    })
      .sort({ feature: -1, createdAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(products));
  } catch {
    return [];
  }
}

export default async function Season2627Page() {
  const raw = await getCurrentSeasonProducts();

  const products = raw
    .filter((p: any) => p._id && p.title)
    .map((p: any) => ({
      id: String(p._id),
      name: p.title,
      price: p.basePrice ?? 30,
      image: p.images?.[0] ?? "/placeholder.jpg",
      category: p.category ?? "2025/26",
      slug: p.slug ?? "",
      team: p.title,
      feature: !!p.feature,
    }));

  return <Season2627Client products={products} />;
}
