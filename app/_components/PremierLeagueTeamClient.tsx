"use client";

/**
 * PremierLeagueTeamClient — delegates to the shared SerieAClient
 * which already contains Premier League club identities (heritage hero,
 * category tabs, grain texture, etc.).
 */
import SerieAClient from "@/app/_components/SerieAClient";
import { Product } from "@/lib/types/product";

interface PremierLeagueTeamClientProps {
  products: Product[];
  teamSlug: string;
  teamName: string;
}

export default function PremierLeagueTeamClient({
  products,
  teamSlug,
}: PremierLeagueTeamClientProps) {
  return (
    <SerieAClient
      products={products}
      teamSlug={teamSlug}
      leagueName="Premier League"
      leagueHref="/shop/premier-league"
    />
  );
}
