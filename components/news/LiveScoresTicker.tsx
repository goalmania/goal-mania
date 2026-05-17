"use client";

import React from "react";

interface MatchData {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: "FT" | "HT" | "LIVE";
  minute?: number;
}

const MATCHES: MatchData[] = [
  { homeTeam: "Napoli", awayTeam: "Milan", homeScore: 2, awayScore: 1, status: "FT" },
  { homeTeam: "Inter", awayTeam: "Juventus", homeScore: 3, awayScore: 0, status: "FT" },
  { homeTeam: "Roma", awayTeam: "Lazio", homeScore: 1, awayScore: 1, status: "LIVE", minute: 75 },
  { homeTeam: "Real Madrid", awayTeam: "Barcelona", homeScore: 2, awayScore: 0, status: "HT" },
  { homeTeam: "PSG", awayTeam: "Monaco", homeScore: 1, awayScore: 2, status: "FT" },
  { homeTeam: "Bayern", awayTeam: "Dortmund", homeScore: 2, awayScore: 2, status: "LIVE", minute: 62 },
];

function MatchCard({ match }: { match: MatchData }) {
  const isLive = match.status === "LIVE";
  return (
    <div
      className="flex-shrink-0 flex flex-col items-center justify-center gap-1 px-5 py-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105"
      style={{
        background: isLive ? "rgba(255,51,51,0.08)" : "rgba(255,255,255,0.04)",
        border: isLive ? "1px solid rgba(255,51,51,0.2)" : "1px solid rgba(255,255,255,0.08)",
        minWidth: "160px",
      }}
    >
      {/* Status badge */}
      <div className="flex items-center gap-1.5">
        {isLive && (
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "#ff3333" }}
          />
        )}
        <span
          className="text-[9px] font-black uppercase tracking-[2px]"
          style={{
            fontFamily: "var(--font-mono, monospace)",
            color: isLive ? "#ff3333" : match.status === "HT" ? "#c8f000" : "rgba(255,255,255,0.3)",
          }}
        >
          {isLive ? `${match.minute}'` : match.status}
        </span>
      </div>

      {/* Scoreline */}
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-black uppercase truncate max-w-[52px]"
          style={{ fontFamily: "var(--font-display, sans-serif)", color: "#f5f5f5", letterSpacing: "0.5px" }}
        >
          {match.homeTeam}
        </span>
        <span
          className="text-lg font-black tabular-nums px-2 py-0.5 rounded-lg"
          style={{
            fontFamily: "var(--font-display, sans-serif)",
            color: "#c8f000",
            background: "rgba(200,240,0,0.08)",
            lineHeight: 1,
          }}
        >
          {match.homeScore}–{match.awayScore}
        </span>
        <span
          className="text-xs font-black uppercase truncate max-w-[52px]"
          style={{ fontFamily: "var(--font-display, sans-serif)", color: "#f5f5f5", letterSpacing: "0.5px" }}
        >
          {match.awayTeam}
        </span>
      </div>
    </div>
  );
}

export default function LiveScoresTicker() {
  return (
    <div
      className="w-full overflow-x-auto flex items-center gap-3 px-4 py-2 scrollbar-hide"
      style={{ background: "#0d0d0d", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      {/* Label */}
      <div className="flex-shrink-0 flex items-center gap-2 pr-3" style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}>
        <span
          className="text-[9px] font-black uppercase tracking-[3px] whitespace-nowrap"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.4)" }}
        >
          Risultati
        </span>
      </div>

      {/* Match cards */}
      <div className="flex items-center gap-3 pb-0.5">
        {MATCHES.map((match, i) => (
          <MatchCard key={i} match={match} />
        ))}
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
