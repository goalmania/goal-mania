import RetroClient from "@/app/_components/RetroClient";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Maglie Calcio Retro — Storiche, Vintage, Anni 90",
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

  const retroTeams = [
    { slug: "milan", label: "Milan" },
    { slug: "inter", label: "Inter" },
    { slug: "juventus", label: "Juventus" },
    { slug: "napoli", label: "Napoli" },
    { slug: "roma", label: "Roma" },
    { slug: "lazio", label: "Lazio" },
    { slug: "fiorentina", label: "Fiorentina" },
    { slug: "parma", label: "Parma" },
    { slug: "man-united", label: "Man. United" },
    { slug: "liverpool", label: "Liverpool" },
    { slug: "arsenal", label: "Arsenal" },
    { slug: "barcellona", label: "Barcellona" },
    { slug: "real-madrid", label: "Real Madrid" },
    { slug: "brasil", label: "Brasile" },
    { slug: "argentina", label: "Argentina" },
    { slug: "italia", label: "Italia" },
    { slug: "francia", label: "Francia" },
    { slug: "celtic", label: "Celtic" },
    { slug: "psg", label: "PSG" },
  ];

  return (
    <>
      {/* Navigazione team retro — internal linking SEO */}
      <nav className="flex flex-wrap gap-2 px-4 py-3 border-b border-white/10" aria-label="Maglie retro per squadra">
        {retroTeams.map((t) => (
          <Link
            key={t.slug}
            href={`/shop/retro/${t.slug}`}
            className="text-xs px-3 py-1.5 rounded-full border border-white/20 hover:border-[#c8f000] hover:text-[#c8f000] transition-colors"
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <RetroClient products={products} />
    </>
  );
}
