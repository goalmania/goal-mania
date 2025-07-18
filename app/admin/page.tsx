"use client";

import { useState, useEffect } from "react";
import {
  ShoppingCartIcon,
  UserGroupIcon,
  NewspaperIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import AdminCacheControl from "@/app/_components/AdminCacheControl";

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
      <div className="flex justify-center items-center min-h-screen bg-[#f5f6fa]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#0e1924]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 py-8 sm:px-8 bg-[#f5f6fa] min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-[#0e1924] tracking-tight">Dashboard</h1>
        <p className="mt-2 text-base text-gray-700 max-w-2xl">
          Welcome back! Here&apos;s an overview of your store.
        </p>
      </div>

      {/* Cache Control Section */}
      <AdminCacheControl />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 fade-in">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden rounded-2xl shadow-lg transition-transform transform hover:-translate-y-1 hover:shadow-xl border border-gray-100 group"
            style={{ minHeight: 120 }}
          >
            <div className="p-6 flex items-center">
              <div className="flex-shrink-0 rounded-full bg-[#0e1924] p-3 group-hover:bg-[#f5963c] transition-colors duration-300">
                <stat.icon
                  className="h-7 w-7 text-white group-hover:text-[#0e1924] transition-colors duration-300"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-6 w-0 flex-1">
                <dl>
                  <dt className="text-base font-medium text-gray-600 truncate">
                    {stat.name}
                  </dt>
                  <dd>
                    <div className="flex items-baseline mt-2">
                      <p className="text-3xl font-bold text-[#0e1924] group-hover:text-[#f5963c] transition-colors duration-300">
                        {stat.value}
                      </p>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>
      <style jsx global>{`
        .fade-in {
          animation: fadeIn 0.7s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}
