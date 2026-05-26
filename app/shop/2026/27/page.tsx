import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import type { Metadata } from "next";
import Season2627Client from "@/app/_components/Season2627Client";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Maglie 2025/26 — 2026/27 | Goal Mania",
  description: "Tutte le maglie della stagione corrente: Serie A, Premier League, La Liga e Nazionali. Spedizione gratuita.",
};

async function getCurrentSeasonProducts() {
  try {
    await connectDB();
    const products = await Product.find({
      $or: [
        { category: "2025/26" },
        { category: "2026/27" },
        { title: { $regex: "2026-27", $options: "i" } },
        { title: { $regex: "26/27", $options: "i" } },
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
