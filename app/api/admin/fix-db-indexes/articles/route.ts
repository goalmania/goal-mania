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

    // Get the articles collection directly using Mongoose connection
    const db = mongoose.connection.db;

    if (!db) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const articlesCollection = db.collection("articles");

    // Get all indexes in the articles collection
    const indexes = await articlesCollection.indexes();

    // Check for any potentially problematic unique indexes
    const problematicIndexes = indexes.filter((index) => {
      // Skip _id index and slug index as those should be unique
      return (
        index.unique === true &&
        index.name !== "_id_" &&
        index.name !== "slug_1"
      );
    });

    if (problematicIndexes.length > 0) {
      // Drop all problematic indexes
      for (const index of problematicIndexes) {
        if (index.name) {
          await articlesCollection.dropIndex(index.name);
        }
      }

      return NextResponse.json({
        message: `Successfully removed ${problematicIndexes.length} problematic indexes`,
        removedIndexes: problematicIndexes,
        beforeIndexes: indexes,
        currentIndexes: await articlesCollection.indexes(),
      });
    } else {
      return NextResponse.json({
        message: "No problematic indexes found in articles collection",
        indexes,
      });
    }
  } catch (error) {
    console.error("Error fixing article indexes:", error);
    return NextResponse.json(
      {
        error: "Failed to fix article indexes",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
