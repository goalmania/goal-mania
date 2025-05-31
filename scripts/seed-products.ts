#!/usr/bin/env ts-node
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import slugify from "slugify";
import mongoose from "mongoose";
import connectDB from "../lib/db";
import Product from "../lib/models/Product";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

interface ProductCSV {
  title: string;
  description: string;
  basePrice: string;
  retroPrice: string;
  stockQuantity: string;
  Images: string;
  isRetro: string;
  hasShorts: string;
  hasScoks: string; // Typo in CSV header
  hasPlayerEdtition: string; // Typo in CSV header
  adultSizes: string;
  KidsSizes: string; // Case inconsistency in CSV header
  category: string;
  avaialbePatches: string; // Typo in CSV header
  allowsNumberOnShirt: string;
  allowsNameOnShirt: string;
  slug: string;
  isActive: string;
  feature: string;
  reviews: string;
}

const parseBoolean = (value: string): boolean => {
  return value.toLowerCase() === "true";
};

const parseArray = (value: string): string[] => {
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

const generateSlug = (title: string): string => {
  return slugify(title, {
    lower: true,
    strict: true,
    trim: true,
    replacement: "-",
  });
};

const seedProducts = async () => {
  console.log("Connecting to database...");
  await connectDB();

  const filePath = path.join(process.cwd(), "prod.csv");
  const fileContent = fs.readFileSync(filePath, { encoding: "utf-8" });

  console.log("Parsing CSV file...");
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  }) as ProductCSV[];

  console.log(`Found ${records.length} products to import`);

  // Count for tracking progress
  let processedCount = 0;
  let successCount = 0;
  let errorCount = 0;

  for (const record of records) {
    try {
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

  console.log("Disconnecting from database...");
  await mongoose.disconnect();
  console.log("Database connection closed");
  process.exit(0);
};

// Run the seeder
seedProducts().catch((error) => {
  console.error("Seeder failed:", error);
  process.exit(1);
});
