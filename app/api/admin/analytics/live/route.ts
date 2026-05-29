import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { ActiveSession, FunnelEvent, ProductView } from "@/lib/models/Analytics";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const now = new Date();
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const twentyFourHAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      activeSessions,
      pageBreakdownRaw,
      activeCartsRaw,
      funnelCounts,
      topProductsRaw,
      recentEventsRaw,
    ] = await Promise.all([
      // Online now count
      ActiveSession.countDocuments({ lastSeen: { $gt: fiveMinAgo } }),

      // Page breakdown
      ActiveSession.aggregate([
        { $match: { lastSeen: { $gt: fiveMinAgo } } },
        { $group: { _id: { page: "$page", title: "$pageTitle" }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Active carts
      ActiveSession.find({
        lastSeen: { $gt: fiveMinAgo },
        cartItemCount: { $gt: 0 },
      })
        .select("sessionId page cartItemCount cartValue isCheckingOut")
        .lean(),

      // Funnel counts last 24h
      FunnelEvent.aggregate([
        { $match: { timestamp: { $gt: twentyFourHAgo } } },
        { $group: { _id: "$event", count: { $sum: 1 } } },
      ]),

      // Top products last 7 days
      ProductView.aggregate([
        { $match: { date: { $gte: sevenDaysAgo } } },
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

      // Recent events
      FunnelEvent.find()
        .sort({ timestamp: -1 })
        .limit(20)
        .select("event page productSlug timestamp")
        .lean(),
    ]);

    // Parse funnel
    const funnelMap: Record<string, number> = {};
    for (const f of funnelCounts) {
      funnelMap[f._id as string] = f.count;
    }
    const productViews = funnelMap["product_view"] || 0;
    const addToCart = funnelMap["add_to_cart"] || 0;
    const checkoutStart = funnelMap["checkout_start"] || 0;
    const purchases = funnelMap["purchase"] || 0;
    const conversionRate =
      productViews > 0 ? parseFloat(((purchases / productViews) * 100).toFixed(2)) : 0;

    // Active carts stats
    const cartSessions = activeCartsRaw as Array<{
      sessionId: string;
      page: string;
      cartItemCount: number;
      cartValue: number;
      isCheckingOut: boolean;
    }>;
    const totalCartValue = cartSessions.reduce((sum, s) => sum + (s.cartValue || 0), 0);

    return NextResponse.json({
      onlineNow: activeSessions,
      pageBreakdown: pageBreakdownRaw.map((p) => ({
        page: p._id.page,
        title: p._id.title,
        count: p.count,
      })),
      activeCarts: {
        count: cartSessions.length,
        totalValue: parseFloat(totalCartValue.toFixed(2)),
        sessions: cartSessions.map((s) => ({
          sessionId: s.sessionId,
          page: s.page,
          cartItemCount: s.cartItemCount,
          cartValue: s.cartValue,
        })),
      },
      checkingOut: cartSessions.filter((s) => s.isCheckingOut).length,
      funnel: {
        productViews,
        addToCart,
        checkoutStart,
        purchases,
        conversionRate,
      },
      topProducts: topProductsRaw.map((p) => ({
        productId: p._id,
        slug: p.slug,
        title: p.title,
        image: p.image,
        views: p.views,
        addToCartCount: p.addToCartCount,
        purchaseCount: p.purchaseCount,
      })),
      recentEvents: (recentEventsRaw as Array<{
        event: string;
        page: string;
        productSlug?: string;
        timestamp: Date;
      }>).map((e) => ({
        event: e.event,
        page: e.page,
        productSlug: e.productSlug,
        timestamp: e.timestamp,
      })),
    });
  } catch (err) {
    console.error("[admin/analytics/live]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
