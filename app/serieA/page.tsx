/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from "next";
import { LeagueStatistics } from "@/components/LeagueStatistics";
import { FeaturedArticles } from "@/components/serieA/featured-articles";
import { RegularArticles } from "@/components/serieA/regular-articles";
import { Suspense } from "react";
import { LoadingFallback } from "@/components/shared/loading-fallback";
import NewsSeriaBanner from "@/components/home/NewsSeriaBanner";

export const metadata: Metadata = {
  title: "Serie A | Goal Mania",
  description:
    "Latest Serie A news, match reports, and analysis from Goal Mania",
};

  const MobilebannerData = {
    imageUrl: `/images/recentUpdate/championsBanner.jpg`, // This uses the uploaded image
  };

export default async function SerieAPage() {

  return (
    <Suspense fallback={<LoadingFallback />}>
      <NewsSeriaBanner imageUrl={MobilebannerData.imageUrl} />
    <div className="bg-[#f7f7f9] min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-[#0e1924] tracking-tight">
          Serie A News
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Standings Column - Left Side */}
          <div className="lg:col-span-4 order-2 lg:order-1">
            <div className="sticky top-20">
              <h2 className="text-xl font-bold mb-4 text-[#0e1924]">Serie A</h2>
              <LeagueStatistics league="serie-a" />
            </div>
          </div>

          {/* News Content - Right Side */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            {/* Featured Articles */}
              <FeaturedArticles />

            {/* Regular Articles */}
              <RegularArticles />
          </div>
        </div>
      </div>
    </div>
    </Suspense>
  );
}
