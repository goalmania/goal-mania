import { Metadata } from "next";
import PremierLeagueClient from "@/app/_components/PremierLeagueClient";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Maglie Premier League 2025/26 | Liverpool, Arsenal, Manchester City — Goal Mania",
  description:
    "Acquista le maglie della Premier League 2025/26 a partire da 30€. Manchester City, Liverpool, Arsenal, Chelsea, Manchester United. Spedizione gratuita in Italia.",
  keywords: [
    "maglie Premier League",
    "maglia Liverpool",
    "maglia Arsenal",
    "maglia Manchester City",
    "maglia Chelsea",
    "maglia Manchester United",
    "maglie calcio inglese",
  ],
  alternates: {
    canonical: "https://goal-mania.it/shop/premier-league",
  },
  openGraph: {
    title: "Maglie Premier League 2025/26 | Goal Mania",
    description:
      "Manchester City, Liverpool, Arsenal, Chelsea, Manchester United e tutte le squadre inglesi. Da 30€.",
    url: "https://goal-mania.it/shop/premier-league",
    type: "website",
  },
};

export default async function PremierLeagueShopPage() {
  return <PremierLeagueClient />;
}
