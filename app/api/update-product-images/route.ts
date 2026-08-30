import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  await connectDB();

  // Attivazione bulk: { action: "activate", filter: { category: "Retro" } }
  if (body.action === "activate") {
    const filter = body.filter ?? {};
    const result = await Product.updateMany(filter, { $set: { isActive: true } });
    return NextResponse.json({ ok: true, matched: result.matchedCount, modified: result.modifiedCount });
  }

  // Disattivazione per slug: { action: "deactivate", slugs: ["slug1", "slug2"] }
  if (body.action === "deactivate") {
    const { slugs } = body as { slugs: string[] };
    if (!Array.isArray(slugs) || slugs.length === 0) {
      return NextResponse.json({ error: "slugs array required" }, { status: 400 });
    }
    const result = await Product.updateMany({ slug: { $in: slugs } }, { $set: { isActive: false } });
    revalidatePath("/shop/retro");
    revalidatePath("/shop");
    return NextResponse.json({ ok: true, matched: result.matchedCount, modified: result.modifiedCount });
  }

  // Aggiornamento immagini: { updates: Array<{ slug, images }> }
  const { updates } = body as { updates: Array<{ slug: string; images: string[] }> };
  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: "updates array required or action missing" }, { status: 400 });
  }

  const results: Array<{ slug: string; status: "ok" | "not_found" | "error"; error?: string }> = [];

  for (const { slug, images } of updates) {
    try {
      const res = await Product.updateOne({ slug }, { $set: { images } });
      if (res.matchedCount === 0) {
        results.push({ slug, status: "not_found" });
      } else {
        results.push({ slug, status: "ok" });
      }
    } catch (err) {
      results.push({ slug, status: "error", error: String(err) });
    }
  }

  revalidatePath("/shop/retro");
  revalidatePath("/shop");
  return NextResponse.json({ ok: true, results });
}
