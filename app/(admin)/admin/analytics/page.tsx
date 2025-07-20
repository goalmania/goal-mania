"use client";

import { useState, useEffect } from "react";
import { ArrowPathIcon, ChartBarIcon, UsersIcon, ShoppingBagIcon, DocumentTextIcon, CurrencyEuroIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface RevenueData {
  name: string;
  value: number;
}

interface AnalyticsData {
  stats: {
    users: { value: number };
    products: { value: number };
    orders: { value: number };
    articles: { value: number };
  };
  revenueDataByCategory: RevenueData[];
  revenue: {
    total: number;
    average: number;
  };
  recentOrders: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    itemsCount: number;
  }>;
  orderStatuses: Array<{
    status: string;
    count: number;
  }>;
  recentOrdersByDate: Array<{
    _id: string;
    count: number;
    revenue: number;
  }>;
  monthlyRevenue: Array<{
    _id: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    _id: string;
    totalSold: number;
    totalRevenue: number;
  }>;
  userRegistrationTrend: Array<{
    _id: string;
    count: number;
  }>;
  mysteryBoxOrders: number;
  conversionRate: number;
}

const COLORS = ["#0e1924", "#f5963c", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#f5963c",
  },
  orders: {
    label: "Orders",
    color: "#0e1924",
  },
  mysteryBox: {
    label: "Mystery Box",
    color: "#8b5cf6",
  },
  users: {
    label: "Users",
    color: "#3b82f6",
  },
  products: {
    label: "Products",
    color: "#10b981",
  },
  registrations: {
    label: "Registrations",
    color: "#06b6d4",
  },
} as const;

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/analytics");

      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const data: AnalyticsData = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    fetchAnalyticsData();
    toast.success("Analytics refreshed");
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatMonth = (dateString: string) => {
    return new Date(dateString + "-01").toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  const { 
    revenueDataByCategory, 
    stats, 
    revenue, 
    recentOrders, 
    orderStatuses, 
    recentOrdersByDate, 
    monthlyRevenue,
    topProducts,
    userRegistrationTrend,
    mysteryBoxOrders,
    conversionRate
  } = analyticsData;

  // Prepare data for charts
  const revenueChartData = recentOrdersByDate.map(item => ({
    date: formatDate(item._id),
    revenue: item.revenue,
    orders: item.count,
  }));

  const monthlyRevenueData = monthlyRevenue.map(item => ({
    month: formatMonth(item._id),
    revenue: item.revenue,
    orders: item.orders,
  }));

  const categoryChartData = revenueDataByCategory.map(item => ({
    name: item.name,
    value: item.value,
  }));

  const statusChartData = orderStatuses.map(item => ({
    status: item.status,
    count: item.count,
  }));

  const userTrendData = userRegistrationTrend.map(item => ({
    date: formatDate(item._id),
    registrations: item.count,
  }));

  const topProductsData = topProducts.slice(0, 8).map(item => ({
    productId: item._id.slice(-8),
    sold: item.totalSold,
    revenue: item.totalRevenue,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Comprehensive overview of your e-commerce performance
          </p>
        </div>
        <Button onClick={refreshData} variant="outline" size="sm">
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            <UsersIcon className="h-5 w-5 text-[#f5963c]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0e1924]">{stats.users.value.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Conversion: {conversionRate.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
            <ShoppingBagIcon className="h-5 w-5 text-[#f5963c]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0e1924]">{stats.products.value.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Across {categoryChartData.length} categories</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
            <ChartBarIcon className="h-5 w-5 text-[#f5963c]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0e1924]">{stats.orders.value.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Avg: {formatCurrency(revenue.average)}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <CurrencyEuroIcon className="h-5 w-5 text-[#f5963c]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0e1924]">{formatCurrency(revenue.total)}</div>
            <p className="text-xs text-gray-500 mt-1">Mystery Box: {mysteryBoxOrders} orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend (30 Days)</CardTitle>
              <CardDescription>Daily revenue and order count</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
                <ComposedChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f5963c" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f5963c" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => [
                          name === "revenue" ? formatCurrency(Number(value)) : value,
                          name === "revenue" ? "Revenue" : "Orders"
                        ]}
                      />
                    }
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f5963c"
                    fill="url(#fillRevenue)"
                    strokeWidth={2}
                  />
                  <Bar yAxisId="right" dataKey="orders" fill="#0e1924" radius={[2, 2, 0, 0]} />
                </ComposedChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Two Column Grid for Medium Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Product Categories</CardTitle>
                <CardDescription>Distribution of products by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
              <PieChart>
                <Pie
                      data={categoryChartData}
                  cx="50%"
                  cy="50%"
                      outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => [`${value} products`, "Count"]}
                        />
                      }
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* User Registration Trend */}
            <Card>
              <CardHeader>
                <CardTitle>User Registration Trend</CardTitle>
                <CardDescription>New user registrations (30 days)</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
                  <AreaChart data={userTrendData}>
                    <defs>
                      <linearGradient id="fillRegistrations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => [`${value} users`, "Registrations"]}
                        />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="registrations"
                      stroke="#06b6d4"
                      fill="url(#fillRegistrations)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Revenue */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue (12 Months)</CardTitle>
              <CardDescription>Revenue and orders by month</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
                <LineChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => [
                          name === "revenue" ? formatCurrency(Number(value)) : value,
                          name === "revenue" ? "Revenue" : "Orders"
                        ]}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f5963c"
                    strokeWidth={3}
                    dot={{ fill: "#f5963c", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#0e1924"
                    strokeWidth={2}
                    dot={{ fill: "#0e1924", strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Two Column Grid for Order Status and Mystery Box */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
                <CardDescription>Current order status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
                  <BarChart data={statusChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => [`${value} orders`, "Count"]}
                        />
                      }
                    />
                    <Bar dataKey="count" fill="#0e1924" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Mystery Box Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Mystery Box Performance</CardTitle>
                <CardDescription>Special feature engagement</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-[300px]">
                <div className="text-center">
                  <div className="text-6xl font-bold text-purple-600 mb-4">
                    {mysteryBoxOrders}
                  </div>
                  <p className="text-lg text-gray-600 mb-2">Mystery Box Orders</p>
                  <p className="text-sm text-gray-500">
                    {((mysteryBoxOrders / stats.orders.value) * 100).toFixed(1)}% of total orders
                  </p>
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-700">
                      Special feature driving engagement
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Detailed revenue breakdown and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="aspect-auto h-[400px] w-full">
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => [
                          name === "revenue" ? formatCurrency(Number(value)) : value,
                          name === "revenue" ? "Revenue" : "Orders"
                        ]}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f5963c"
                    strokeWidth={3}
                    dot={{ fill: "#f5963c", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trend</CardTitle>
              <CardDescription>12-month revenue performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="aspect-auto h-[400px] w-full">
                <AreaChart data={monthlyRevenueData}>
                  <defs>
                    <linearGradient id="fillMonthlyRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f5963c" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f5963c" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f5963c"
                    fill="url(#fillMonthlyRevenue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Category Analysis</CardTitle>
              <CardDescription>Detailed product distribution and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="aspect-auto h-[400px] w-full">
                <BarChart data={categoryChartData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => [`${value} products`, "Count"]}
                      />
                    }
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Products by units sold</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="aspect-auto h-[400px] w-full">
                <BarChart data={topProductsData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="productId" type="category" width={80} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => [
                          name === "revenue" ? formatCurrency(Number(value)) : value,
                          name === "revenue" ? "Revenue" : "Units Sold"
                        ]}
                      />
                    }
                  />
                  <Bar dataKey="sold" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Status Overview</CardTitle>
              <CardDescription>Current order processing status</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="aspect-auto h-[400px] w-full">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => [`${value} orders`, "Count"]}
                      />
                    }
                  />
              </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest order activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Order #{order.id.slice(-8)}</p>
                      <p className="text-sm text-gray-500">
                        {order.itemsCount} items • {formatDate(order.createdAt)}
                      </p>
            </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.amount)}</p>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
        </div>
      </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Registration Trend</CardTitle>
              <CardDescription>New user registrations over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="aspect-auto h-[400px] w-full">
                <AreaChart data={userTrendData}>
                  <defs>
                    <linearGradient id="fillUserRegistrations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => [`${value} users`, "Registrations"]}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="registrations"
                    stroke="#06b6d4"
                    fill="url(#fillUserRegistrations)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Metrics</CardTitle>
              <CardDescription>Key user performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.users.value.toLocaleString()}</div>
                  <p className="text-sm text-blue-600">Total Users</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{conversionRate.toFixed(1)}%</div>
                  <p className="text-sm text-green-600">Conversion Rate</p>
          </div>
        </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Users to Orders Ratio</span>
                  <span className="text-sm font-medium">1:{stats.orders.value > 0 ? (stats.orders.value / stats.users.value).toFixed(1) : '0'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Revenue per User</span>
                  <span className="text-sm font-medium">{formatCurrency(stats.users.value > 0 ? revenue.total / stats.users.value : 0)}</span>
        </div>
      </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
