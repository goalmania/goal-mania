import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";

export async function GET() {
  try {
    await connectDB();
    
    // Get all mystery box products
    const mysteryBoxProducts = await Product.find({ isMysteryBox: true }).lean();
    
    // Get all products to see what's in the database
    const allProducts = await Product.find({}).select('_id title isMysteryBox category').lean();
    
    return NextResponse.json({
      mysteryBoxProducts: mysteryBoxProducts.map(p => ({
        id: p._id,
        title: p.title,
        isMysteryBox: p.isMysteryBox,
        category: p.category
      })),
      allProducts: allProducts.map(p => ({
        id: p._id,
        title: p.title,
        isMysteryBox: p.isMysteryBox,
        category: p.category
      })),
      mysteryBoxCount: mysteryBoxProducts.length,
      totalProducts: allProducts.length
    });
  } catch (error) {
    console.error("Error testing mystery box products:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 