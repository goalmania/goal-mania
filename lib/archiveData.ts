import { unstable_cache } from "next/cache";
import connectDB from "@/lib/db";
import ProductModel from "@/lib/models/Product";
import { ERAS, toItem, eraOf, teamOf, isLegend, hasPhoto, worldCupItems, type ArchiveItem } from "@/lib/archive";
import { WORLD_CUPS } from "@/lib/eraTheme";
import { isShowable } from "@/lib/photoFix";

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

export async function getArchiveItems(): Promise<ArchiveItem[]> {
  try {
    return await readAll();
  } catch {
    return [];
  }
}

export function topTeams(items: ArchiveItem[], n = 30) {
  const m = new Map<string, number>();
  for (const it of items) {
    const t = teamOf(it.name);
    if (t) m.set(t, (m.get(t) || 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([name, count]) => ({ name, count, slug: `squadra-${slugify(name)}` }));
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
  if (slug.startsWith("squadra-")) {
    const list = items.filter((it) => `squadra-${slugify(teamOf(it.name))}` === slug);
    if (!list.length) return null;
    return { title: teamOf(list[0].name), text: `Tutte le maglie retro: ${list.length} in archivio.`, list };
  }
  return null;
}
