import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import Product from "@/lib/models/Product";
import Article from "@/lib/models/Article";
import Order from "@/models/Order";

// Analytics API with real data from database
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Simplified auth check - just make sure user is logged in
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get real counts from database
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalArticles = await Article.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Calculate revenue distribution based on product categories
    const products = await Product.find();

    // Group products by category and calculate value
    const categoryMap = new Map();

    products.forEach((product) => {
      const category = product.category || "Uncategorized";
      const currentValue = categoryMap.get(category) || 0;
      categoryMap.set(category, currentValue + 1);
    });

    // Convert map to array format needed for the pie chart
    const revenueData = Array.from(categoryMap.entries()).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    // If no products with categories, provide default categories
    if (revenueData.length === 0) {
      revenueData.push(
        { name: "Jerseys", value: 0 },
        { name: "Equipment", value: 0 },
        { name: "Accessories", value: 0 },
        { name: "Footwear", value: 0 }
      );
    }

    return NextResponse.json({
      stats: {
        users: {
          value: totalUsers,
        },
        products: {
          value: totalProducts,
        },
        orders: {
          value: totalOrders,
        },
        articles: {
          value: totalArticles,
        },
      },
      revenueData,
    });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
