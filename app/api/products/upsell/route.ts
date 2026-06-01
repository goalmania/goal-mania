import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";

export const revalidate = 300; // cache 5 minuti

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const exclude = searchParams.get("exclude")?.split(",").filter(Boolean) || [];

    await connectDB();

    // Prendi 2 prodotti attivi casuali, esclusi quelli già nel carrello
    const products = await (Product as any)
      .aggregate([
        {
          $match: {
            isActive: true,
            title: { $exists: true, $ne: "" },
            images: { $exists: true, $not: { $size: 0 } },
            ...(exclude.length > 0 ? { _id: { $nin: exclude } } : {}),
          },
        },
        { $sample: { size: 2 } },
        {
          $project: {
            _id: 1,
            title: 1,
            basePrice: 1,
            images: { $slice: ["$images", 1] },
            slug: 1,
          },
        },
      ])
      .exec();

    return NextResponse.json(products);
  } catch (error) {
    console.error("Upsell products error:", error);
    return NextResponse.json([], { status: 200 }); // fallback silenzioso
  }
}
