#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unused-vars */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import slugify from "slugify";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
const connectToDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "GoalMania",
    });
    console.log("✅ MongoDB connected");
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
};

// Define the Product schema
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
      default: 30,
    },
    retroPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 35,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    images: {
      type: [String],
      required: true,
    },
    isRetro: {
      type: Boolean,
      default: false,
    },
    hasShorts: {
      type: Boolean,
      default: false,
    },
    hasSocks: {
      type: Boolean,
      default: false,
    },
    hasPlayerEdition: {
      type: Boolean,
      default: false,
    },
    adultSizes: {
      type: [String],
      required: true,
      default: ["S", "M", "L", "XL", "XXL"],
    },
    kidsSizes: {
      type: [String],
      required: false,
      default: [],
    },
    category: {
      type: String,
      required: true,
    },
    availablePatches: {
      type: [String],
      default: [],
    },
    allowsNumberOnShirt: {
      type: Boolean,
      default: true,
    },
    allowsNameOnShirt: {
      type: Boolean,
      default: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    feature: {
      type: Boolean,
      default: false,
    },
    reviews: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Helper functions
const parseBoolean = (value) => {
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }
  return Boolean(value);
};

const generateSlug = (title) => {
  if (!title || typeof title !== "string") {
    return `product-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  return slugify(title, {
    lower: true,
    strict: true,
    trim: true,
    replacement: "-",
  });
};

// Get or create default image based on category
const getDefaultImage = (category) => {
  if (category && category.includes("2025/26")) {
    return "https://res.cloudinary.com/goal-mania/image/upload/v1717608995/2025-placeholder_fxowug.jpg";
  } else if (category === "retro") {
    return "https://res.cloudinary.com/goal-mania/image/upload/v1717608995/retro-placeholder_cjwnbz.jpg";
  } else {
    return "https://res.cloudinary.com/goal-mania/image/upload/v1717608995/jersey-placeholder_qclytm.jpg";
  }
};

// Hard-coded standard values for fields when missing
const DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL"];
const DEFAULT_KIDS_SIZES = ["XS", "S", "M", "L"];
const DEFAULT_PATCHES = ["coppa-italia", "champions-league", "serie-a"];

// Process all lines from CSV
const seedAllProducts = async () => {
  // Create or get the Product model
  const Product =
    mongoose.models.Product || mongoose.model("Product", productSchema);

  console.log("Reading CSV file...");
  const filePath = path.join(process.cwd(), "prod.csv");
  const fileContent = fs.readFileSync(filePath, { encoding: "utf-8" });

  // Split by lines and process
  const lines = fileContent.split("\n").filter((line) => line.trim());
  console.log(`Found ${lines.length} lines in CSV`);

  // Skip header
  const dataLines = lines.slice(1);
  console.log(`Processing ${dataLines.length} data lines`);

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (const line of dataLines) {
    try {
      // Extract title which is the first field
      const fields = line.split(",");
      const title = fields[0]?.trim();

      if (!title) {
        console.log("Skipping line with no title");
        skippedCount++;
        continue;
      }

      // Generate a slug from title
      const slug = generateSlug(title);

      // Check if product already exists
      const existingProduct = await Product.findOne({ slug });
      if (existingProduct) {
        console.log(`Product with slug ${slug} already exists, skipping...`);
        skippedCount++;
        continue;
      }

      // Create a product with extracted title and standard values
      const productData = {
        title,
        description: title,
        basePrice: 30,
        retroPrice: 35,
        stockQuantity: 1,
        images: [
          getDefaultImage(
            title.toLowerCase().includes("retro") ? "retro" : "2024/25"
          ),
        ],
        isRetro: title.toLowerCase().includes("retro"),
        hasShorts: true,
        hasSocks: true,
        hasPlayerEdition: true,
        adultSizes: DEFAULT_SIZES,
        kidsSizes: DEFAULT_KIDS_SIZES,
        category: title.toLowerCase().includes("retro")
          ? "retro"
          : title.toLowerCase().includes("2025")
          ? "2025/26"
          : "2024/25",
        availablePatches: DEFAULT_PATCHES,
        allowsNumberOnShirt: true,
        allowsNameOnShirt: true,
        slug,
        isActive: true,
        feature: title.toLowerCase().includes("2025"),
        reviews: [],
      };

      // Create the product
      await Product.create(productData);
      successCount++;
      console.log(`✅ Created product: ${title} with slug: ${slug}`);
    } catch (error) {
      errorCount++;
      console.error(
        `❌ Error processing line: ${line.substring(0, 50)}...`,
        error
      );
    }
  }

  console.log("\n=== Import Summary ===");
  console.log(`Total lines processed: ${dataLines.length}`);
  console.log(`Successfully imported: ${successCount}`);
  console.log(`Skipped (already exists): ${skippedCount}`);
  console.log(`Failed to import: ${errorCount}`);
  console.log("======================\n");
};

// Main execution
async function main() {
  console.log("Connecting to database...");
  await connectToDB();

  try {
    await seedAllProducts();
    console.log("Seed process completed successfully");
  } catch (error) {
    console.error("Error during seed process:", error);
  } finally {
    console.log("Disconnecting from database...");
    await mongoose.disconnect();
    console.log("Database connection closed");
    process.exit(0);
  }
}

main().catch((error) => {
  console.error("Seeder failed:", error);
  process.exit(1);
});
