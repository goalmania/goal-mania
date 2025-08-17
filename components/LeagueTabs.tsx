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
      <div className="border-b border-gray-200">
        <div className="flex space-x-1 md:space-x-2">
          {tabNames.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={cn(
                "px-3 py-2 md:px-4 md:py-3 text-sm md:text-base font-medium transition-all duration-300 rounded-t-lg",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#f5963c]",
                "hover:bg-gray-50",
                activeTab === index
                  ? "border-b-2 border-[#f5963c] text-[#f5963c] bg-white shadow-sm"
                  : "text-gray-600 hover:text-[#0e1924]"
              )}
              aria-selected={activeTab === index}
              role="tab"
              aria-controls={`tab-panel-${index}`}
            >
              <span className="flex items-center space-x-2">
                <span>{tab}</span>
                {activeTab === index && (
                  <span className="w-2 h-2 bg-[#f5963c] rounded-full animate-pulse"></span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6">
        {children.slice(0, 2).map((child, index) => (
          <div
            key={index}
            role="tabpanel"
            id={`tab-panel-${index}`}
            aria-labelledby={`tab-${index}`}
            hidden={activeTab !== index}
            className={cn(
              "rounded-lg",
              activeTab === index 
                ? "animate-in slide-in-from-bottom-2 duration-300 ease-out" 
                : "hidden"
            )}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
