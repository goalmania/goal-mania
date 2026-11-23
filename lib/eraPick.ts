import { ERAS, eraOf, hasPhoto, isLegend, teamOf, type ArchiveItem } from "@/lib/archive";
import { ERA_THEME } from "@/lib/eraTheme";

// Le maglie che rappresentano un'era: prima i nomi leggendari, poi gli anni dei Mondiali, una per squadra
export function pickForEra(items: ArchiveItem[], slug: string, n = 3): ArchiveItem[] {
  if (!ERAS.some((e) => e.slug === slug)) return [];
  const cups = ERA_THEME[slug]?.cups.map((c) => c.year) || [];
  const score = (it: ArchiveItem) => (isLegend(it.name) ? 2 : 0) + (it.year && cups.includes(it.year) ? 1 : 0);
  const pool = items
    .filter((it) => hasPhoto(it.image) && eraOf(it.year)?.slug === slug)
    .map((it, i) => ({ it, s: score(it), i }))
    .sort((a, b) => b.s - a.s || a.i - b.i);
  const seen = new Set<string>();
  const out: ArchiveItem[] = [];
  for (const { it } of pool) {
    const t = teamOf(it.name);
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(it);
    if (out.length === n) break;
  }
  return out;
}
