require("dotenv").config();
const mongoose = require("mongoose");

// Define the Product schema directly in this script
const productSchema = new mongoose.Schema({
  shippingPrice: {
    type: Number,
    min: 0,
    default: 0,
  },
});

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Use the direct collection approach
    const Product = mongoose.connection.collection("products");

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
