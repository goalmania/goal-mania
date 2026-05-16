"use client";

const ROW_ONE = [
  { name: "Inter", flag: "🇮🇹", color: "#010E80" },
  { name: "Milan", flag: "🇮🇹", color: "#C20B12" },
  { name: "Juventus", flag: "🇮🇹", color: "#1A1A1A" },
  { name: "Napoli", flag: "🇮🇹", color: "#0B5FB5" },
  { name: "Liverpool", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "#C8102E" },
  { name: "Arsenal", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "#EF0107" },
  { name: "Man City", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "#6CABDD" },
  { name: "Chelsea", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "#034694" },
  { name: "Real Madrid", flag: "🇪🇸", color: "#FEBE10" },
  { name: "Barcelona", flag: "🇪🇸", color: "#A50044" },
];

const ROW_TWO = [
  { name: "PSG", flag: "🇫🇷", color: "#004170" },
  { name: "Bayern", flag: "🇩🇪", color: "#DC052D" },
  { name: "Dortmund", flag: "🇩🇪", color: "#FDE100" },
  { name: "Ajax", flag: "🇳🇱", color: "#D2122E" },
  { name: "Atletico", flag: "🇪🇸", color: "#CE3524" },
  { name: "Roma", flag: "🇮🇹", color: "#8B0000" },
  { name: "Lazio", flag: "🇮🇹", color: "#87CEEB" },
  { name: "Atalanta", flag: "🇮🇹", color: "#1C4BA8" },
  { name: "Tottenham", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "#132257" },
  { name: "Newcastle", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "#241F20" },
];

function TeamBadge({ name, flag, color }: { name: string; flag: string; color: string }) {
  return (
    <div className="flex items-center gap-2 mx-4 px-4 py-2 rounded-full border border-white/10 bg-white/5 whitespace-nowrap shrink-0">
      <span className="text-base leading-none">{flag}</span>
      <span
        className="text-xs font-black uppercase tracking-wider"
        style={{ color }}
      >
        {name}
      </span>
    </div>
  );
}

function TickerRow({
  teams,
  direction,
}: {
  teams: typeof ROW_ONE;
  direction: "left" | "right";
}) {
  const doubled = [...teams, ...teams];
  return (
    <div className="overflow-hidden">
      <div className={direction === "left" ? "animate-ticker-left flex" : "animate-ticker-right flex"}>
        {doubled.map((team, i) => (
          <TeamBadge key={i} {...team} />
        ))}
      </div>
    </div>
  );
}

export default function TeamLogoTicker() {
  return (
    <div className="bg-[#0e1924] py-6 space-y-3 overflow-hidden">
      <TickerRow teams={ROW_ONE} direction="left" />
      <TickerRow teams={ROW_TWO} direction="right" />
    </div>
  );
}
