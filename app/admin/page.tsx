"use client";

import { useState, useEffect } from "react";
import {
  ShoppingCartIcon,
  UserGroupIcon,
  NewspaperIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import AdminCacheControl from "@/app/components/AdminCacheControl";

interface Stat {
  name: string;
  value: string | number;
  icon: React.ElementType;
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stat[]>([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);

        const response = await fetch("/api/analytics");

        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }

        const data = await response.json();

        // Format stats data
        const statsData: Stat[] = [
          {
            name: "Total Products",
            value: data.stats.products.value,
            icon: ShoppingBagIcon,
          },
          {
            name: "Total Orders",
            value: data.stats.orders.value,
            icon: ShoppingCartIcon,
          },
          {
            name: "Active Users",
            value: data.stats.users.value,
            icon: UserGroupIcon,
          },
          {
            name: "Published Articles",
            value: data.stats.articles.value,
            icon: NewspaperIcon,
          },
        ];

        setStats(statsData);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Welcome back! Here&apos;s an overview of your store.
        </p>
      </div>

      {/* Cache Control Section */}
      <AdminCacheControl />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden rounded-lg shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon
                    className="h-6 w-6 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd>
                      <div className="flex items-baseline">
                        <p className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </p>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
