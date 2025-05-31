import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Review } from "@/lib/models/Review";

export async function GET() {
  try {
    await connectDB();
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .populate("product");

    const formattedReviews = reviews.map((review) => ({
      id: review._id.toString(), // Ensure the ObjectId is converted to a string
      name: review.name,
      rating: review.rating?.valueOf() || review.rating, // Handle rating conversion if needed
      comment: review.comment,
      date: formatDate(new Date(review.createdAt)), // Pass the correct 'createdAt' field for date formatting
    }));

    return NextResponse.json(formattedReviews);
  } catch (error) {
    console.error("[REVIEWS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return "1 giorno fa";
  } else if (diffDays < 7) {
    return `${diffDays} giorni fa`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? "settimana" : "settimane"} fa`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? "mese" : "mesi"} fa`;
  }
}
