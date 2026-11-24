import { ERAS, eraOf, hasPhoto, isLegend, isNational, teamOf, worldCupItems, type ArchiveItem } from "@/lib/archive";
import { ERA_THEME } from "@/lib/eraTheme";
import { RETRO_WEAK_IMAGES } from "@/lib/data/retroWeakImages";

// Le maglie che rappresentano un'era: prima i nomi leggendari, poi gli anni dei Mondiali, una per squadra
export function pickForEra(items: ArchiveItem[], slug: string, n = 3): ArchiveItem[] {
  if (!ERAS.some((e) => e.slug === slug)) return [];
  const cups = ERA_THEME[slug]?.cups.map((c) => c.year) || [];
  const score = (it: ArchiveItem) => (isLegend(it.name) ? 2 : 0) + (it.year && cups.includes(it.year) ? 1 : 0);
  const pool = items
    .filter((it) => hasPhoto(it.image) && !RETRO_WEAK_IMAGES.has(it.id) && eraOf(it.year)?.slug === slug)
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

// Cosa c'e dentro un'era: quante maglie, le squadre piu presenti, i Mondiali di cui ci sono davvero le maglie
export function eraInfo(items: ArchiveItem[], slug: string) {
  const inEra = items.filter((it) => eraOf(it.year)?.slug === slug);
  const m = new Map<string, number>();
  for (const it of inEra) {
    if (isNational(it.name)) continue;
    const t = teamOf(it.name);
    if (t) m.set(t, (m.get(t) || 0) + 1);
  }
  const teams = [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([t]) => t);
  const cups = (ERA_THEME[slug]?.cups || [])
    .map((c) => ({ ...c, count: worldCupItems(items, c.year).length }))
    .filter((c) => c.count > 0);
  return { count: inEra.length, teams, cups };
}
