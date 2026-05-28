"use client";

import React, { useEffect, useState } from "react";

const FALLBACK_ITEMS = [
  "Segui tutte le notizie del calcio su Goal Mania",
  "Serie A, Champions League, Calciomercato — live ogni giorno",
];

export default function BreakingNewsTicker() {
  const [items, setItems] = useState<string[]>(FALLBACK_ITEMS);

  useEffect(() => {
    fetch("/api/articles?status=published&limit=12")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        const titles: string[] = (data?.articles || [])
          .map((a: any) => a.title as string)
          .filter(Boolean);
        if (titles.length >= 3) setItems(titles);
      })
      .catch(() => {});
  }, []);

  const content = items.join(" • ");
  // duplicate for seamless loop
  const fullContent = `${content} • ${content}`;

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
        <span className="w-2 h-2 rounded-full inline-block animate-pulse" style={{ background: "#ff3333" }} />
        <span className="text-[10px] font-black uppercase tracking-[3px] whitespace-nowrap" style={{ fontFamily: "var(--font-mono, monospace)", color: "#ff3333" }}>
          BREAKING
        </span>
      </div>

      {/* Scrolling ticker */}
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <div className="ticker-wrapper flex items-center">
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
          animation: ticker-scroll 50s linear infinite;
          padding-left: 16px;
        }
        .ticker-wrapper:hover { animation-play-state: paused; }
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
