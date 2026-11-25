import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { CLUBS, clubOfTitle, type Club } from "@/lib/clubs";
import { WC_NATIONS } from "@/lib/nations";
import { isShowable } from "@/lib/photoFix";

export interface ClubCount extends Club {
  current: number;
  retro: number;
}

// Quante maglie ha davvero ogni squadra (attuali e retro): le squadre senza maglie non compaiono
export async function getClubCounts(): Promise<ClubCount[]> {
  try {
    await connectDB();
    const rows = await Product.find({ isActive: true, isMysteryBox: { $ne: true }, isWorldCup: { $ne: true } }).select({ title: 1, isRetro: 1, category: 1, images: { $slice: 1 } }).lean<any[]>();
    const m = new Map<string, { current: number; retro: number }>();
    for (const r of rows) {
      if (!isShowable(String(r._id), r.images?.[0])) continue;
      const c = clubOfTitle(r.title || "");
      if (!c) continue;
      const e = m.get(c.slug) || { current: 0, retro: 0 };
      if (r.isRetro || /retro/i.test(r.category || "")) e.retro++;
      else e.current++;
      m.set(c.slug, e);
    }
    return CLUBS.filter((c) => m.has(c.slug)).map((c) => ({ ...c, ...m.get(c.slug)! }));
  } catch {
    return [];
  }
}

export async function getNationCounts() {
  try {
    await connectDB();
    const rows = await Product.find({ isWorldCup: true, isActive: true }).select("country nationalTeam").lean<any[]>();
    const m = new Map<string, number>();
    for (const r of rows) {
      const k = r.country || r.nationalTeam;
      if (k && WC_NATIONS[k]) m.set(k, (m.get(k) || 0) + 1);
    }
    return [...m.entries()].map(([key, count]) => ({ key, name: WC_NATIONS[key].it, count })).sort((a, b) => a.name.localeCompare(b.name, "it"));
  } catch {
    return [];
  }
}
