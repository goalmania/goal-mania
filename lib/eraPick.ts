import { ERAS, eraOf, hasPhoto, isLegend, isNational, teamOf, worldCupItems, type ArchiveItem } from "@/lib/archive";
import { ERA_THEME } from "@/lib/eraTheme";
import { RETRO_WEAK_IMAGES } from "@/lib/data/retroWeakImages";

// Copertine scelte a mano guardando le foto: maglie iconiche con scatto pulito, sfondo neutro e maglia intera
const ERA_COVERS: Record<string, string[]> = {
  "anni-70": ["6a92efcae8f6d971b8e0e5fd", "6a92efbae8f6d971b8e0e552", "6a92efcae8f6d971b8e0e5ff"],
  "anni-80": ["6a92efc7e8f6d971b8e0e5db", "6a92efb6e8f6d971b8e0e52e", "6a92efb5e8f6d971b8e0e51c"],
  "anni-90": ["6a92efe6e8f6d971b8e0e72a", "6a92efe3e8f6d971b8e0e70e", "6a92efd5e8f6d971b8e0e66f"],
  "anni-2000": ["6a92efd1e8f6d971b8e0e645", "6a92efdae8f6d971b8e0e6ac", "6a92efd5e8f6d971b8e0e673"],
  "anni-2010": ["6a92efd7e8f6d971b8e0e68b", "6a92efc2e8f6d971b8e0e5ab", "6a92efd7e8f6d971b8e0e689"],
  "oggi": ["6a92efb5e8f6d971b8e0e524", "6a92efd7e8f6d971b8e0e68d", "6a92efcbe8f6d971b8e0e60b"],
};

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
  for (const id of ERA_COVERS[slug] || []) {
    const it = items.find((x) => x.id === id);
    if (!it) continue;
    seen.add(teamOf(it.name));
    out.push(it);
  }
  if (out.length >= n) return out.slice(0, n);
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
