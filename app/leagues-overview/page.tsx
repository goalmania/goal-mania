"use client";

import { useState } from "react";
import { LeagueRankings } from "@/components/LeagueRankings";

export default function LeaguesOverviewPage() {
  const [selectedTab, setSelectedTab] = useState("all");

  const tabs = [
    { id: "all", name: "All Leagues" },
    { id: "premierLeague", name: "Premier League" },
    { id: "laliga", name: "La Liga" },
    { id: "serieA", name: "Serie A" },
    { id: "bundesliga", name: "Bundesliga" },
    { id: "ligue1", name: "Ligue 1" },
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-black">
          Leagues Overview
        </h1>

        <div className="tabs tabs-boxed mb-6 flex justify-center">
          {tabs.map((tab) => (
            <a
              key={tab.id}
              className={`tab ${selectedTab === tab.id ? "tab-active" : ""}`}
              onClick={() => setSelectedTab(tab.id)}
            >
              {tab.name}
            </a>
          ))}
        </div>

        {selectedTab === "all" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <LeagueRankings league="premierLeague" />
            </div>
            <div>
              <LeagueRankings league="laliga" />
            </div>
            <div>
              <LeagueRankings league="serieA" />
            </div>
            <div>
              <LeagueRankings league="bundesliga" />
            </div>
            <div>
              <LeagueRankings league="ligue1" />
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto">
            <LeagueRankings league={selectedTab as any} />
          </div>
        )}
      </div>
    </div>
  );
}
