import { config } from "dotenv";
config();

import mongoose from "mongoose";
import Product from "../lib/models/Product";

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Connected to MongoDB");

    const result = await Product.updateMany(
      { shippingPrice: { $exists: false } },
      { $set: { shippingPrice: 0 } }
    );

    console.log(`Updated ${result.modifiedCount} products`);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

main();
