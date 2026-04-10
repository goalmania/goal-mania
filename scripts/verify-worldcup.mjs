import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: ".env.local" });

async function verify() {
  try {
    console.log("Connecting to GoalMania DB for verification...");
    await mongoose.connect(process.env.MONGODB_URI, { dbName: "GoalMania" });
    const collection = mongoose.connection.db.collection("products");

    const worldCupProducts = await collection.find({ isWorldCup: true }).toArray();
    
    console.log(`Found ${worldCupProducts.length} World Cup products.`);

    worldCupProducts.forEach((sample, i) => {
      if (i < 3 || sample.title.includes("2026")) {
        console.log(`\n--- Product ${i+1}: ${sample.title} ---`);
        console.log("- NationalTeam:", sample.nationalTeam);
        console.log("- Country:", sample.country);
        console.log("- images (lowercase):", Array.isArray(sample.images) ? "Array" : typeof sample.images);
        console.log("- Images (uppercase):", Array.isArray(sample.Images) ? "Array" : typeof sample.Images);
        console.log("- Slug:", sample.slug);
      }
    });

    const productsMissingFields = worldCupProducts.filter(p => !p.nationalTeam || !p.country || !p.images);
    if (productsMissingFields.length === 0) {
      console.log("\n✅ All products have required fields (nationalTeam, country, images).");
    } else {
      console.log(`\n⚠️ ${productsMissingFields.length} products are missing some fields:`);
      productsMissingFields.forEach(p => console.log(`  - ${p.title} (Slug: ${p.slug})`));
    }

  } catch (err) {
    console.error("❌ Verification Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

verify();
