import { Metadata } from "next";
import SerieAClient from "@/app/_components/SerieAClient";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { buildCollectionSchema } from "@/lib/seo/collectionSchema";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Maglie Premier League 2026/27 — Liverpool, Arsenal, Manchester City",
  description:
    "Acquista le maglie della Premier League 2026/27 a partire da 35€. Manchester City, Liverpool, Arsenal, Chelsea, Manchester United. Spedizione gratuita in Italia.",
  keywords: [
    "maglie Premier League",
    "maglia Liverpool",
    "maglia Arsenal",
    "maglia Manchester City",
    "maglia Chelsea",
    "maglia Manchester United",
    "maglie calcio inglese 2026/27",
  ],
  alternates: {
    canonical: "https://goal-mania.it/shop/premier-league",
  },
  openGraph: {
    title: "Maglie Premier League 2026/27 | Goal Mania",
    description:
      "Manchester City, Liverpool, Arsenal, Chelsea, Manchester United e tutte le squadre inglesi. Da 35€.",
    url: "https://goal-mania.it/shop/premier-league",
    type: "website",
  },
};

async function getPremierLeagueProducts() {
  await connectDB();
  const premierTeams = [
    "Manchester United", "Manchester City", "Liverpool", "Arsenal",
    "Chelsea", "Newcastle", "Tottenham", "Aston Villa",
  ];
  const teamRegex = premierTeams.join("|");
  const products = await Product.find({
    isActive: true,
    title: { $regex: new RegExp(`^Maglia\\s+(${teamRegex})`, "i") },
  }).sort({ feature: -1, createdAt: -1 });
  return JSON.parse(JSON.stringify(products));
}

export default async function PremierLeagueShopPage() {
  const serverProducts = await getPremierLeagueProducts();

  const products = serverProducts
    .filter((p: any) => p._id && p.title)
    .map((p: any) => ({ id: String(p._id), slug: p.slug || "", name: p.title, price: p.basePrice || 0, image: p.images?.[0] || "/images/image.png", category: p.category || "Premier League", team: p.title.split(" ")[1] || "" }));

  const collectionSchema = buildCollectionSchema({
    name: "Maglie Premier League 2026/27",
    url: "https://goal-mania.it/shop/premier-league",
    description:
      "Acquista le maglie della Premier League 2026/27 a partire da 35€. Manchester City, Liverpool, Arsenal, Chelsea, Manchester United. Spedizione gratuita in Italia.",
    products: serverProducts,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <SerieAClient products={products} leagueName="Premier League" leagueHref="/shop/premier-league" />
    </>
  );
}
