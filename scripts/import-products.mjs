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

const fixArrayString = (str) => {
  if (!str || str === "[]") return "[]";

  // Fix the specific problem in KidsSizes with "XS"."S" -> "XS","S"
  let fixedStr = str.replace(/"\./g, '",');

  // Remove extra quotes that might be breaking JSON
  fixedStr = fixedStr.replace(/"{2,}/g, '"');

  return fixedStr;
};

const parseArray = (value) => {
  try {
    // Handle empty arrays
    if (!value || value === "[]") return [];

    const fixedValue = fixArrayString(value);

    // Try to parse JSON directly
    try {
      return JSON.parse(fixedValue);
    } catch (e) {
      // If direct parsing fails, try to clean it up more
      const cleanValue = fixedValue
        .replace(/^\[|\]$/g, "")
        .replace(/\\"/g, '"')
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      return cleanValue;
    }
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

const importProducts = async () => {
  // Create or get the Product model
  const Product =
    mongoose.models.Product || mongoose.model("Product", productSchema);

  // Read CSV file
  const filePath = path.join(process.cwd(), "prod.csv");
  const fileContent = fs.readFileSync(filePath, { encoding: "utf-8" });

  // Manual CSV parsing (more reliable for malformed CSV)
  const lines = fileContent.split("\n").filter((line) => line.trim());
  const headers = lines[0].split(",");

  // Process each line into an object
  const products = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = parseCSVLine(line);

    if (values.length >= headers.length) {
      const product = {};
      for (let j = 0; j < headers.length; j++) {
        product[headers[j]] = values[j];
      }
      products.push(product);
    }
  }

  console.log(`Found ${products.length} products to import`);

  // Count for tracking progress
  let processedCount = 0;
  let successCount = 0;
  let errorCount = 0;

  for (const record of products) {
    try {
      // Debug the current record
      console.log(`Processing product: ${record.title}`);

      // Generate slug if missing
      const productSlug =
        record.slug && record.slug.trim()
          ? record.slug.trim()
          : generateSlug(record.title);

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
        if (record.category && record.category.includes("2025/26")) {
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
        description: record.description || record.title,
        basePrice: parseFloat(record.basePrice) || 30,
        retroPrice: parseFloat(record.retroPrice) || 35,
        stockQuantity: parseInt(record.stockQuantity) || 1,
        images: images,
        isRetro: parseBoolean(record.isRetro),
        hasShorts: parseBoolean(record.hasShorts),
        hasSocks: parseBoolean(record.hasScoks), // Note: fixing typo from CSV
        hasPlayerEdition: parseBoolean(record.hasPlayerEdtition), // Note: fixing typo from CSV
        adultSizes: adultSizes.length
          ? adultSizes
          : ["S", "M", "L", "XL", "XXL"],
        kidsSizes: kidsSizes,
        category: record.category || "2024/25",
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
        `Progress: ${processedCount}/${products.length} products processed`
      );
    }
  }

  console.log("\n=== Import Summary ===");
  console.log(`Total products processed: ${processedCount}`);
  console.log(`Successfully imported: ${successCount}`);
  console.log(`Failed to import: ${errorCount}`);
  console.log("======================\n");
};

// Function to parse CSV line considering quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  // Add the last field
  result.push(current);

  return result;
}

// Main execution
async function main() {
  console.log("Connecting to database...");
  await connectToDB();

  try {
    await importProducts();
    console.log("Import process completed successfully");
  } catch (error) {
    console.error("Error during import process:", error);
  } finally {
    console.log("Disconnecting from database...");
    await mongoose.disconnect();
    console.log("Database connection closed");
    process.exit(0);
  }
}

main().catch((error) => {
  console.error("Importer failed:", error);
  process.exit(1);
});
