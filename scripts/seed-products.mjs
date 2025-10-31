#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import slugify from "slugify";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

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
  if (!value || typeof value !== 'string') return false;
  return value.toLowerCase() === "true";
};

  const parseArray = (value) => {
    try {
      if (!value || typeof value !== "string") {
        return [];
      }

      // Fix the dot issue in kids sizes
      const fixedValue = value.replace(/"\."/, '","');
      
      // Clean the string and parse as JSON
      const cleanValue = fixedValue.replace(/^\[|\]$/g, "");
      if (!cleanValue.trim()) return [];
      
      try {
        return JSON.parse(`[${cleanValue}]`);
      } catch {
        // If parsing fails, try to split by comma and clean up
        return cleanValue
          .split(",")
          .map(item => item.trim().replace(/^["']+|["']+$/g, ""))
          .filter(Boolean);
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

const seedProducts = async () => {
  // Create or get the Product model
  const Product =
    mongoose.models.Product || mongoose.model("Product", productSchema);

  // Read from prod.csv
  const filePath = path.join(process.cwd(), "prod.csv");
  const fileContent = fs.readFileSync(filePath, { encoding: "utf-8" });

  // Print raw file content for debugging
  console.log("Raw CSV content (first 5 lines):");
  console.log(fileContent.split('\n').slice(0, 5).join('\n'));

  // Debug CSV header row
  const csvLines = fileContent.split('\n');
  console.log("\nCSV Header row:", csvLines[0]);

  console.log("\nParsing CSV file...");
  const records = parse(fileContent, {
    columns: (header) => header.map(column => column.trim().toLowerCase()),
    skip_empty_lines: true,
    trim: true,
    relaxColumnCount: true,
    bom: true,
  });

  // Print parsed record for debugging
  console.log("\nSample record (raw):", JSON.stringify(records[0], null, 2));

  // Check if title exists in the first record
  if (records[0]) {
    console.log("\nTitle from first record:", records[0].title);
    console.log("Keys in first record:", Object.keys(records[0]));
  }

  console.log(`\nFound ${records.length} products to import`);

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

      // Parse arrays properly (handle both cases)
      const adultSizes = parseArray(record.adultSizes || record.AdultSizes);
      const kidsSizes = parseArray(record.kidsSizes || record.KidsSizes);
      const availablePatches = parseArray(record.availablePatches || record.AvailablePatches || record.avaialbePatches);
      const images = parseArray(record.images || record.Images);

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

      // Map the category from year format to proper category
      const mapCategory = (cat) => {
        if (!cat) return 'current';
        if (cat.includes('2025/26')) return 'next-season';
        if (cat.includes('2024/25')) return 'current';
        if (cat.includes('2023/24')) return 'last-season';
        return cat.toLowerCase(); // For other categories like 'retro'
      };

      // Debug the record
      console.log("\nProcessing record:", record.title);
      console.log("Record data:", JSON.stringify(record, null, 2));

      // Create product object
      const productData = {
        title: record.title?.trim() || record.Title?.trim(),
        description: record.description?.trim() || record.Description?.trim(),
        basePrice: parseFloat(record.basePrice || record.BasePrice) || 30,
        retroPrice: parseFloat(record.retroPrice || record.RetroPrice) || 35,
        stockQuantity: parseInt(record.stockQuantity || record.StockQuantity) || 0,
        images: images.length > 0 ? images : ["https://res.cloudinary.com/goal-mania/image/upload/v1717608995/jersey-placeholder_qclytm.jpg"],
        isRetro: parseBoolean(record.isRetro || record.IsRetro),
        hasShorts: parseBoolean(record.hasShorts || record.HasShorts),
        hasSocks: parseBoolean(record.hasScoks || record.HasScoks), // Note: fixing typo from CSV
        hasPlayerEdition: parseBoolean(record.hasPlayerEdtition || record.HasPlayerEdition), // Note: fixing typo from CSV
        adultSizes: adultSizes.length > 0 ? adultSizes : ["S", "M", "L", "XL", "XXL"],
        kidsSizes: kidsSizes.length > 0 ? kidsSizes : [],
        category: mapCategory(record.category || record.Category),
        availablePatches: availablePatches, // Note: fixing typo from CSV
        allowsNumberOnShirt: parseBoolean(record.allowsNumberOnShirt || record.AllowsNumberOnShirt),
        allowsNameOnShirt: parseBoolean(record.allowsNameOnShirt || record.AllowsNameOnShirt),
        slug: productSlug,
        isActive: parseBoolean(record.isActive || record.IsActive),
        feature: parseBoolean(record.feature || record.Feature),
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
