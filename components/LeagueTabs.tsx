"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface LeagueTabsProps {
  children: React.ReactNode[];
  leagueName: string;
}

export function LeagueTabs({ children, leagueName }: LeagueTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  // Tab names in Italian
  const tabNames = ["Notizie", "Calendario"];

  return (
    <div className="w-full">
      <div className="border-b">
        <div className="flex space-x-2">
          {tabNames.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:ring-indigo-500",
                activeTab === index
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-black hover:text-black"
              )}
              aria-selected={activeTab === index}
              role="tab"
              aria-controls={`tab-panel-${index}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4">
        {children.slice(0, 2).map((child, index) => (
          <div
            key={index}
            role="tabpanel"
            id={`tab-panel-${index}`}
            aria-labelledby={`tab-${index}`}
            hidden={activeTab !== index}
            className={cn(
              "rounded-md",
              activeTab === index ? "animate-in fade-in-0" : "hidden"
            )}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
