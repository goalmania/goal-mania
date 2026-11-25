import { unstable_cache } from "next/cache";
import connectDB from "@/lib/db";
import ProductModel from "@/lib/models/Product";
import { ERAS, toItem, eraOf, teamOf, isLegend, hasPhoto, isNational, worldCupItems, plainName, type ArchiveItem } from "@/lib/archive";
import { WORLD_CUPS } from "@/lib/eraTheme";
import { ERA_COVERS } from "@/lib/eraPick";
import { isShowable } from "@/lib/photoFix";
import { CLUBS, LEAGUES, clubOfTitle, type League } from "@/lib/clubs";
import { retroNationOf, retroFlag } from "@/lib/nations";

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Una sola lettura dal database ogni 5 minuti, condivisa da tutte le pagine retro: niente attese alla prima visita.
// Se il database non risponde la funzione lancia, così il vuoto non finisce in cache.
const readAll = unstable_cache(
  async (): Promise<ArchiveItem[]> => {
    await connectDB();
    const docs = await ProductModel.find({ category: "Retro", isActive: true })
      .select({ title: 1, slug: 1, basePrice: 1, retroPrice: 1, isRetro: 1, category: 1, feature: 1, images: { $slice: 1 } })
      .sort({ feature: -1, createdAt: -1 })
      .lean();
    const all: ArchiveItem[] = JSON.parse(JSON.stringify(docs)).map(toItem);
    // Solo maglie con una foto vera: via i segnaposto col vecchio logo e le foto con persone
    return all.filter((it) => hasPhoto(it.image) && isShowable(it.id, it.image));
  },
  ["archive-items-v3"],
  { revalidate: 300, tags: ["archive"] },
);

// Una maglia sola per squadra, stagione e modello: le varianti con il nome di un giocatore (Messi, Kaka...) si fondono con quella senza nome
function dedupe(all: ArchiveItem[]): ArchiveItem[] {
  const key = (n: string) => n.toLowerCase().replace(/\bac milan\b/g, "milan").replace(/\bbarcelona\b/g, "barcellona").replace(/\bf\.?c\.? /g, "").replace(/[^\p{L}\d/]+/gu, " ").trim();
  const groups = new Map<string, ArchiveItem[]>();
  for (const it of all) {
    const k = key(plainName(it.name));
    groups.set(k, [...(groups.get(k) || []), it]);
  }
  return [...groups.values()].map((g) => {
    const cover = new Set(Object.values(ERA_COVERS).flat());
    const rep = g.find((it) => cover.has(it.id)) || g.find((it) => plainName(it.name) === it.name.replace(/\s{2,}/g, " ").trim()) || g[0];
    return { ...rep, name: plainName(rep.name) };
  });
}

// Tutte le maglie retro, comprese quelle con il nome di un giocatore (serve alla sezione Leggende)
export async function getArchiveItemsRaw(): Promise<ArchiveItem[]> {
  try {
    return await readAll();
  } catch {
    return [];
  }
}

export async function getArchiveItems(): Promise<ArchiveItem[]> {
  return dedupe(await getArchiveItemsRaw());
}

