import { Metadata } from "next";
import { LeagueTabs } from "@/components/LeagueTabs";
import { LeagueNews } from "@/components/LeagueNews";
import { LeagueCalendar } from "@/components/LeagueCalendar";
import { LeagueRankings } from "@/components/LeagueRankings";

export const metadata: Metadata = {
  title: "Ligue 1 | Goal Mania",
  description: "Ultime notizie, calendario e statistiche della Ligue 1",
};

export default async function Ligue1Page() {
  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-black">
          Ligue 1
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - takes 2/3 of the width on large screens */}
          <div className="lg:col-span-2">
            <LeagueTabs leagueName="Ligue 1">
              {/* News Tab */}
              <LeagueNews league="ligue1" />

              {/* Calendar Tab */}
              <LeagueCalendar league="ligue1" />
            </LeagueTabs>
          </div>

          {/* Right column - takes 1/3 of the width on large screens */}
          <div className="space-y-6">
            <LeagueRankings league="ligue1" />
          </div>
        </div>
      </div>
    </div>
  );
}
