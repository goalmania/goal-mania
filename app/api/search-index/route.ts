import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { isShowable } from "@/lib/photoFix";

// Indice leggero di tutte le maglie attive: il browser lo scarica una volta, e la ricerca poi e istantanea (niente attese del server).
// Formato compatto: [id, slug, titolo, prezzo, foto, categoria]
export const revalidate = 600;

export async function GET() {
  try {
    await connectDB();
    const rows = await Product.find({ isActive: true, isMysteryBox: { $ne: true } })
      .select({ title: 1, slug: 1, basePrice: 1, retroPrice: 1, isRetro: 1, category: 1, feature: 1, images: { $slice: 1 } })
      .sort({ feature: -1, createdAt: -1 })
      .lean();
    const items = (rows as any[]).filter((p) => p.slug && isShowable(String(p._id), p.images?.[0])).map((p) => [String(p._id), p.slug, p.title, Number(p.isRetro ? p.retroPrice : p.basePrice) || Number(p.basePrice) || 0, p.images?.[0] || "", p.category || ""]);
    return NextResponse.json(items, { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400" } });
  } catch {
    return NextResponse.json([], { status: 200, headers: { "Cache-Control": "no-store" } });
  }
}
