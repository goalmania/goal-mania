import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

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

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  basePrice: { type: Number, required: true },
  images: { type: [String], required: true },
  category: { type: String, required: true },
  team: { type: String },
  isActive: { type: Boolean, default: true },
});

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

await connectToDB();

const products = [
  // Serie A
  {
    title: "Maglia Inter 2025/26 Home",
    basePrice: 89,
    images: ["/images/products/inter-2025-home.jpg"],
    category: "Serie A",
    team: "Inter",
    isActive: true,
  },
  {
    title: "Maglia Milan 2025/26 Home",
    basePrice: 89,
    images: ["/images/products/milan-2025-home.jpg"],
    category: "Serie A",
    team: "Milan",
    isActive: true,
  },
  // Premier League
  {
    title: "Maglia Manchester United 2025/26 Home",
    basePrice: 95,
    images: ["/images/products/manutd-2025-home.jpg"],
    category: "Premier League",
    team: "Manchester United",
    isActive: true,
  },
  {
    title: "Maglia Chelsea 2025/26 Home",
    basePrice: 95,
    images: ["/images/products/chelsea-2025-home.jpg"],
    category: "Premier League",
    team: "Chelsea",
    isActive: true,
  },
  // Resto del Mondo
  {
    title: "Maglia Boca Juniors 2025/26 Home",
    basePrice: 79,
    images: ["/images/products/boca-2025-home.jpg"],
    category: "Resto del Mondo",
    team: "Boca Juniors",
    isActive: true,
  },
  {
    title: "Maglia Al Ahly 2025/26 Home",
    basePrice: 79,
    images: ["/images/products/alahly-2025-home.jpg"],
    category: "Resto del Mondo",
    team: "Al Ahly",
    isActive: true,
  },
  // Edizioni Limitate
  {
    title: "Maglia Inter Edizione Limitata 2025",
    basePrice: 120,
    images: ["/images/products/inter-limited-2025.jpg"],
    category: "Edizioni Limitate",
    team: "Inter",
    isActive: true,
  },
  {
    title: "Maglia Milan Edizione Limitata 2025",
    basePrice: 120,
    images: ["/images/products/milan-limited-2025.jpg"],
    category: "Edizioni Limitate",
    team: "Milan",
    isActive: true,
  },
];


for (const product of products) {
  await Product.create(product);
  console.log(`Seeded: ${product.title}`);
}

console.log("Landing page category products seeded.");
process.exit(0);
