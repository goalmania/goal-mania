"use client";

import { useState } from "react";
import Link from "next/link";

const ROW_ONE = [
  { name: "Inter",       flag: "🇮🇹", color: "#5f73d6", href: "/international/serieA" },
  { name: "Milan",       flag: "🇮🇹", color: "#C20B12", href: "/international/serieA" },
  { name: "Juventus",   flag: "🇮🇹", color: "#f5f5f5", href: "/international/serieA" },
  { name: "Napoli",     flag: "🇮🇹", color: "#4fa0d0", href: "/international/serieA" },
  { name: "Liverpool",  flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "#C8102E", href: "/international/premierLeague" },
  { name: "Arsenal",    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "#EF0107", href: "/international/premierLeague" },
  { name: "Man City",   flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "#6CABDD", href: "/international/premierLeague" },
  { name: "Chelsea",    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "#4a7fc1", href: "/international/premierLeague" },
  { name: "Real Madrid",flag: "🇪🇸", color: "#FEBE10", href: "/international/laliga" },
  { name: "Barcelona",  flag: "🇪🇸", color: "#c8496e", href: "/international/laliga" },
  { name: "Atletico",   flag: "🇪🇸", color: "#CE3524", href: "/international/laliga" },
  { name: "PSG",        flag: "🇫🇷", color: "#4a7fc1", href: "/international/ligue1" },
];

const ROW_TWO = [
  { name: "Bayern",     flag: "🇩🇪", color: "#DC052D", href: "/international/bundesliga" },
  { name: "Dortmund",   flag: "🇩🇪", color: "#FDE100", href: "/international/bundesliga" },
  { name: "Ajax",       flag: "🇳🇱", color: "#D2122E", href: "/international/other" },
  { name: "Roma",       flag: "🇮🇹", color: "#d47070", href: "/international/serieA" },
  { name: "Lazio",      flag: "🇮🇹", color: "#87CEEB", href: "/international/serieA" },
  { name: "Atalanta",   flag: "🇮🇹", color: "#5a83c8", href: "/international/serieA" },
  { name: "Tottenham",  flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "#f5f5f5", href: "/international/premierLeague" },
  { name: "Newcastle",  flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "#888",    href: "/international/premierLeague" },
  { name: "Brazil",     flag: "🇧🇷", color: "#FDD116", href: "/shop/worldcup" },
  { name: "Argentina",  flag: "🇦🇷", color: "#74ACDF", href: "/shop/worldcup" },
  { name: "France",     flag: "🇫🇷", color: "#002395", href: "/shop/worldcup" },
  { name: "Portugal",   flag: "🇵🇹", color: "#006600", href: "/shop/worldcup" },
];

function TeamBadge({
  name,
  flag,
  color,
  href,
  paused,
}: {
  name: string;
  flag: string;
  color: string;
  href: string;
  paused: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 mx-3 px-5 py-2.5 rounded-full whitespace-nowrap shrink-0 cursor-pointer"
      style={{
        border: hovered
          ? "1px solid rgba(200,240,0,0.4)"
          : "1px solid rgba(255,255,255,0.08)",
        background: hovered
          ? "rgba(200,240,0,0.08)"
          : "rgba(255,255,255,0.02)",
        transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        transform: hovered ? "translateY(-3px) scale(1.06)" : "none",
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.35)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        className="text-lg leading-none transition-all duration-300"
        style={{ filter: hovered ? "drop-shadow(0 0 6px rgba(200,240,0,0.5))" : "none" }}
      >
        {flag}
      </span>
      <span
        className="text-xs font-black uppercase tracking-widest transition-all duration-300"
        style={{
          fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
          color: hovered ? "#c8f000" : color,
          letterSpacing: "2px",
        }}
      >
        {name}
      </span>
    </Link>
  );
}

function TickerRow({
  teams,
  direction,
  paused,
}: {
  teams: typeof ROW_ONE;
  direction: "left" | "right";
  paused: boolean;
}) {
  // Triplicate for seamless loop
  const tripled = [...teams, ...teams, ...teams];

  return (
    <div className="overflow-hidden">
      <div
        className={direction === "left" ? "animate-ticker-left flex" : "animate-ticker-right flex"}
        style={{
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {tripled.map((team, i) => (
          <TeamBadge key={`${team.name}-${i}`} {...team} paused={paused} />
        ))}
      </div>
    </div>
  );
}

export default function TeamLogoTicker() {
  const [paused, setPaused] = useState(false);

  return (
    <div
      className="py-8 space-y-3 overflow-hidden relative select-none"
      style={{
        background: "#0a0a0a",
        borderTop: "0.5px solid rgba(200,240,0,0.1)",
        borderBottom: "0.5px solid rgba(200,240,0,0.1)",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Gradient fade edges */}
      <div
        className="absolute inset-y-0 left-0 w-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, #0a0a0a, transparent)" }}
      />
      <div
        className="absolute inset-y-0 right-0 w-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, #0a0a0a, transparent)" }}
      />

      {/* Section label */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <span className="w-5 h-[1.5px] rounded-full inline-block" style={{ background: "#c8f000" }} />
        <span
          className="text-[10px] uppercase tracking-[4px]"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.7)" }}
        >
          // Le Squadre
        </span>
        <span className="w-5 h-[1.5px] rounded-full inline-block" style={{ background: "#c8f000" }} />
      </div>

      <TickerRow teams={ROW_ONE} direction="left" paused={paused} />
      <TickerRow teams={ROW_TWO} direction="right" paused={paused} />
    </div>
  );
}
