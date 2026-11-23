import connectDB from "@/lib/db";
import ProductModel from "@/lib/models/Product";
import { ERAS, toItem, eraOf, teamOf, isLegend, type ArchiveItem } from "@/lib/archive";

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Tutte le maglie retro attive, con i soli campi che servono (una foto a testa)
export async function getArchiveItems(): Promise<ArchiveItem[]> {
  try {
    await connectDB();
    const docs = await ProductModel.find({ category: "Retro", isActive: true })
      .select({ title: 1, slug: 1, basePrice: 1, retroPrice: 1, isRetro: 1, category: 1, feature: 1, images: { $slice: 1 } })
      .sort({ feature: -1, createdAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(docs)).map(toItem);
  } catch {
    return [];
  }
}

export function eraTiles(items: ArchiveItem[]) {
  return ERAS.map((e) => {
    const inEra = items.filter((it) => eraOf(it.year)?.slug === e.slug);
    const pick = inEra.find((it) => it.image) || null;
    return { slug: e.slug, label: e.label, short: e.short, count: inEra.length, image: pick?.image || "", alt: pick?.name || e.label };
  }).filter((e) => e.count > 0);
}

export function topTeams(items: ArchiveItem[], n = 30) {
  const m = new Map<string, number>();
  for (const it of items) {
    const t = teamOf(it.name);
    if (t) m.set(t, (m.get(t) || 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([name, count]) => ({ name, count, slug: `squadra-${slugify(name)}` }));
}

export function groupItems(items: ArchiveItem[], slug: string): { title: string; text: string; list: ArchiveItem[] } | null {
  const era = ERAS.find((e) => e.slug === slug);
  if (era) return { title: era.label, text: era.blurb, list: items.filter((it) => eraOf(it.year)?.slug === era.slug) };
  if (slug === "leggende") return { title: "Leggende", text: "Le maglie dei giocatori che hanno fatto la storia: nome in evidenza, stagione giusta.", list: items.filter((it) => isLegend(it.name)) };
  if (slug.startsWith("squadra-")) {
    const list = items.filter((it) => `squadra-${slugify(teamOf(it.name))}` === slug);
    if (!list.length) return null;
    return { title: teamOf(list[0].name), text: `Tutte le maglie retro: ${list.length} in archivio.`, list };
  }
  return null;
}
