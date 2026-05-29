"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface TeamRow {
  pos: number;
  team: string;
  logo?: string;
  pts: number;
  w: number;
  d: number;
  l: number;
}

function FormDot({ result }: { result: string }) {
  const color = result === "W" ? "#c8f000" : result === "D" ? "#888" : "#ff4444";
  return (
    <span
      className="w-2 h-2 rounded-full inline-block"
      style={{ background: color }}
      title={result === "W" ? "Vittoria" : result === "D" ? "Pareggio" : "Sconfitta"}
    />
  );
}

// Fallback statico aggiornato (usato solo se l'API non risponde)
const FALLBACK: TeamRow[] = [
  { pos: 1, team: "Napoli",   pts: 83, w: 26, d: 5, l: 7 },
  { pos: 2, team: "Inter",    pts: 82, w: 25, d: 7, l: 6 },
  { pos: 3, team: "Atalanta", pts: 72, w: 21, d: 9, l: 8 },
  { pos: 4, team: "Lazio",    pts: 71, w: 22, d: 5, l: 11 },
  { pos: 5, team: "Juventus", pts: 68, w: 20, d: 8, l: 10 },
];

export default function StandingsWidget() {
  const [rows, setRows] = useState<TeamRow[]>([]);
  const [season, setSeason] = useState("2024/25");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/football/standings?league=SA&season=2024")
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((data) => {
        const table = data?.standings?.[0]?.table;
        if (!table?.length) throw new Error("empty");
        const top5: TeamRow[] = table.slice(0, 5).map((t: any) => ({
          pos: t.position,
          team: t.team?.name || t.team?.shortName || "—",
          logo: t.team?.crest,
          pts: t.points,
          w:   t.won,
          d:   t.draw,
          l:   t.lost,
        }));
        setRows(top5);
        setSeason("2024/25");
      })
      .catch(() => setRows(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const display = loading ? FALLBACK : rows;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <span className="w-3 h-[2px] rounded-full" style={{ background: "#c8f000" }} />
          <span
            className="text-[10px] font-black uppercase tracking-[3px]"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "#c8f000" }}
          >
            Serie A
          </span>
        </div>
        <span
          className="text-[9px] uppercase tracking-[2px]"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.2)" }}
        >
          {season}
        </span>
      </div>

      {/* Column headers */}
      <div
        className="grid px-5 py-2"
        style={{ gridTemplateColumns: "24px 1fr 32px 32px 32px 32px" }}
      >
        {["#", "Squadra", "V", "N", "P", "Pts"].map((col) => (
          <span
            key={col}
            className="text-[9px] uppercase text-center"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.2)" }}
          >
            {col}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div className="flex flex-col">
        {display.map((row) => {
          const isChampions = row.pos <= 4;
          return (
            <div
              key={row.pos}
              className="grid px-5 py-2.5 items-center transition-colors hover:bg-white/[0.02]"
              style={{
                gridTemplateColumns: "24px 1fr 32px 32px 32px 32px",
                borderLeft: isChampions ? "2px solid #c8f000" : "2px solid transparent",
              }}
            >
              {/* Pos */}
              <span
                className="text-xs font-black text-center"
                style={{
                  fontFamily: "var(--font-display, sans-serif)",
                  color: isChampions ? "#c8f000" : "rgba(255,255,255,0.3)",
                }}
              >
                {row.pos}
              </span>
              {/* Team */}
              <span
                className="text-xs font-black uppercase truncate flex items-center gap-1.5"
                style={{ fontFamily: "var(--font-display, sans-serif)", color: "#f5f5f5", letterSpacing: "0.3px" }}
              >
                {row.logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.logo} alt="" className="w-4 h-4 object-contain flex-shrink-0" />
                )}
                {row.team}
              </span>
              {/* W/D/L */}
              {[row.w, row.d, row.l].map((val, i) => (
                <span
                  key={i}
                  className="text-xs text-center"
                  style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.4)" }}
                >
                  {val}
                </span>
              ))}
              {/* Pts */}
              <span
                className="text-sm font-black text-center"
                style={{ fontFamily: "var(--font-display, sans-serif)", color: "#c8f000" }}
              >
                {row.pts}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="px-5 py-3 border-t flex items-center justify-between"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: "#c8f000" }} />
          <span
            className="text-[9px] uppercase"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.3)" }}
          >
            Champions League
          </span>
        </div>
        <Link
          href="/serieA"
          className="text-[9px] uppercase tracking-widest hover:text-[#c8f000] transition-colors"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.25)" }}
        >
          Classifica completa →
        </Link>
      </div>
    </div>
  );
}
