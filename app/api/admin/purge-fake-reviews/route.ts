import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { Review } from "@/lib/models/Review";

/**
 * One-off cleanup: removes fabricated reviews seeded by the now-deleted
 * /api/admin/seed-reviews endpoint (tagged with userId starting "seed_")
 * and wipes the standalone Review collection, which was populated entirely
 * from an imported fake dataset (scripts/import-reviews.js + mongo_reviews.json).
 * Both were used as real customer reviews on the homepage and product pages —
 * removed per direct request, 22/10/2026. Delete this route after running it.
 */
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized - Not logged in" }, { status: 401 });
  }
  const role = (session.user as any)?.role as string | undefined;
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const pullResult = await Product.updateMany(
    { "reviews.userId": { $regex: "^seed_" } },
    { $pull: { reviews: { userId: { $regex: "^seed_" } } } }
  );

  const standaloneCount = await Review.countDocuments({});
  const deleteResult = await Review.deleteMany({});

  return NextResponse.json({
    productsModified: pullResult.modifiedCount,
    standaloneReviewsDeleted: deleteResult.deletedCount,
    standaloneReviewsFoundBefore: standaloneCount,
  });
}
