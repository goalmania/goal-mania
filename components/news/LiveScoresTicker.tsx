"use client";

import React, { useEffect, useState } from "react";

interface MatchData {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  minute: number | null;
  league: string;
}

const LIVE_STATUSES = new Set(["1H", "2H", "ET", "P"]);
const HT_STATUSES  = new Set(["HT"]);
const FT_STATUSES  = new Set(["FT", "AET", "PEN"]);

function statusLabel(m: MatchData): { text: string; color: string; pulse: boolean } {
  if (LIVE_STATUSES.has(m.status)) {
    return { text: m.minute ? `${m.minute}'` : "LIVE", color: "#ff3333", pulse: true };
  }
  if (HT_STATUSES.has(m.status)) {
    return { text: "HT", color: "#c8f000", pulse: false };
  }
  if (FT_STATUSES.has(m.status)) {
    return { text: "FT", color: "rgba(255,255,255,0.3)", pulse: false };
  }
  // NS — not started, show time
  return { text: m.status, color: "rgba(255,255,255,0.25)", pulse: false };
}

function MatchCard({ match }: { match: MatchData }) {
  const { text, color, pulse } = statusLabel(match);
  const isLive = LIVE_STATUSES.has(match.status);
  const hasScore = match.homeScore !== null && match.awayScore !== null;

  return (
    <div
      className="flex-shrink-0 flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl"
      style={{
        background: isLive ? "rgba(255,51,51,0.08)" : "rgba(255,255,255,0.03)",
        border: isLive ? "1px solid rgba(255,51,51,0.2)" : "1px solid rgba(255,255,255,0.07)",
        minWidth: "152px",
      }}
    >
      {/* Status */}
      <div className="flex items-center gap-1.5">
        {pulse && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />}
        <span className="text-[9px] font-black uppercase tracking-[2px]" style={{ fontFamily: "var(--font-mono, monospace)", color }}>
          {text}
        </span>
      </div>

      {/* Scoreline */}
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] font-black uppercase truncate max-w-[48px]"
          style={{ fontFamily: "var(--font-display, sans-serif)", color: "#f5f5f5", letterSpacing: "0.5px" }}
        >
          {match.homeTeam.replace(/^(AC |FC |SS |AS |US |CF )/, "")}
        </span>
        <span
          className="text-base font-black tabular-nums px-2 py-0.5 rounded-lg"
          style={{ fontFamily: "var(--font-display, sans-serif)", color: "#c8f000", background: "rgba(200,240,0,0.08)", lineHeight: 1 }}
        >
          {hasScore ? `${match.homeScore}–${match.awayScore}` : "– –"}
        </span>
        <span
          className="text-[11px] font-black uppercase truncate max-w-[48px]"
          style={{ fontFamily: "var(--font-display, sans-serif)", color: "#f5f5f5", letterSpacing: "0.5px" }}
        >
          {match.awayTeam.replace(/^(AC |FC |SS |AS |US |CF )/, "")}
        </span>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 rounded-xl animate-pulse" style={{ minWidth: "152px", height: "52px", background: "rgba(255,255,255,0.04)" }} />
  );
}

export default function LiveScoresTicker() {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await fetch("/api/football/today-matches", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.matches) && data.matches.length > 0) {
        setMatches(data.matches);
      }
    } catch {
      // silently ignore — ticker is decorative
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Poll every 90s — server cache handles rate limiting
    const id = setInterval(load, 90_000);
    return () => clearInterval(id);
  }, []);

  if (!loading && matches.length === 0) return null;

  return (
    <div
      className="w-full overflow-x-auto flex items-center gap-3 px-4 py-2 scrollbar-hide"
      style={{ background: "#0d0d0d", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      {/* Label */}
      <div className="flex-shrink-0 flex items-center gap-2 pr-3" style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}>
        <span className="text-[9px] font-black uppercase tracking-[3px] whitespace-nowrap" style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.4)" }}>
          Risultati
        </span>
      </div>

      {/* Cards */}
      <div className="flex items-center gap-3 pb-0.5">
        {loading
          ? [1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)
          : matches.map((m) => <MatchCard key={m.id} match={m} />)
        }
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
