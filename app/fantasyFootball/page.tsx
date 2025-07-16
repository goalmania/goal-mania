import { Suspense } from "react";
import { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Import new components
import SerieALiveMatchesSection from "@/app/components/SerieALiveMatchesSection";
import { SerieANews } from "@/app/components/SerieANews";
import EditableFantasyTips from "@/app/components/EditableFantasyTips";

export const metadata: Metadata = {
  title: "Fantacalcio | Goal Mania",
  description: "Notizie, statistiche e consigli per il fantacalcio",
};

const leagues = [
  { id: "serieA", name: "Serie A" },
  { id: "premierLeague", name: "Premier League" },
  { id: "laliga", name: "La Liga" },
  { id: "bundesliga", name: "Bundesliga" },
  { id: "ligue1", name: "Ligue 1" },
];

export default function FantasyFootballPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 py-8 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Decorative Section Header */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#0e1924] drop-shadow-md transition-colors duration-300 mb-8">
          Fantacalcio
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            {/* Live Matches Section - Serie A Only */}
            <Card className="overflow-hidden bg-white border border-gray-100 shadow-lg rounded-2xl transition-shadow duration-300 hover:shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-black">
                  Partite in Diretta - Serie A
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-white">
                <SerieALiveMatchesSection />
              </CardContent>
            </Card>

            {/* Serie A News Section */}
            <Card className="overflow-hidden bg-white border border-gray-100 shadow-lg rounded-2xl transition-shadow duration-300 hover:shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0e1924]">
                  Notizie Serie A
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-white">
                <SerieANews />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Fantasy Tips - Editable */}
            <Card className="overflow-hidden bg-white border border-gray-100 shadow-lg rounded-2xl relative transition-shadow duration-300 hover:shadow-xl">
              <CardHeader className="pb-3 pl-6">
                <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-black">
                  Consigli Fantacalcio
                </CardTitle>
              </CardHeader>
              <CardContent className="pl-6">
                <EditableFantasyTips />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
