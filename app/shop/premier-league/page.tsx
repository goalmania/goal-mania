import { Metadata } from "next";
import PremierLeagueClient from "@/app/_components/PremierLeagueClient";

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Maglie Premier League 2025/26",
  url: "https://goal-mania.it/shop/premier-league",
  description: "Acquista le maglie della Premier League 2025/26 a partire da 30€. Manchester City, Liverpool, Arsenal, Chelsea, Manchester United. Spedizione gratuita in Italia.",
};

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
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <section className="pt-24 pb-4 px-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-black uppercase mb-2" style={{ fontFamily: "var(--font-barlow-condensed, sans-serif)", color: "#fff" }}>
          Maglie Premier League 2025/26
        </h1>
        <p className="text-gray-400 text-sm max-w-2xl">
          Acquista le maglie della Premier League 2025/26 a partire da 30€.
          Manchester City, Liverpool, Arsenal, Chelsea, Manchester United e tutte le squadre inglesi.
          Spedizione gratuita in Italia.
        </p>
      </section>
      <PremierLeagueClient />
    </>
  );
}
