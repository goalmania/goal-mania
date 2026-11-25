import { NextRequest, NextResponse } from "next/server";
import { sendPendingSupplierOrders } from "@/lib/supplier";

export const runtime = "nodejs";
export const maxDuration = 60;

// Ripasso: manda su Telegram gli ordini pagati che non sono ancora stati inviati (per esempio quelli arrivati prima di questa funzione o con Telegram in errore).
// Parte da sola ogni giorno e manda ogni ordine una volta sola.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  if (!(isVercelCron || (cronSecret && authHeader === `Bearer ${cronSecret}`))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json(await sendPendingSupplierOrders(20, req.nextUrl.searchParams.get("rimanda") === "1"));
}