export function topTeams(items: ArchiveItem[], n = 30) {
  const m = new Map<string, number>();
  for (const it of items) {
    const t = teamOf(it.name);
    if (t) m.set(t, (m.get(t) || 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([name, count]) => ({ name, count, slug: `squadra-${slugify(name)}` }));
}

export interface TeamChip {
  key: string;
  name: string;
  count: number;
  href: string;
  logo?: string; // stemma del club
  flag?: string; // bandiera della nazionale
}
export interface TeamSection {
  id: string;
  label: string;
  teams: TeamChip[];
}

// Le squadre dell'archivio divise come in negozio: campionati, altri club e nazionali, ognuna col suo stemma o la sua bandiera
export function archiveTeamSections(items: ArchiveItem[]): TeamSection[] {
  const clubs = new Map<string, TeamChip & { league: League }>();
  const others = new Map<string, TeamChip>();
  const nations = new Map<string, TeamChip>();
  for (const it of items) {
    const nat = isNational(it.name) ? retroNationOf(it.name) : null;
    if (nat) {
      const k = slugify(nat.name);
      const e = nations.get(k) || { key: k, name: nat.name, count: 0, href: `/archivio/nazione-${k}`, flag: retroFlag(nat.name, nat.iso) };
      e.count++;
      nations.set(k, e);
      continue;
    }
    const c = clubOfTitle(it.name);
    if (c) {
      const e = clubs.get(c.slug) || { key: c.slug, name: c.name, count: 0, href: `/archivio/club-${c.slug}`, logo: c.logo, league: c.league };
      e.count++;
      clubs.set(c.slug, e);
      continue;
    }
    const t = teamOf(it.name);
    if (!t) continue;
    const e = others.get(t) || { key: t, name: t, count: 0, href: `/archivio/squadra-${slugify(t)}` };
    e.count++;
    others.set(t, e);
  }
  const byCount = (a: TeamChip, b: TeamChip) => b.count - a.count || a.name.localeCompare(b.name, "it");
  const out: TeamSection[] = LEAGUES.filter((l) => l.id !== "altre").map((l) => ({ id: l.id, label: l.label, teams: [...clubs.values()].filter((c) => c.league === l.id).sort(byCount) }));
  // Club senza campionato nel nostro elenco (Flamengo, Celtic, Boca...): quelli con almeno 3 maglie
  const rest = [...clubs.values()].filter((c) => c.league === "altre").concat([...others.values()].filter((o) => o.count >= 3).map((o) => ({ ...o, league: "altre" as League }))).sort(byCount);
  out.push({ id: "altri", label: "Altri club", teams: rest });
  out.push({ id: "nazionali", label: "Nazionali", teams: [...nations.values()].sort(byCount) });
  return out.filter((s) => s.teams.length > 0);
}

// Anni di Mondiale per cui in archivio ci sono davvero maglie delle nazionali
export function worldCupYearsWithJerseys(items: ArchiveItem[]) {
  return Object.keys(WORLD_CUPS).map(Number).sort((a, b) => a - b).filter((y) => worldCupItems(items, y).length > 0);
}

export function groupItems(items: ArchiveItem[], slug: string): { title: string; text: string; list: ArchiveItem[] } | null {
  const era = ERAS.find((e) => e.slug === slug);
  if (era) return { title: era.label, text: era.blurb, list: items.filter((it) => eraOf(it.year)?.slug === era.slug) };
  if (slug === "leggende") return { title: "Leggende", text: "Le maglie dei giocatori che hanno fatto la storia: nome in evidenza, stagione giusta.", list: items.filter((it) => isLegend(it.name)) };
  if (slug.startsWith("mondiale-")) {
    const year = Number(slug.slice(9));
    const cup = WORLD_CUPS[year];
    const list = cup ? worldCupItems(items, year) : [];
    if (!cup || !list.length) return null;
    return { title: `Mondiale ${year}`, text: `Le maglie delle nazionali del Mondiale ${year} (${cup.host}). Lo ha vinto: ${cup.winner}.`, list };
  }
  if (slug.startsWith("club-")) {
    const c = CLUBS.find((x) => x.slug === slug.slice(5));
    const list = c ? items.filter((it) => !isNational(it.name) && clubOfTitle(it.name)?.slug === c.slug) : [];
    if (!c || !list.length) return null;
    return { title: c.name, text: `Tutte le maglie retro ${c.name}: ${list.length} in archivio.`, list };
  }
  if (slug.startsWith("nazione-")) {
    const list = items.filter((it) => isNational(it.name) && retroNationOf(it.name) && slugify(retroNationOf(it.name)!.name) === slug.slice(8));
    if (!list.length) return null;
    return { title: retroNationOf(list[0].name)!.name, text: `Tutte le maglie retro della nazionale: ${list.length} in archivio.`, list };
  }
  if (slug.startsWith("squadra-")) {
    const list = items.filter((it) => `squadra-${slugify(teamOf(it.name))}` === slug);
    if (!list.length) return null;
    return { title: teamOf(list[0].name), text: `Tutte le maglie retro: ${list.length} in archivio.`, list };
  }
  return null;
}
