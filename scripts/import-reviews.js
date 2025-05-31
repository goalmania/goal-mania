/**
 * This script imports reviews from mongo_reviews.json into the database
 *
 * Usage:
 * node scripts/import-reviews.js
 */

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

// Review model schema (must match the one in lib/models/Review.ts)
const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false },
  productId: { type: String, required: true },
});

// Read the reviews JSON file
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

// Normalize MongoDB JSON format
function normalizeMongoDBJson(review) {
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

// Main function
async function importReviews() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI environment variable is not defined");
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get the Review model
    const ReviewModel =
      mongoose.models.Review || mongoose.model("Review", reviewSchema);

    // Check if reviews already exist
    const existingCount = await ReviewModel.countDocuments();
    if (existingCount > 0) {
      console.log(
        `${existingCount} reviews already exist in the database. Delete them first if you want to reimport.`
      );
      process.exit(0);
    }

    // Read and process reviews
    const reviewsData = await readReviewsFromFile();
    console.log(`Found ${reviewsData.length} reviews in the JSON file`);

    const normalizedReviews = reviewsData.map(normalizeMongoDBJson);

    // Insert reviews into the database
    const result = await ReviewModel.insertMany(normalizedReviews);
    console.log(`Successfully imported ${result.length} reviews`);
  } catch (error) {
    console.error("Error importing reviews:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the script
importReviews();
