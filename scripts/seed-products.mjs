#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import slugify from "slugify";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import mongoose model dynamically
const connectToDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "GoalMania",
    });
    console.log("✅ MongoDB connected");
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
  return value.toLowerCase() === "true";
};

const parseArray = (value) => {
  try {
    // Handle empty arrays
    if (value === "[]") return [];

    // Remove brackets and parse JSON
    const cleanValue = value.replace(/^\[|\]$/g, "");

    // If empty after cleaning, return empty array
    if (!cleanValue.trim()) return [];

    // Parse the array string
    return JSON.parse(`[${cleanValue}]`);
  } catch (error) {
    console.error(`Error parsing array: ${value}`, error);
    return [];
  }
};

const generateSlug = (title) => {
  // Check if title is defined and is a string
  if (!title || typeof title !== "string") {
    // Generate a random slug if title is not available
    return `product-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  return slugify(title, {
    lower: true,
    strict: true,
    trim: true,
    replacement: "-",
  });
};

const seedProducts = async () => {
  // Create or get the Product model
  const Product =
    mongoose.models.Product || mongoose.model("Product", productSchema);

  // Read from prod.csv
  const filePath = path.join(process.cwd(), "prod.csv");
  const fileContent = fs.readFileSync(filePath, { encoding: "utf-8" });

  console.log("Parsing CSV file...");
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`Found ${records.length} products to import`);

  // Count for tracking progress
  let processedCount = 0;
  let successCount = 0;
  let errorCount = 0;

  for (const record of records) {
    try {
      // Debug the current record
      console.log(`Processing product: ${record.title}`);

      // Generate slug if missing
      const productSlug = record.slug || generateSlug(record.title);

      // Check if product with this slug already exists
      const existingProduct = await Product.findOne({ slug: productSlug });

      if (existingProduct) {
        console.log(
          `Product with slug ${productSlug} already exists, skipping...`
        );
        processedCount++;
        continue;
      }

      // Parse arrays properly
      const adultSizes = parseArray(record.adultSizes);
      const kidsSizes = parseArray(record.KidsSizes);
      const availablePatches = parseArray(record.avaialbePatches);
      const images = parseArray(record.Images);

      // If images array is empty, add placeholder
      if (images.length === 0) {
        // Add placeholder image based on category
        if (record.category.includes("2025/26")) {
          images.push(
            "https://res.cloudinary.com/goal-mania/image/upload/v1717608995/2025-placeholder_fxowug.jpg"
          );
        } else if (record.category === "retro") {
          images.push(
            "https://res.cloudinary.com/goal-mania/image/upload/v1717608995/retro-placeholder_cjwnbz.jpg"
          );
        } else {
          images.push(
            "https://res.cloudinary.com/goal-mania/image/upload/v1717608995/jersey-placeholder_qclytm.jpg"
          );
        }
      }

      // Create product object
      const productData = {
        title: record.title,
        description: record.description,
        basePrice: parseFloat(record.basePrice),
        retroPrice: parseFloat(record.retroPrice),
        stockQuantity: parseInt(record.stockQuantity),
        images: images,
        isRetro: parseBoolean(record.isRetro),
        hasShorts: parseBoolean(record.hasShorts),
        hasSocks: parseBoolean(record.hasScoks), // Note: fixing typo from CSV
        hasPlayerEdition: parseBoolean(record.hasPlayerEdtition), // Note: fixing typo from CSV
        adultSizes: adultSizes,
        kidsSizes: kidsSizes,
        category: record.category,
        availablePatches: availablePatches, // Note: fixing typo from CSV
        allowsNumberOnShirt: parseBoolean(record.allowsNumberOnShirt),
        allowsNameOnShirt: parseBoolean(record.allowsNameOnShirt),
        slug: productSlug,
        isActive: parseBoolean(record.isActive),
        feature: parseBoolean(record.feature),
        reviews: [], // Initialize with empty reviews
      };

      // Save product to database
      await Product.create(productData);

      successCount++;
      console.log(
        `✅ Created product: ${productData.title} with slug: ${productSlug}`
      );
    } catch (error) {
      errorCount++;
      console.error(`❌ Error creating product ${record.title}:`, error);
    }

    processedCount++;

    // Log progress every 10 products
    if (processedCount % 10 === 0) {
      console.log(
        `Progress: ${processedCount}/${records.length} products processed`
      );
    }
  }

  console.log("\n=== Import Summary ===");
  console.log(`Total products processed: ${processedCount}`);
  console.log(`Successfully imported: ${successCount}`);
  console.log(`Failed to import: ${errorCount}`);
  console.log("======================\n");
};

// Main execution
async function main() {
  console.log("Connecting to database...");
  await connectToDB();

  try {
    await seedProducts();
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
