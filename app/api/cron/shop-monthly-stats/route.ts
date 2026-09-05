import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

// GET /api/cron/shop-monthly-stats — numeri reali dello shop per il mese
// corrente (ordini, revenue, AOV), letti da Mongo. Pensato per essere
// richiamato dal Secondo Cervello (cruscotto personale) per aggiornare
// da solo la riga mensile di Area B, invece che a mano.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const mese = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const orders = await Order.find({ createdAt: { $gte: monthStart } })
      .select("amount")
      .lean();

    const ordini = orders.length;
    const revenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const aov = ordini > 0 ? +(revenue / ordini).toFixed(2) : 0;

    return NextResponse.json({ mese, ordini, revenue: +revenue.toFixed(2), aov });
  } catch (err) {
    console.error("[cron/shop-monthly-stats]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
