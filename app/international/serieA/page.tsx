import { Metadata } from "next";
import { LeagueTabs } from "@/components/LeagueTabs";
import { LeagueNews } from "@/components/LeagueNews";
import { LeagueCalendar } from "@/components/LeagueCalendar";
import { LeagueRankings } from "@/components/LeagueRankings";

export const metadata: Metadata = {
  title: "Serie A | Goal Mania",
  description: "Ultime notizie, calendario e statistiche della Serie A",
};

export default async function SerieAPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-black">
          Serie A
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - takes 2/3 of the width on large screens */}
          <div className="lg:col-span-2">
            <LeagueTabs leagueName="Serie A">
              {/* News Tab */}
              <LeagueNews league="serieA" />

              {/* Calendar Tab */}
              <LeagueCalendar league="serieA" />
            </LeagueTabs>
          </div>

          {/* Right column - takes 1/3 of the width on large screens */}
          <div className="space-y-6">
            <LeagueRankings league="serieA" />
          </div>
        </div>
      </div>
    </div>
  );
}
