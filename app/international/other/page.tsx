import { Metadata } from "next";
import { LeagueTabs } from "@/components/LeagueTabs";
import { LeagueNews } from "@/components/LeagueNews";
import { LeagueCalendar } from "@/components/LeagueCalendar";

export const metadata: Metadata = {
  title: "Altri campionati | Goal Mania",
  description:
    "Ultime notizie e calendario degli altri campionati internazionali",
};

export default async function OtherLeaguesPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-black">
          Altri campionati
        </h1>

        <LeagueTabs leagueName="Altri campionati">
          {/* News Tab */}
          <LeagueNews league="other" />

          {/* Calendar Tab */}
          <LeagueCalendar league="other" />
        </LeagueTabs>
      </div>
    </div>
  );
}
