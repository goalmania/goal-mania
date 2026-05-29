import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { FunnelEvent, ProductView } from "@/lib/models/Analytics";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, sessionId, page, productId, productSlug, value, productTitle, productImage } =
      body;

    if (!event || !sessionId) {
      return NextResponse.json({ error: "event and sessionId required" }, { status: 400 });
    }

    await connectDB();

    // Save funnel event
    await FunnelEvent.create({
      event,
      sessionId,
      page: page || "/",
      productId,
      productSlug,
      value,
      timestamp: new Date(),
    });

    // Update product view counters
    if (productId && (event === "product_view" || event === "add_to_cart" || event === "purchase")) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const inc: Record<string, number> = {};
      if (event === "product_view") inc.views = 1;
      if (event === "add_to_cart") inc.addToCartCount = 1;
      if (event === "purchase") inc.purchaseCount = 1;

      await ProductView.findOneAndUpdate(
        { productId, date: today },
        {
          $inc: inc,
          $setOnInsert: {
            slug: productSlug || "",
            title: productTitle || "",
            image: productImage || "",
          },
        },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[analytics/event]", err);
    return NextResponse.json({ ok: false }, { status: 200 }); // don't break the site
  }
}
