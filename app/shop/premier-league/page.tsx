import { Metadata } from "next";
import PremierLeagueClient from "@/app/_components/PremierLeagueClient";
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
      <section className="mx-auto max-w-7xl px-5 pb-4 pt-8 md:px-8 md:pt-12">
        <h1 className="display mb-3 text-[clamp(2.2rem,6vw,3.75rem)]">
          Maglie Premier League 2026/27
        </h1>
        <p className="max-w-2xl text-[17px] leading-snug text-[var(--text-2)]">
          Acquista le maglie della Premier League 2026/27 a partire da 35€.
          Manchester City, Liverpool, Arsenal, Chelsea, Manchester United e tutte le squadre inglesi.
          Spedizione gratuita in Italia.
        </p>
      </section>
      <PremierLeagueClient />
    </>
  );
}
