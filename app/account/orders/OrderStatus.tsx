"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Order {
  _id: string;
  status: string;
  trackingCode?: string;
  createdAt: string;
}

export function OrderStatus() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [timeElapsed, setTimeElapsed] = useState(0);
  const isSuccess = searchParams?.get("success") === "true";
  const [recentShippedOrder, setRecentShippedOrder] = useState<Order | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Fetch recent shipped orders with tracking codes
  useEffect(() => {
    const fetchRecentShippedOrder = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/orders/user");

        if (response.ok) {
          const orders = await response.json();
          // Find the most recent shipped order with a tracking code
          const shippedOrder = orders.find(
            (order: Order) => order.status === "shipped" && order.trackingCode
          );

          if (shippedOrder) {
            setRecentShippedOrder(shippedOrder);
          }
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentShippedOrder();
  }, []);

  useEffect(() => {
    if (!isSuccess) return;

    const interval = setInterval(() => {
      setTimeElapsed((prev) => {
        if (prev >= 10) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSuccess]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleContinueShopping = () => {
    router.push("/shop");
  };

  const handleViewOrder = (orderId: string) => {
    // Clear success parameter and refresh the page to show the order details
    router.replace("/account/orders");
    // Small delay to ensure the page refreshes before trying to open the order
    setTimeout(() => {
      // This is a workaround - in a real app you'd use a more elegant solution
      // like storing the selected order ID in state or context
      window.location.href = `/account/orders?view=${orderId}`;
    }, 100);
  };

  // Show tracking notification for recently shipped order
  if (recentShippedOrder?.trackingCode && !isSuccess) {
    return (
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
            <div>
              <h3 className="text-blue-800 font-medium">
                Your order has been shipped!
              </h3>
              <p className="text-blue-600 text-sm">
                Tracking number: {recentShippedOrder.trackingCode}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleViewOrder(recentShippedOrder._id)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            View Order
          </button>
        </div>
      </div>
    );
  }

  if (!isSuccess) return null;

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-indigo-800 font-medium">Order Processing</h3>
          <p className="text-indigo-600 text-sm">
            {timeElapsed < 10
              ? "Your order is being processed. Please wait a moment..."
              : "It's taking longer than expected. You may need to refresh."}
          </p>
        </div>
        <div className="flex space-x-2">
          {timeElapsed >= 5 && (
            <button
              onClick={handleRefresh}
              className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
            >
              Refresh
            </button>
          )}
          <button
            onClick={handleContinueShopping}
            className="px-3 py-1 bg-white border border-indigo-300 text-indigo-700 text-sm rounded hover:bg-indigo-50"
          >
            Continue Shopping
          </button>
        </div>
      </div>
      {timeElapsed < 10 && (
        <div className="mt-2 w-full bg-indigo-100 rounded-full h-1.5">
          <div
            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(timeElapsed / 10) * 100}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
