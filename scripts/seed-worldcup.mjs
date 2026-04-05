import mongoose from "mongoose";
import dotenv from "dotenv";
import slugify from "slugify";
import fs from "fs";
import path from "path";

dotenv.config({ path: ".env.local" });

async function seed() {
  try {const csvPath = path.join(process.cwd(), "worldcup-2026.csv");
    const rawData = fs.readFileSync(csvPath, "utf-8");

    console.log("Connecting to GoalMania DB...");
    await mongoose.connect(process.env.MONGODB_URI, { dbName: "GoalMania" });
    const collection = mongoose.connection.db.collection("products");

    const lines = rawData.trim().split("\n");
    const headers = lines[0].split(",");

    for (let i = 1; i < lines.length; i++) {
      // Improved regex to handle commas inside quoted JSON arrays
      const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      const product = {};

      headers.forEach((h, index) => {
  let val = values[index]?.replace(/"/g, "").trim();
  
  if (["TRUE", "FALSE"].includes(val?.toUpperCase())) {
    product[h] = val.toUpperCase() === "TRUE";
  } else if (["basePrice", "retroPrice", "stockQuantity"].includes(h)) {
    product[h] = Number(val) || 0;
  } else if (h === "Images") {
    // Standardizes the image field as an array
    product[h] = val ? [val] : [];
  } else if (["adultSizes", "KidsSizes"].includes(h)) {
    // Converts "S,M,L" into ["S", "M", "L"]
    product[h] = val ? val.split(",") : [];
  } else {
    product[h] = val;
  }
});

      product.slug = slugify(product.title, { lower: true, strict: true });
      product.updatedAt = new Date();

      await collection.updateOne(
        { slug: product.slug },
        { $set: product },
        { upsert: true }
      );
    }

    console.log(`✅ Success! ${lines.length - 1} World Cup jerseys synced from CSV.`);
  } catch (err) {
    console.error("❌ Migration Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();