"use client";

import React from "react";

const BREAKING_ITEMS = [
  "Calciomercato: Mbappé verso il Real Madrid",
  "Risultato: Napoli 2-1 Milan",
  "Infortuni: Osimhen out 3 settimane",
  "Ufficiale: Mourinho nuovo CT del Portogallo",
  "Serie A: Inter a +5 sulla Juventus in classifica",
  "Champions: Real Madrid in finale dopo 3-1 al Bayern",
  "Mercato: Lukaku prossimo all'accordo con la Roma",
];

export default function BreakingNewsTicker() {
  const tickerContent = BREAKING_ITEMS.join(" • ");
  // Duplicate to create seamless loop
  const fullContent = `${tickerContent} • ${tickerContent}`;

  return (
    <div
      className="w-full overflow-hidden flex items-center gap-0 select-none"
      style={{ background: "#111", borderBottom: "1px solid rgba(255,255,255,0.06)", height: "40px" }}
    >
      {/* Breaking pill */}
      <div
        className="flex-shrink-0 flex items-center gap-2 px-4 h-full z-10"
        style={{ background: "#111", borderRight: "1px solid rgba(255,255,255,0.08)" }}
      >
        <span
          className="w-2 h-2 rounded-full inline-block animate-pulse"
          style={{ background: "#ff3333" }}
        />
        <span
          className="text-[10px] font-black uppercase tracking-[3px] whitespace-nowrap"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "#ff3333" }}
        >
          BREAKING
        </span>
      </div>

      {/* Scrolling ticker */}
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <div className="ticker-wrapper flex items-center gap-0">
          <div
            className="ticker-content whitespace-nowrap"
            style={{ fontFamily: "var(--font-body, sans-serif)", color: "rgba(245,245,245,0.8)", fontSize: "13px" }}
          >
            {fullContent}
          </div>
        </div>
      </div>

      <style jsx>{`
        .ticker-wrapper {
          animation: ticker-scroll 40s linear infinite;
          display: flex;
          align-items: center;
          padding-left: 16px;
        }
        .ticker-wrapper:hover {
          animation-play-state: paused;
        }
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
