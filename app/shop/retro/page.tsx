import RetroClient from "@/app/_components/RetroClient";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import type { Metadata } from "next";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Maglie Calcio Retro | Storiche, Vintage, Anni 90 — Goal Mania",
  description:
    "Acquista maglie retro storiche del calcio. Napoli di Maradona, Brasile 2002, Milan anni '90, Juventus, Argentina, France 98. Da 30€. Spedizione gratuita in Italia.",
  keywords: [
    "maglie calcio retro",
    "maglie calcio vintage",
    "maglie calcio storiche",
    "maglia Napoli Maradona",
    "maglia Brasile 2002",
    "maglie anni 90 calcio",
    "maglie calcio anni 2000",
  ],
  alternates: {
    canonical: "https://goal-mania.it/shop/retro",
  },
  openGraph: {
    title: "Maglie Calcio Retro | Goal Mania",
    description:
      "Napoli di Maradona, Brasile 2002, Milan anni '90 e tutte le maglie che hanno scritto la storia. Da 30€.",
    url: "https://goal-mania.it/shop/retro",
    type: "website",
  },
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
