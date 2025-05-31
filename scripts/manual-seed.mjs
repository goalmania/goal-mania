#!/usr/bin/env node
import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

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

// Create a model from the schema
const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

// Sample products to import (manually extracted from CSV)
const products = [
  {
    title: "Maglia Away FC Barcelona x Travis Scott - Edizione Speciale",
    description: "Maglia Away FC Barcelona x Travis Scott - Edizione Speciale",
    basePrice: 35,
    retroPrice: 35,
    stockQuantity: 1,
    images: [
      "https://res.cloudinary.com/goal-mania/image/upload/v1717608995/jersey-placeholder_qclytm.jpg",
    ],
    isRetro: false,
    hasShorts: true,
    hasSocks: true,
    hasPlayerEdition: true,
    adultSizes: ["S", "M", "L", "XL", "XXL", "3XL"],
    kidsSizes: ["XS", "S", "M", "L"],
    category: "2025/26",
    availablePatches: ["coppa-italia", "champions-league", "serie-a"],
    allowsNumberOnShirt: true,
    allowsNameOnShirt: true,
    slug: "maglia-away-fc-barcelona-travis-scott-edizione-speciale",
    isActive: true,
    feature: true,
    reviews: [],
  },
  {
    title: "Maglia Home FC Barcelona x Travis Scott - Edizione Speciale",
    description: "Maglia Home FC Barcelona x Travis Scott - Edizione Speciale",
    basePrice: 35,
    retroPrice: 35,
    stockQuantity: 1,
    images: [
      "https://res.cloudinary.com/goal-mania/image/upload/v1717608995/jersey-placeholder_qclytm.jpg",
    ],
    isRetro: false,
    hasShorts: true,
    hasSocks: true,
    hasPlayerEdition: true,
    adultSizes: ["S", "M", "L", "XL", "XXL", "3XL"],
    kidsSizes: ["XS", "S", "M", "L"],
    category: "2025/26",
    availablePatches: ["coppa-italia", "champions-league", "serie-a"],
    allowsNumberOnShirt: true,
    allowsNameOnShirt: true,
    slug: "maglia-home-fc-barcelona-travis-scott-edizione-speciale",
    isActive: true,
    feature: true,
    reviews: [],
  },
  {
    title: "Maglia Inter 2025/26 Home",
    description: "Maglia Inter 2025/26 Home",
    basePrice: 30,
    retroPrice: 30,
    stockQuantity: 1,
    images: [
      "https://res.cloudinary.com/goal-mania/image/upload/v1717608995/2025-placeholder_fxowug.jpg",
    ],
    isRetro: false,
    hasShorts: true,
    hasSocks: true,
    hasPlayerEdition: true,
    adultSizes: ["S", "M", "L", "XL", "XXL", "3XL"],
    kidsSizes: ["XS", "S", "M", "L"],
    category: "2025/26",
    availablePatches: ["coppa-italia", "champions-league", "serie-a"],
    allowsNumberOnShirt: true,
    allowsNameOnShirt: true,
    slug: "maglia-inter-2025-26-home",
    isActive: true,
    feature: true,
    reviews: [],
  },
  {
    title: "Maglia INTER x VR46 EDIZIONE LIMITATA",
    description: "Maglia INTER x VR46 EDIZIONE LIMITATA",
    basePrice: 30,
    retroPrice: 30,
    stockQuantity: 1,
    images: [
      "https://res.cloudinary.com/goal-mania/image/upload/v1717608995/jersey-placeholder_qclytm.jpg",
    ],
    isRetro: false,
    hasShorts: true,
    hasSocks: true,
    hasPlayerEdition: true,
    adultSizes: ["S", "M", "L", "XL", "XXL", "3XL"],
    kidsSizes: ["XS", "S", "M", "L"],
    category: "2025/26",
    availablePatches: ["coppa-italia", "champions-league", "serie-a"],
    allowsNumberOnShirt: true,
    allowsNameOnShirt: true,
    slug: "maglia-inter-vr46-edizione-limitata",
    isActive: true,
    feature: true,
    reviews: [],
  },
  {
    title: "Maglia Juventus 2025/26 Home",
    description: "Maglia Juventus 2025/26 Home",
    basePrice: 30,
    retroPrice: 30,
    stockQuantity: 1,
    images: [
      "https://res.cloudinary.com/goal-mania/image/upload/v1717608995/2025-placeholder_fxowug.jpg",
    ],
    isRetro: false,
    hasShorts: true,
    hasSocks: true,
    hasPlayerEdition: true,
    adultSizes: ["S", "M", "L", "XL", "XXL", "3XL"],
    kidsSizes: ["XS", "S", "M", "L"],
    category: "2025/26",
    availablePatches: ["coppa-italia", "champions-league", "serie-a"],
    allowsNumberOnShirt: true,
    allowsNameOnShirt: true,
    slug: "maglia-juventus-2025-26-home",
    isActive: true,
    feature: true,
    reviews: [],
  },
  {
    title: "Maglia Milan 2025/26 Home",
    description: "Maglia Milan 2025/26 Home",
    basePrice: 30,
    retroPrice: 30,
    stockQuantity: 1,
    images: [
      "https://res.cloudinary.com/goal-mania/image/upload/v1717608995/2025-placeholder_fxowug.jpg",
    ],
    isRetro: false,
    hasShorts: true,
    hasSocks: true,
    hasPlayerEdition: true,
    adultSizes: ["S", "M", "L", "XL", "XXL", "3XL"],
    kidsSizes: ["XS", "S", "M", "L"],
    category: "2025/26",
    availablePatches: ["coppa-italia", "champions-league", "serie-a"],
    allowsNumberOnShirt: true,
    allowsNameOnShirt: true,
    slug: "maglia-milan-2025-26-home",
    isActive: true,
    feature: true,
    reviews: [],
  },
  // Retro products
  {
    title: "Maglia Milan 2004/05 Home",
    description: "Maglia Milan 2004/05 Home - Classic retro jersey",
    basePrice: 30,
    retroPrice: 35,
    stockQuantity: 1,
    images: [
      "https://res.cloudinary.com/goal-mania/image/upload/v1717608995/retro-placeholder_cjwnbz.jpg",
    ],
    isRetro: true,
    hasShorts: true,
    hasSocks: true,
    hasPlayerEdition: true,
    adultSizes: ["S", "M", "L", "XL", "XXL", "3XL"],
    kidsSizes: ["XS", "S", "M", "L"],
    category: "retro",
    availablePatches: ["coppa-italia", "champions-league", "serie-a"],
    allowsNumberOnShirt: true,
    allowsNameOnShirt: true,
    slug: "maglia-milan-2004-05-home",
    isActive: true,
    feature: false,
    reviews: [],
  },
  {
    title: "Maglia Liverpool 2004/05",
    description: "Maglia Liverpool 2004/05 - Champions League winning season",
    basePrice: 30,
    retroPrice: 35,
    stockQuantity: 1,
    images: [
      "https://res.cloudinary.com/goal-mania/image/upload/v1717608995/retro-placeholder_cjwnbz.jpg",
    ],
    isRetro: true,
    hasShorts: true,
    hasSocks: true,
    hasPlayerEdition: true,
    adultSizes: ["S", "M", "L", "XL", "XXL", "3XL"],
    kidsSizes: ["XS", "S", "M", "L"],
    category: "retro",
    availablePatches: ["coppa-italia", "champions-league", "serie-a"],
    allowsNumberOnShirt: true,
    allowsNameOnShirt: true,
    slug: "maglia-liverpool-2004-05",
    isActive: true,
    feature: false,
    reviews: [],
  },
  {
    title: "Maglia Italia 2006 Home",
    description: "Maglia Italia 2006 Home - World Cup winning jersey",
    basePrice: 30,
    retroPrice: 35,
    stockQuantity: 1,
    images: [
      "https://res.cloudinary.com/goal-mania/image/upload/v1717608995/retro-placeholder_cjwnbz.jpg",
    ],
    isRetro: true,
    hasShorts: true,
    hasSocks: true,
    hasPlayerEdition: true,
    adultSizes: ["S", "M", "L", "XL", "XXL", "3XL"],
    kidsSizes: ["XS", "S", "M", "L"],
    category: "retro",
    availablePatches: ["coppa-italia", "champions-league", "serie-a"],
    allowsNumberOnShirt: true,
    allowsNameOnShirt: true,
    slug: "maglia-italia-2006-home",
    isActive: true,
    feature: false,
    reviews: [],
  },
  // Current season products
  {
    title: "Maglia Tottenham Away",
    description: "Maglia Tottenham Away 2024/25",
    basePrice: 30,
    retroPrice: 35,
    stockQuantity: 1,
    images: [
      "https://res.cloudinary.com/goal-mania/image/upload/v1717608995/jersey-placeholder_qclytm.jpg",
    ],
    isRetro: false,
    hasShorts: true,
    hasSocks: true,
    hasPlayerEdition: true,
    adultSizes: ["S", "M", "L", "XL", "XXL", "3XL"],
    kidsSizes: ["XS", "S", "M", "L"],
    category: "2024/25",
    availablePatches: ["coppa-italia", "champions-league", "serie-a"],
    allowsNumberOnShirt: true,
    allowsNameOnShirt: true,
    slug: "maglia-tottenham-away-2024-25",
    isActive: true,
    feature: false,
    reviews: [],
  },
  {
    title: "Maglia Roma Home",
    description: "Maglia Roma Home 2024/25",
    basePrice: 30,
    retroPrice: 35,
    stockQuantity: 1,
    images: [
      "https://res.cloudinary.com/goal-mania/image/upload/v1717608995/jersey-placeholder_qclytm.jpg",
    ],
    isRetro: false,
    hasShorts: true,
    hasSocks: true,
    hasPlayerEdition: true,
    adultSizes: ["S", "M", "L", "XL", "XXL", "3XL"],
    kidsSizes: ["XS", "S", "M", "L"],
    category: "2024/25",
    availablePatches: ["coppa-italia", "champions-league", "serie-a"],
    allowsNumberOnShirt: true,
    allowsNameOnShirt: true,
    slug: "maglia-roma-home-2024-25",
    isActive: true,
    feature: false,
    reviews: [],
  },
];

// Function to seed the database
const seedProducts = async () => {
  console.log("Beginning database seed with manual product data...");
  let successCount = 0;
  let errorCount = 0;

  for (const productData of products) {
    try {
      // Check if product with this slug already exists
      const existingProduct = await Product.findOne({ slug: productData.slug });

      if (existingProduct) {
        console.log(
          `Product with slug ${productData.slug} already exists, skipping...`
        );
        continue;
      }

      // Create the product
      await Product.create(productData);
      successCount++;
      console.log(
        `✅ Created product: ${productData.title} with slug: ${productData.slug}`
      );
    } catch (error) {
      errorCount++;
      console.error(`❌ Error creating product ${productData.title}:`, error);
    }
  }

  console.log("\n=== Import Summary ===");
  console.log(`Total products processed: ${products.length}`);
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
    console.log("Manual seed process completed successfully");
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
