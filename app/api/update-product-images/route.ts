import { NextRequest, NextResponse } from "next/server";
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

  return NextResponse.json({ ok: true, results });
}
