import { Metadata } from "next";
import ShopClientWrapper from "@/app/_components/ShopClientWrapper";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Negozio Maglie da Calcio — Tutte le Squadre",
  description:
    "Scopri tutto il catalogo: maglie Serie A, Premier League, Mondiali 2026, retro e edizioni limitate. Prezzi a partire da 30€. Spedizione gratuita in Italia.",
  keywords: [
    "negozio maglie calcio",
    "maglie da calcio online",
    "maglie calcio economiche",
    "shop maglie calcio",
    "maglie calcio Italia",
  ],
  alternates: {
    canonical: "https://goal-mania.it/shop",
  },
  openGraph: {
    title: "Negozio Maglie da Calcio | Goal Mania",
    description:
      "Serie A, Premier League, Mondiali 2026, retro e edizioni limitate. Prezzi a partire da 30€.",
    url: "https://goal-mania.it/shop",
    type: "website",
  },
};

export default async function ShopPage() {
  return (
    <div className="">
      <ShopClientWrapper />
    </div>
  );
}
