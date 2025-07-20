import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import Product from "@/lib/models/Product";
import Article from "@/lib/models/Article";
import Order from "@/models/Order";

// Enhanced Analytics API with comprehensive data for admin dashboard
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

    // Get recent orders (last 5)
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Calculate order status distribution
    const orderStatuses = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate total revenue
    const revenueData = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          averageOrderValue: { $avg: "$amount" }
        }
      }
    ]);

    // Get orders by date (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrdersByDate = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 },
          revenue: { $sum: "$amount" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Calculate product categories distribution
    const products = await Product.find();
    const categoryMap = new Map();

    products.forEach((product) => {
      const category = product.category || "Uncategorized";
      const currentValue = categoryMap.get(category) || 0;
      categoryMap.set(category, currentValue + 1);
    });

    const revenueDataByCategory = Array.from(categoryMap.entries()).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    // If no products with categories, provide default categories
    if (revenueDataByCategory.length === 0) {
      revenueDataByCategory.push(
        { name: "Jerseys", value: 0 },
        { name: "Equipment", value: 0 },
        { name: "Accessories", value: 0 },
        { name: "Footwear", value: 0 }
      );
    }

    // Get mystery box orders count
    const mysteryBoxOrders = await Order.countDocuments({
      "items.customization.excludedShirts": { $exists: true, $ne: [] }
    });

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
      revenue: {
        total: revenueData[0]?.totalRevenue || 0,
        average: revenueData[0]?.averageOrderValue || 0,
      },
      recentOrders: recentOrders.map(order => ({
        id: order._id,
        amount: order.amount,
        status: order.status,
        createdAt: order.createdAt,
        itemsCount: order.items.length,
      })),
      orderStatuses: orderStatuses.map(status => ({
        status: status._id,
        count: status.count,
      })),
      recentOrdersByDate,
      revenueDataByCategory,
      mysteryBoxOrders,
    });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
