import RetroClient from "@/app/_components/RetroClient";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import type { Metadata } from "next";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Maglie Retro | Goal Mania",
  description: "Rivivi la storia del calcio. Napoli di Maradona, Brasile 2002, Milan anni '90 e tutte le maglie che hanno scritto la storia.",
};

async function getRetroProducts() {
  await connectDB();
  const products = await Product.find({
    category: "Retro",
    isActive: true,
  })
    .sort({ feature: -1, createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(products));
}

export default async function RetroShopPage() {
  const raw = await getRetroProducts();

  const products = raw
    .filter((p: any) => p._id && p.title)
    .map((p: any) => ({
      id: String(p._id),
      name: p.title,
      price: p.basePrice ?? 35,
      image: p.images?.[0] ?? "/images/image.png",
      category: p.category ?? "Retro",
      slug: p.slug ?? "",
      team: p.title,
      isRetro: true,
      feature: !!p.feature,
    }));

  return <RetroClient products={products} />;
}
