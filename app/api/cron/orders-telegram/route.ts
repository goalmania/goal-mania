import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { sendSupplierTelegramOnce } from "@/lib/supplier";

export const runtime = "nodejs";
export const maxDuration = 60;

// Ripasso: manda su Telegram gli ordini pagati che non sono ancora stati inviati (per esempio quelli arrivati prima di questa funzione o con Telegram in errore).
// Parte da sola ogni giorno e manda ogni ordine una volta sola.
const FROM = new Date("2026-11-24T00:00:00+01:00");

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  if (!(isVercelCron || (cronSecret && authHeader === `Bearer ${cronSecret}`))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const orders = await Order.find({ createdAt: { $gte: FROM }, paymentIntentId: { $exists: true, $nin: [null, ""] }, supplierSentAt: { $exists: false } }).sort({ createdAt: 1 }).limit(20).lean<any[]>();
  const results: { id: string; ok: boolean; error?: string }[] = [];
  for (const o of orders) {
    const r = await sendSupplierTelegramOnce(o);
    results.push({ id: String(o._id).slice(-6), ok: r.ok, error: r.error?.slice(0, 120) });
  }
  return NextResponse.json({ found: orders.length, sent: results.filter((r) => r.ok).length, results });
}
