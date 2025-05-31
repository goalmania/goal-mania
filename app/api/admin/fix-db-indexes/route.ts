import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Get the products collection directly using Mongoose connection
    const db = mongoose.connection.db;

    if (!db) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const productsCollection = db.collection("products");

    // Get all indexes in the products collection
    const indexes = await productsCollection.indexes();

    // Check if sku_1 index exists
    const skuIndex = indexes.find((index) => index.name === "sku_1");

    if (skuIndex) {
      // Drop the sku_1 index
      // The name is hardcoded to "sku_1" so we know it exists
      await productsCollection.dropIndex("sku_1");
      return NextResponse.json({
        message: "Successfully removed sku_1 index",
        beforeIndexes: indexes,
        currentIndexes: await productsCollection.indexes(),
      });
    } else {
      return NextResponse.json({
        message: "No sku_1 index found",
        indexes,
      });
    }
  } catch (error) {
    console.error("Error fixing database indexes:", error);
    return NextResponse.json(
      {
        error: "Failed to fix database indexes",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
