import PremierLeagueClient from "@/app/_components/PremierLeagueClient";

// Enable ISR for Premier League listing
export const revalidate = 300;

export default async function PremierLeagueShopPage() {
  return <PremierLeagueClient />;
}
