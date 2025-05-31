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
    <div className="min-h-screen bg-white py-8 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-black">
          Fantacalcio
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-6">
            {/* Live Matches Section - Serie A Only */}
            <Card className="overflow-hidden bg-white border border-gray-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-black">
                  Partite in Diretta - Serie A
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SerieALiveMatchesSection />
              </CardContent>
            </Card>

            {/* Serie A News Section */}
            <Card className="overflow-hidden bg-white border border-gray-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-black">
                  Notizie Serie A
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SerieANews />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Fantasy Tips - Editable */}
            <Card className="overflow-hidden bg-white border border-gray-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-black">
                  Consigli Fantacalcio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EditableFantasyTips />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
