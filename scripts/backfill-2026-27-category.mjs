/**
 * Backfill — imposta category="2026/27" sui prodotti già live il cui titolo
 * matcha la stagione 2026/27 ma la cui category è ancora un valore legacy
 * (es. "SerieA"/"PremierLeague"/"Champions" dal vecchio seed script).
 * Run: node scripts/backfill-2026-27-category.mjs
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error("MONGODB_URI not found"); process.exit(1); }

const Product = mongoose.models.Product || mongoose.model(
  "Product",
  new mongoose.Schema({ title: String, category: String }, { strict: false })
);

async function main() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.\n");

  const candidates = await Product.find({
    title: { $regex: "2026[-/]27", $options: "i" },
    category: { $ne: "2026/27" },
  }).select("_id title category");

  console.log(`Trovati ${candidates.length} prodotti da correggere:\n`);
  for (const p of candidates) {
    console.log(`  ${p.title}  (category attuale: "${p.category}")`);
  }

  if (candidates.length === 0) {
    console.log("Niente da correggere.");
    await mongoose.disconnect();
    return;
  }

  const result = await Product.updateMany(
    { title: { $regex: "2026[-/]27", $options: "i" }, category: { $ne: "2026/27" } },
    { $set: { category: "2026/27" } }
  );

  console.log(`\nAggiornati ${result.modifiedCount} prodotti a category="2026/27".`);
  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
