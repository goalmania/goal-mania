"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { logoFor } from "@/lib/teamLogos";

const TEAMS = ["Inter", "Milan", "Juventus", "Napoli", "Roma", "Real Madrid", "Barcellona", "PSG", "Bayern", "Liverpool", "Manchester United", "Brasile"];
const SEG = 360 / TEAMS.length;
const COLORS = ["#c8f000", "#16161a", "#f3f0e7", "#26262b"];

// La ruota: un gioco per capire il bello della sorpresa. Non decide la maglia: la scelta vera la facciamo noi nel magazzino.
// Se esce una squadra che non vuoi, con un tocco la escludi dalla tua box.
export default function MysteryWheel({ onExclude, excluded }: { onExclude: (team: string) => void; excluded: string[] }) {
  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [hit, setHit] = useState<string | null>(null);
  const cur = useRef(0);

  const spin = () => {
    if (spinning) return;
    setHit(null);
    setSpinning(true);
    const extra = 360 * 5 + Math.floor(Math.random() * 360);
    cur.current += extra;
    setRot(cur.current);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      const idx = Math.floor((((360 - (cur.current % 360)) % 360)) / SEG) % TEAMS.length;
      setHit(TEAMS[idx]);
      setSpinning(false);
    }, reduce ? 50 : 4600);
  };

  const background = `conic-gradient(${TEAMS.map((_, i) => `${COLORS[i % 4]} ${i * SEG}deg ${(i + 1) * SEG}deg`).join(",")})`;
  return (
    <div className="mx-auto w-[min(86vw,400px)]">
      <div className="relative aspect-square">
        <span className="absolute left-1/2 top-[-10px] z-20 h-0 w-0 -translate-x-1/2 border-x-[16px] border-t-[28px] border-x-transparent border-t-[var(--red)] drop-shadow-lg" aria-hidden="true" />
        <div
          className="absolute inset-0 rounded-full shadow-[0_0_0_6px_#0a0a0a,0_0_0_9px_var(--lime),0_30px_50px_-20px_rgba(0,0,0,0.9)]"
          style={{ background, transform: `rotate(${rot}deg)`, transition: spinning ? "transform 4.5s cubic-bezier(0.12, 0.72, 0.12, 1)" : "none" }}
          aria-hidden="true"
        >
          {TEAMS.map((t, i) => {
            const a = i * SEG + SEG / 2;
            const x = 50 + 36 * Math.sin((a * Math.PI) / 180);
            const y = 50 - 36 * Math.cos((a * Math.PI) / 180);
            const lg = logoFor(t);
            return lg ? (
              <span key={t} className="absolute flex h-[15%] w-[15%] items-center justify-center rounded-full bg-[var(--paper)]" style={{ left: `${x}%`, top: `${y}%`, transform: `translate(-50%,-50%) rotate(${a}deg)` }}>
                <Image src={lg} alt="" width={48} height={48} className="h-[74%] w-[74%] object-contain" draggable={false} />
              </span>
            ) : null;
          })}
        </div>
        <button type="button" onClick={spin} disabled={spinning} aria-label="Gira la ruota" className="btn btn-lime absolute left-1/2 top-1/2 z-10 !h-[86px] !w-[86px] -translate-x-1/2 -translate-y-1/2 !rounded-full !p-0 !text-[22px] shadow-[0_0_0_6px_#0a0a0a] disabled:opacity-90">
          {spinning ? "…" : "GIRA"}
        </button>
      </div>

      <div className="mt-6 min-h-[92px] text-center" aria-live="polite">
        {hit ? (
          <>
            <p className="text-[18px] font-bold text-white">È uscito: <span className="text-[var(--lime)]">{hit}</span></p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              {excluded.includes(hit) ? (
                <span className="rounded-full bg-[var(--red)] px-4 py-2 text-[15px] font-bold text-white">{hit} è escluso dalla tua box</span>
              ) : (
                <button type="button" onClick={() => onExclude(hit)} className="btn btn-glass !h-11 !px-5 !text-[17px]">Non la voglio: escludi {hit}</button>
              )}
              <button type="button" onClick={spin} className="btn btn-ghost !h-11 !px-5 !text-[17px]">Gira ancora</button>
            </div>
          </>
        ) : (
          <p className="mx-auto max-w-[34ch] text-[15px] italic text-[var(--text-3)]">È solo un gioco: la maglia viene scelta a caso dal catalogo. Se esce una squadra che non vuoi, la escludi con un tocco.</p>
        )}
      </div>
    </div>
  );
}
