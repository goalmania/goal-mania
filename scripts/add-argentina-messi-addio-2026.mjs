/**
 * Seed script — aggiunge la maglia Argentina "ultima partita Messi" (6 ottobre 2026 vs Benin).
 * Run: node scripts/add-argentina-messi-addio-2026.mjs
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error("MONGODB_URI not found"); process.exit(1); }

const reviewSchema = new mongoose.Schema({
  userId: String, userName: String,
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  basePrice: { type: Number, default: 30 },
  retroPrice: { type: Number, default: 35 },
  shippingPrice: { type: Number, default: 0 },
  stockQuantity: { type: Number, default: 100 },
  images: { type: [String], default: ["/images/image.png"] },
  videos: { type: [String], default: [] },
  hasLongSleeve: { type: Boolean, default: false },
  longSleevePriceAddon: { type: Number, default: 10 },
  hasShorts: { type: Boolean, default: true },
  hasSocks: { type: Boolean, default: true },
  hasPlayerEdition: { type: Boolean, default: true },
  isWorldCup: { type: Boolean, default: false },
  isRetro: { type: Boolean, default: false },
  isMysteryBox: { type: Boolean, default: false },
  country: { type: String, default: "" },
  nationalTeam: { type: String, default: "" },
  adultSizes: { type: [String], default: ["S","M","L","XL","XXL"] },
  kidsSizes: { type: [String], default: [] },
  category: { type: String, required: true },
  allowsNumberOnShirt: { type: Boolean, default: true },
  allowsNameOnShirt: { type: Boolean, default: true },
  slug: { type: String, unique: true, lowercase: true, trim: true },
  isActive: { type: Boolean, default: true },
  feature: { type: Boolean, default: false },
  reviews: { type: [reviewSchema], default: [] },
}, { timestamps: true });

productSchema.pre("validate", function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
  next();
});

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

const PLACEHOLDER_IMAGE =
  "https://res.cloudinary.com/goal-mania/image/upload/v1717608995/jersey-placeholder_qclytm.jpg";

const product = {
  title: "Maglia Argentina Ultima Partita Messi 2026",
  description:
    "Il 6 ottobre 2026 Lionel Messi ha giocato la sua ultima partita con la nazionale argentina, contro il Benin, al Monumental di Buenos Aires. Per l'occasione Adidas e AFA hanno presentato una maglia che abbandona le classiche strisce verticali: una fascia bianca centrale su base celeste, il Sol de Mayo dorato su petto e schiena, la M personale di Messi al posto del logo tecnico, nome e numero 10 in oro. Questa è la versione replica da collezione di quella maglia, taglie S-XXL, personalizzabile con nome e numero sul retro.",
  basePrice: 35,
  retroPrice: 35,
  shippingPrice: 0,
  stockQuantity: 25,
  images: [PLACEHOLDER_IMAGE],
  hasShorts: false,
  hasSocks: false,
  hasPlayerEdition: true,
  isWorldCup: false,
  isRetro: false,
  country: "Argentina",
  nationalTeam: "Argentina",
  adultSizes: ["S", "M", "L", "XL", "XXL"],
  kidsSizes: [],
  category: "Edizioni Limitate",
  allowsNumberOnShirt: true,
  allowsNameOnShirt: true,
  isActive: true,
  feature: true,
};

async function run() {
  await mongoose.connect(MONGODB_URI, { dbName: "GoalMania" });
  console.log("Connesso a MongoDB");

  const slug = product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const existing = await Product.findOne({ slug });
  if (existing) {
    console.log(`Prodotto già presente con slug ${slug}, aggiorno i campi principali.`);
    await Product.updateOne({ slug }, { $set: product });
  } else {
    await Product.create({ ...product, slug });
    console.log(`Prodotto creato con slug ${slug}`);
  }

  await mongoose.disconnect();
  console.log("Fatto.");
}

run().catch((err) => {
  console.error("Errore:", err);
  process.exit(1);
});
