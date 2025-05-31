import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Review } from "@/lib/models/Review";
import fs from "fs";
import path from "path";

// This function reads the review data from the JSON file
async function readReviewsFromFile() {
  try {
    const filePath = path.join(process.cwd(), "mongo_reviews.json");
    const fileContent = fs.readFileSync(filePath, "utf8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading reviews file:", error);
    throw error;
  }
}

// Convert MongoDB extended JSON format to normal JavaScript values
function normalizeMongoDBJson(review: any) {
  return {
    productId: review.productId,
    name: review.name,
    rating: review.rating?.$numberInt ? parseInt(review.rating.$numberInt) : 5,
    comment: review.comment,
    createdAt: review.createdAt?.$date?.$numberLong
      ? new Date(parseInt(review.createdAt.$date.$numberLong))
      : new Date(),
    verified: true,
  };
}

export async function GET() {
  try {
    await connectDB();

    // Check if reviews are already imported
    const existingCount = await Review.countDocuments();
    if (existingCount > 0) {
      return NextResponse.json({
        message: `${existingCount} reviews already exist in the database. No new reviews imported.`,
      });
    }

    // Read reviews from the JSON file
    const reviewsData = await readReviewsFromFile();

    // Normalize and format the review data
    const normalizedReviews = reviewsData.map(normalizeMongoDBJson);

    // Insert reviews into the database
    const result = await Review.insertMany(normalizedReviews);

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${result.length} reviews`,
    });
  } catch (error) {
    console.error("Error importing reviews:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to import reviews",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
