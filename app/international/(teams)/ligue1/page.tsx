import { Metadata } from "next";
import { LeagueTabs } from "@/components/LeagueTabs";
import { LeagueNews } from "@/components/LeagueNews";
import { LeagueCalendar } from "@/components/LeagueCalendar";
import { LeagueRankings } from "@/components/LeagueRankings";
import { Trophy, Calendar, Newspaper, TrendingUp, Crown } from "lucide-react";
import Slider from "./components/slider";
import NewsSection from "@/components/home/NewsSection";
import Article from "@/lib/models/Article";
import connectDB from "@/lib/db";

export const metadata: Metadata = {
  title: "Ligue 1 | Goal Mania",
  description: "Ultime notizie, calendario e statistiche della Ligue 1",
};

export default async function Ligue1Page() {
  const featuredArticles = await (async () => {
    try {
      await connectDB();
      return await Article.find({
        status: "published",
        featured: true,
      })
        .sort({ publishedAt: -1 })
        .limit(3)
        .lean();
    } catch (error) {
      console.error("Error fetching articles:", error);
      return [];
    }
  })();
  return (
    <div className="min-h-screen">
      <div className=" md:h-[90vh] h-[75vh] bg-white flex flex-col py-20 gap-4 items-center">
        <div className="space-y-4 flex flex-col  items-center">
          <h2 className=" text-[47px] font-munish font-medium text-black">
            Ligue 1
          </h2>
          <p className=" text-[18px] font-munish font-normal md:w-3/5 w-full text-center mx-auto text-black">
            Rimani aggiornato con le novità più importanti dal mondo del calcio:
            trasferimenti, risultati, curiosità e tanto altro in tempo reale.
          </p>
        </div>
        <div className="">
          <Slider />
        </div>
      </div>
      <div className=" w-11/12 bg-white mx-auto">
        <div className="  overflow-hidden animate-in slide-in-from-bottom-4 duration-700 delay-700">
          <div className="space-y-4 flex flex-col  items-center">
            <h2 className=" text-[47px] font-munish font-medium text-black">
              Classifica
            </h2>
            <p className=" text-[18px] font-munish font-normal md:w-3/5 w-full text-center mx-auto text-black">
              Rimani aggiornato con le novità più importanti dal mondo del
              calcio: trasferimenti, risultati, curiosità e tanto altro in tempo
              reale.
            </p>
          </div>
          <div className="p-4">
            <LeagueRankings league="ligue1" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <NewsSection articles={featuredArticles} />
      </div>
    </div>
  );
}
