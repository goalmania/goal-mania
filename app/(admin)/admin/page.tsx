"use client";

import { useState, useEffect } from "react";
import {
  ShoppingCartIcon,
  UserGroupIcon,
  NewspaperIcon,
  ShoppingBagIcon,
  CurrencyEuroIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import AdminCacheControl from "@/app/_components/AdminCacheControl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Stat {
  name: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface RecentOrder {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  itemsCount: number;
}

interface OrderStatus {
  status: string;
  count: number;
}

interface AnalyticsData {
  stats: {
    users: { value: number };
    products: { value: number };
    orders: { value: number };
    articles: { value: number };
  };
  revenue: {
    total: number;
    average: number;
  };
  recentOrders: RecentOrder[];
  orderStatuses: OrderStatus[];
  recentOrdersByDate: Array<{
    _id: string;
    count: number;
    revenue: number;
  }>;
  revenueDataByCategory: Array<{
    name: string;
    value: number;
  }>;
  mysteryBoxOrders: number;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "shipped":
      return "bg-purple-100 text-purple-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return ClockIcon;
    case "processing":
      return ChartBarIcon;
    case "shipped":
      return TruckIcon;
    case "delivered":
      return CheckCircleIcon;
    case "cancelled":
      return XCircleIcon;
    default:
      return ExclamationTriangleIcon;
  }
};

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/analytics");

        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }

        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatCurrencyForChart = (value: any) => {
    return formatCurrency(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-8 px-4 py-8 sm:px-8 bg-[#f5f6fa] min-h-screen">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f5f6fa]">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  const stats: Stat[] = [
    {
      name: "Total Revenue",
      value: formatCurrency(data.revenue.total),
      icon: CurrencyEuroIcon,
      description: "All time revenue",
    },
    {
      name: "Total Orders",
      value: data.stats.orders.value,
      icon: ShoppingCartIcon,
      description: "Orders placed",
    },
    {
      name: "Active Users",
      value: data.stats.users.value,
      icon: UserGroupIcon,
      description: "Registered users",
    },
    {
      name: "Products",
      value: data.stats.products.value,
      icon: ShoppingBagIcon,
      description: "Available products",
    },
  ];

  const chartData = data.recentOrdersByDate.map(item => ({
    date: item._id,
    orders: item.count,
    revenue: item.revenue,
  }));

  return (
    <>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#0e1924] tracking-tight">Dashboard</h1>
        <p className="mt-2 text-base text-gray-700 max-w-2xl">
          Welcome back! Here&apos;s an overview of your store performance and insights.
        </p>
      </div>

      {/* Cache Control Section */}
      <AdminCacheControl />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-[#f5963c]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0e1924]">{stat.value}</div>
              {stat.description && (
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend (Last 7 Days)</CardTitle>
                <CardDescription>
                  Daily revenue and order count
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={formatCurrencyForChart} />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#f5963c" 
                          strokeWidth={2}
                          dot={{ fill: "#f5963c" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No recent data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
                <CardDescription>
                  Current order status breakdown
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.orderStatuses.map((status) => {
                  const Icon = getStatusIcon(status.status);
                  const percentage = (status.count / data.stats.orders.value) * 100;
                  
                  return (
                    <div key={status.status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium capitalize">
                            {status.status}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {status.count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#0e1924]">
                  {formatCurrency(data.revenue.average)}
                </div>
                <p className="text-xs text-gray-500 mt-1">Per order</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Mystery Box Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#0e1924]">
                  {data.mysteryBoxOrders}
                </div>
                <p className="text-xs text-gray-500 mt-1">Special orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Published Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#0e1924]">
                  {data.stats.articles.value}
                </div>
                <p className="text-xs text-gray-500 mt-1">Content pieces</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Latest 5 orders from your store
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {data.recentOrders.map((order) => {
                    const Icon = getStatusIcon(order.status);
                    
                    return (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Icon className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium text-sm">
                              Order #{order.id.substring(0, 8)}...
                            </p>
                            <p className="text-xs text-gray-500">
                              {order.itemsCount} items • {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">{formatCurrency(order.amount)}</p>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No orders found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Product Categories</CardTitle>
                <CardDescription>
                  Distribution by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.revenueDataByCategory.map((category) => {
                    const percentage = (category.value / data.stats.products.value) * 100;
                    
                    return (
                      <div key={category.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{category.name}</span>
                          <span className="text-sm text-gray-500">
                            {category.value} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common admin tasks
                </CardDescription>
              </CardHeader>
                             <CardContent className="space-y-3">
                 <Button 
                   className="w-full justify-start" 
                   variant="outline"
                   onClick={() => router.push("/admin/products")}
                 >
                   <ShoppingBagIcon className="h-4 w-4 mr-2" />
                   Manage Products
                 </Button>
                 <Button 
                   className="w-full justify-start" 
                   variant="outline"
                   onClick={() => router.push("/admin/orders")}
                 >
                   <ShoppingCartIcon className="h-4 w-4 mr-2" />
                   View All Orders
                 </Button>
                 <Button 
                   className="w-full justify-start" 
                   variant="outline"
                   onClick={() => router.push("/admin/users")}
                 >
                   <UserGroupIcon className="h-4 w-4 mr-2" />
                   Manage Users
                 </Button>
                 <Button 
                   className="w-full justify-start" 
                   variant="outline"
                   onClick={() => router.push("/admin/articles")}
                 >
                   <NewspaperIcon className="h-4 w-4 mr-2" />
                   Create Article
                 </Button>
               </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
