import { Metadata } from "next";
import { LeagueTabs } from "@/components/LeagueTabs";
import { LeagueNews } from "@/components/LeagueNews";
import { LeagueCalendar } from "@/components/LeagueCalendar";
import { LeagueRankings } from "@/components/LeagueRankings";
import { Trophy, Calendar, Newspaper, TrendingUp, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Serie A | Goal Mania",
  description: "Ultime notizie, calendario e statistiche della Serie A",
};

export default async function SerieAPage() {
  return (
    <div className="min-h-screen">
      <div className=" h-screen bg-white flex flex-col py-20 gap-4 items-center">
        <h2 className=" text-[47px] font-munish font-medium text-black">
          Serie A
        </h2>
        <p className=" text-[18px] font-munish font-normal md:w-3/5 w-full text-center mx-auto text-black">
          Rimani aggiornato con le novità più importanti dal mondo del calcio:
          trasferimenti, risultati, curiosità e tanto altro in tempo reale.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-4 duration-700 delay-300">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Newspaper className="w-5 h-5 text-[#0e1924]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ultime Notizie</p>
                <p className="text-2xl font-bold text-[#0e1924]">25+</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-4 duration-700 delay-400">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-5 h-5 text-[#f5963c]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Prossime Partite</p>
                <p className="text-2xl font-bold text-[#0e1924]">8</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-4 duration-700 delay-500">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Squadre</p>
                <p className="text-2xl font-bold text-[#0e1924]">20</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main content - takes 2/3 of the width on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-700 delay-600">
              <div className="bg-gradient-to-r from-[#0e1924] to-[#1a2a3a] px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <span className="w-2 h-2 bg-[#f5963c] rounded-full"></span>
                  <span>Serie A Hub</span>
                </h2>
              </div>
              <div className="p-6">
                <LeagueTabs leagueName="Serie A">
                  <LeagueNews league="serieA" />
                  <LeagueCalendar league="serieA" />
                </LeagueTabs>
              </div>
            </div>
          </div>

          {/* Right column - takes 1/3 of the width on large screens */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-700 delay-700">
              <div className="bg-gradient-to-r from-[#f5963c] to-[#e67e22] px-6 py-4">
                <h3 className="text-lg font-bold text-white">Classifica</h3>
              </div>
              <div className="p-4">
                <LeagueRankings league="serieA" />
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-700 delay-800">
              <div className="bg-gradient-to-r from-[#0e1924] to-[#1a2a3a] px-6 py-4">
                <h3 className="text-lg font-bold text-white">Link Rapidi</h3>
              </div>
              <div className="p-4 space-y-3">
                <a
                  href="/shop/serieA"
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-[#f5963c]/10 transition-colors duration-200 group"
                >
                  <span className="font-medium text-[#0e1924] group-hover:text-[#f5963c]">
                    Maglie Serie A
                  </span>
                  <span className="text-[#f5963c] group-hover:translate-x-1 transition-transform duration-200">
                    →
                  </span>
                </a>
                <a
                  href="/news"
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-[#f5963c]/10 transition-colors duration-200 group"
                >
                  <span className="font-medium text-[#0e1924] group-hover:text-[#f5963c]">
                    Tutte le Notizie
                  </span>
                  <span className="text-[#f5963c] group-hover:translate-x-1 transition-transform duration-200">
                    →
                  </span>
                </a>
                <a
                  href="/fantasyFootball"
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-[#f5963c]/10 transition-colors duration-200 group"
                >
                  <span className="font-medium text-[#0e1924] group-hover:text-[#f5963c]">
                    Fantasy Football
                  </span>
                  <span className="text-[#f5963c] group-hover:translate-x-1 transition-transform duration-200">
                    →
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
