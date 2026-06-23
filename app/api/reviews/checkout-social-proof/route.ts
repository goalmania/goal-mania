import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { Review } from "@/lib/models/Review";

export const revalidate = 3600; // cache 1h

export async function GET() {
  try {
    await connectDB();

    const collected: Array<{
      name: string;
      rating: number;
      comment: string;
      productName?: string;
      productImage?: string;
      verified: boolean;
    }> = [];

    // Recensioni embedded nei prodotti
    const products = await Product.find({ "reviews.0": { $exists: true } })
      .select("title images reviews")
      .lean();

    for (const p of products) {
      if (!Array.isArray(p.reviews)) continue;
      for (const r of p.reviews as any[]) {
        if (r.rating >= 4 && r.comment && r.comment.length > 20) {
          collected.push({
            name: r.userName || r.name || "Cliente verificato",
            rating: r.rating,
            comment: r.comment,
            productName: p.title,
            productImage: p.images?.[0],
            verified: true,
          });
        }
      }
    }

    // Recensioni standalone
    const standalone = await Review.find({ rating: { $gte: 4 }, comment: { $exists: true } }).lean();
    for (const r of standalone as any[]) {
      if (r.comment && r.comment.length > 20) {
        collected.push({
          name: r.name || "Cliente verificato",
          rating: r.rating,
          comment: r.comment,
          verified: r.verified ?? false,
        });
      }
    }

    if (collected.length === 0) {
      return NextResponse.json([]);
    }

    // Filtra solo 5 stelle, poi mescola e prendi le migliori 3
    const fiveStars = collected.filter((r) => r.rating === 5);
    const pool = fiveStars.length >= 3 ? fiveStars : collected;

    // Shuffle e prendi 3
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 3);

    // Tronca commenti troppo lunghi
    const result = shuffled.map((r) => ({
      ...r,
      comment: r.comment.length > 100 ? r.comment.slice(0, 97) + "…" : r.comment,
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("[checkout-social-proof]", err);
    return NextResponse.json([]);
  }
}
