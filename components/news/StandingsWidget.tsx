import React from "react";
import Link from "next/link";

interface TeamRow {
  pos: number;
  team: string;
  pts: number;
  w: number;
  d: number;
  l: number;
  form: string; // e.g. "WWDLW"
}

const STANDINGS: TeamRow[] = [
  { pos: 1, team: "Napoli", pts: 78, w: 24, d: 6, l: 4, form: "WWWDW" },
  { pos: 2, team: "Inter", pts: 73, w: 22, d: 7, l: 5, form: "WWWWL" },
  { pos: 3, team: "Milan", pts: 65, w: 20, d: 5, l: 9, form: "WDWLW" },
  { pos: 4, team: "Juventus", pts: 62, w: 18, d: 8, l: 8, form: "DWWWD" },
  { pos: 5, team: "Roma", pts: 58, w: 17, d: 7, l: 10, form: "LWWDL" },
];

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

export default function StandingsWidget() {
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
          2024/25
        </span>
      </div>

      {/* Column headers */}
      <div
        className="grid px-5 py-2"
        style={{ gridTemplateColumns: "24px 1fr 32px 32px 32px 32px 40px" }}
      >
        {["#", "Squadra", "V", "N", "P", "Pts", "Form"].map((col) => (
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
        {STANDINGS.map((row) => {
          const isChampions = row.pos <= 4;
          return (
            <div
              key={row.pos}
              className="grid px-5 py-2.5 items-center transition-colors hover:bg-white/[0.02]"
              style={{
                gridTemplateColumns: "24px 1fr 32px 32px 32px 32px 40px",
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
                className="text-xs font-black uppercase truncate"
                style={{ fontFamily: "var(--font-display, sans-serif)", color: "#f5f5f5", letterSpacing: "0.3px" }}
              >
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
              {/* Form */}
              <div className="flex items-center justify-center gap-0.5">
                {row.form.split("").map((r, i) => (
                  <FormDot key={i} result={r} />
                ))}
              </div>
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
          href="/news"
          className="text-[9px] uppercase tracking-widest hover:text-[#c8f000] transition-colors"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.25)" }}
        >
          Classifica completa →
        </Link>
      </div>
    </div>
  );
}
