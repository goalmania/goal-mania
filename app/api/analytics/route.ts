import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import Product from "@/lib/models/Product";
import Article from "@/lib/models/Article";
import Order from "@/models/Order";
import { AnalyticsCache } from "@/lib/cache";

// Enhanced Analytics API with comprehensive data for admin dashboard and optimized performance
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Simplified auth check - just make sure user is logged in
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check cache first
    const cacheKey = AnalyticsCache.createKey('dashboard', new Date().toDateString());
    const cachedData = AnalyticsCache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
          'X-Cache': 'HIT'
        }
      });
    }

    await connectDB();

    // Define date ranges once
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Execute all database operations in parallel using Promise.all
    const [
      totalUsers,
      totalProducts, 
      totalArticles,
      totalOrders,
      recentOrders,
      orderStatuses,
      revenueData,
      recentOrdersByDate,
      monthlyRevenue,
      mysteryBoxOrders,
      topProducts,
      userRegistrationTrend,
      categoryData
    ] = await Promise.all([
      // Basic counts with lean queries
      User.countDocuments(),
      Product.countDocuments(),
      Article.countDocuments(),
      Order.countDocuments(),

      // Recent orders with field selection
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .select('_id amount status createdAt items')
        .lean(),

      // Order statuses aggregation
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // Revenue aggregation
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amount" },
            averageOrderValue: { $avg: "$amount" }
          }
        }
      ]),

      // Recent orders by date
      Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
            revenue: { $sum: "$amount" }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Monthly revenue
      Order.aggregate([
        { $match: { createdAt: { $gte: twelveMonthsAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            revenue: { $sum: "$amount" },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Mystery box orders count
      Order.countDocuments({
        "items.customization.excludedShirts": { $exists: true, $ne: [] }
      }),

      // Top selling products
      Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            totalSold: { $sum: "$items.quantity" },
            totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 }
      ]),

      // User registration trend
      User.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Product categories - optimized aggregation instead of loading all products
      Product.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    // Process category data
    const revenueDataByCategory = categoryData.length > 0 
      ? categoryData.map(({ _id, count }) => ({ name: _id || "Uncategorized", value: count }))
      : [
          { name: "Jerseys", value: 0 },
          { name: "Equipment", value: 0 },
          { name: "Accessories", value: 0 },
          { name: "Footwear", value: 0 }
        ];

    // Calculate conversion rate (orders / users)
    const conversionRate = totalUsers > 0 ? (totalOrders / totalUsers) * 100 : 0;

    // Calculate additional Shopify-style metrics
    const averageOrderValue = revenueData[0]?.averageOrderValue || 0;
    const totalRevenue = revenueData[0]?.totalRevenue || 0;
    const customerLifetimeValue = totalUsers > 0 ? totalRevenue / totalUsers : 0;
    const repeatCustomerRate = 0; // This would need additional tracking
    const cartAbandonmentRate = 0; // This would need additional tracking

    const analyticsData = {
      stats: {
        users: { value: totalUsers },
        products: { value: totalProducts },
        orders: { value: totalOrders },
        articles: { value: totalArticles },
      },
      revenue: {
        total: totalRevenue,
        average: averageOrderValue,
      },
      recentOrders: recentOrders.map(order => ({
        id: order._id,
        amount: order.amount,
        status: order.status,
        createdAt: order.createdAt,
        itemsCount: order.items?.length || 0,
      })),
      orderStatuses: orderStatuses.map(status => ({
        status: status._id,
        count: status.count,
      })),
      recentOrdersByDate,
      monthlyRevenue,
      revenueDataByCategory,
      mysteryBoxOrders,
      topProducts,
      userRegistrationTrend,
      conversionRate,
      // Shopify-style metrics
      averageOrderValue,
      customerLifetimeValue,
      repeatCustomerRate,
      cartAbandonmentRate,
    };

    // Cache the results for 30 minutes
    AnalyticsCache.set(cacheKey, analyticsData);

    return NextResponse.json(analyticsData, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        'X-Cache': 'MISS'
      }
    });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
