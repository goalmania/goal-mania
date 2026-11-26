"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/ui/ProductCard";
import { useBackMemory, useRememberedState } from "@/lib/hooks/useListMemory";
import { teamOf, type ArchiveItem } from "@/lib/archive";

const STEP = 24;

// Maglie 24 alla volta + filtro per squadra: la pagina resta leggera anche con 270 maglie
export default function ArchiveGrid({ items, filterTeams = false, themed = false }: { items: ArchiveItem[]; filterTeams?: boolean; themed?: boolean }) {
  const [n, setN] = useRememberedState("n", STEP);
  const [team, setTeam] = useRememberedState("team", "");
  const [q, setQ] = useRememberedState("q", "");
  useBackMemory();
  const teams = useMemo(() => {
    if (!filterTeams) return [];
    const m = new Map<string, number>();
    for (const it of items) m.set(teamOf(it.name), (m.get(teamOf(it.name)) || 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14);
  }, [items, filterTeams]);
  const byTeam = team ? items.filter((it) => teamOf(it.name) === team) : items;
  const qq = q.trim().toLowerCase();
  const list = qq ? byTeam.filter((it) => it.name.toLowerCase().includes(qq)) : byTeam;
  const pick = (t: string) => { setTeam(t); setN(STEP); };

  return (
    <div className="mx-auto w-full max-w-[1760px] px-5 pb-16 pt-8 md:px-10 lg:px-16">
      {items.length > 12 && (
        <label className="mb-5 flex h-12 max-w-[420px] items-center rounded-full px-5 shadow-[inset_0_0_0_1.5px_var(--e-line,rgba(244,242,234,0.3))]">
          <span className="sr-only">Cerca una maglia</span>
          <input value={q} onChange={(e) => { setQ(e.target.value); setN(STEP); }} type="search" placeholder="Cerca una squadra, un giocatore o un anno" className="h-full w-full bg-transparent text-[16px] outline-none placeholder:opacity-60" />
        </label>
      )}
      {teams.length > 1 && (
        <div className="mb-8 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] md:flex-wrap" role="group" aria-label="Filtra per squadra">
          <button type="button" className="era-chip shrink-0" aria-pressed={team === ""} onClick={() => pick("")}>Tutte <span className="num text-[16px] opacity-70">{items.length}</span></button>
          {teams.map(([t, c]) => (
            <button key={t} type="button" className="era-chip shrink-0" aria-pressed={team === t} onClick={() => pick(t)}>
              {t} <span className="num text-[16px] opacity-70">{c}</span>
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-7 lg:grid-cols-4 2xl:grid-cols-5">
        {list.slice(0, n).map((p, i) => (
          <ProductCard key={p.id} id={p.id} slug={p.slug} name={p.name} price={p.price} image={p.image} category="Retro" team={p.year ? String(p.year) : "Retro"} priority={i < 4} />
        ))}
      </div>
      {list.length === 0 && <p className="py-10 text-[18px] italic opacity-80">Nessuna maglia trovata: prova con un altro nome.</p>}
      {n < list.length && (
        <div className="mt-12 flex justify-center">
          <button onClick={() => setN((v) => v + STEP)} className={themed ? "era-btn" : "btn btn-lime"}>
            Mostra altre {Math.min(STEP, list.length - n)} maglie
          </button>
        </div>
      )}
    </div>
  );
}
