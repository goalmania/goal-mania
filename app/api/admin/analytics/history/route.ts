import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { FunnelEvent, ProductView } from "@/lib/models/Analytics";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const days = Math.min(parseInt(searchParams.get("days") ?? "30"), 30);

    await connectDB();

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [dailyFunnel, topProducts, totalsByEvent] = await Promise.all([
      // Daily funnel breakdown
      FunnelEvent.aggregate([
        { $match: { timestamp: { $gte: since } } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
              event: "$event",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]),

      // Top products (all time from ProductView)
      ProductView.aggregate([
        { $match: { date: { $gte: since } } },
        {
          $group: {
            _id: "$productId",
            slug: { $first: "$slug" },
            title: { $first: "$title" },
            image: { $first: "$image" },
            views: { $sum: "$views" },
            addToCartCount: { $sum: "$addToCartCount" },
            purchaseCount: { $sum: "$purchaseCount" },
          },
        },
        { $sort: { views: -1 } },
        { $limit: 10 },
      ]),

      // Totals per event type
      FunnelEvent.aggregate([
        { $match: { timestamp: { $gte: since } } },
        { $group: { _id: "$event", count: { $sum: 1 } } },
      ]),
    ]);

    // Build date map
    const dateMap: Record<string, Record<string, number>> = {};
    for (const row of dailyFunnel) {
      const { date, event } = row._id as { date: string; event: string };
      if (!dateMap[date]) dateMap[date] = {};
      dateMap[date][event] = row.count;
    }

    const chartData = Object.entries(dateMap)
      .map(([date, events]) => ({
        date,
        product_view: events["product_view"] ?? 0,
        add_to_cart: events["add_to_cart"] ?? 0,
        checkout_start: events["checkout_start"] ?? 0,
        purchase: events["purchase"] ?? 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalsMap: Record<string, number> = {};
    for (const t of totalsByEvent) totalsMap[t._id as string] = t.count;

    const pv = totalsMap["product_view"] ?? 0;
    const atc = totalsMap["add_to_cart"] ?? 0;
    const cs = totalsMap["checkout_start"] ?? 0;
    const pur = totalsMap["purchase"] ?? 0;

    return NextResponse.json({
      days,
      chartData,
      totals: {
        product_view: pv,
        add_to_cart: atc,
        checkout_start: cs,
        purchase: pur,
        atc_rate: pv > 0 ? +((atc / pv) * 100).toFixed(1) : 0,
        checkout_rate: atc > 0 ? +((cs / atc) * 100).toFixed(1) : 0,
        close_rate: cs > 0 ? +((pur / cs) * 100).toFixed(1) : 0,
        conversion_rate: pv > 0 ? +((pur / pv) * 100).toFixed(2) : 0,
      },
      topProducts: topProducts.map((p) => ({
        productId: p._id,
        slug: p.slug,
        title: p.title,
        image: p.image,
        views: p.views,
        addToCartCount: p.addToCartCount,
        purchaseCount: p.purchaseCount,
        atcRate: p.views > 0 ? +((p.addToCartCount / p.views) * 100).toFixed(1) : 0,
      })),
    });
  } catch (err) {
    console.error("[analytics/history]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
