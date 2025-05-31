"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { OrderStatus } from "./OrderStatus";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  customization?: {
    name?: string;
    number?: string;
    selectedPatches?: Array<{
      id: string;
      name: string;
      image: string;
      price?: number;
    }>;
    includeShorts?: boolean;
    includeSocks?: boolean;
    isPlayerEdition?: boolean;
    size?: string;
    isKidSize?: boolean;
    hasCustomization?: boolean;
  };
}

interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  coupon?: {
    code: string;
    discountPercentage: number;
    discountAmount: number;
  };
  trackingCode?: string;
  createdAt: string;
  updatedAt: string;
}

function OrdersContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [refreshAttempts, setRefreshAttempts] = useState(0);
  const isSuccess = searchParams?.get("success") === "true";
  const viewOrderId = searchParams?.get("view");
  const hasRefreshedRef = useRef(false);

  // Check for success parameter
  useEffect(() => {
    if (isSuccess) {
      toast.success("Order placed successfully!");

      // Clear the success parameter after showing the toast
      if (hasRefreshedRef.current) {
        router.replace("/account/orders", { scroll: false });
      }
    }
  }, [isSuccess, router]);

  // Fetch user's orders
  useEffect(() => {
    if (status === "authenticated") {
      fetchOrders();
    } else if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/account/orders");
    }
  }, [status, router]);

  // Auto-refresh when success=true is present
  useEffect(() => {
    if (
      isSuccess &&
      orders.length === 0 &&
      refreshAttempts < 2 &&
      !hasRefreshedRef.current
    ) {
      const timer = setTimeout(() => {
        fetchOrders();
        setRefreshAttempts((prev) => prev + 1);
        hasRefreshedRef.current = true;
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, orders.length, refreshAttempts]);

  // Open order details when view parameter is present
  useEffect(() => {
    if (viewOrderId && orders.length > 0) {
      const orderToView = orders.find((order) => order._id === viewOrderId);
      if (orderToView) {
        handleViewDetails(orderToView);
        // Clear the view parameter after opening the modal
        router.replace("/account/orders", { scroll: false });
      }
    }
  }, [viewOrderId, orders, router]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/orders/user");

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel order");
      }

      toast.success("Order cancelled successfully");
      fetchOrders();
      setIsDetailsModalOpen(false);
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-black">My Orders</h1>

      {/* Show order status when success=true */}
      <OrderStatus />

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 mb-4">
            You haven't placed any orders yet.
          </p>
          <button
            onClick={() => router.push("/shop")}
            className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider"
                  >
                    Order ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider"
                  >
                    Total
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {order._id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      €{order.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View Details
                        </button>

                        {order.status === "shipped" && order.trackingCode && (
                          <a
                            href={`https://www.packagetrackr.com/track/${order.trackingCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 7.586V3a1 1 0 10-2 0v4.586l-.293-.293z" />
                              <path d="M3 5a2 2 0 012-2h1a1 1 0 010 2H5v7h2l1 2h4l1-2h2V5h-1a1 1 0 110-2h1a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                            </svg>
                            Track Package
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {isDetailsModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-black">
                Order Details
              </h2>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-black hover:text-gray-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-black">
                Order placed on {formatDate(selectedOrder.createdAt)}
              </p>
              <p className="text-sm text-black">
                Order ID: <span className="font-mono">{selectedOrder._id}</span>
              </p>
              <div className="mt-2">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status.charAt(0).toUpperCase() +
                    selectedOrder.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <h3 className="font-medium text-black mb-2">Items</h3>
              <div className="space-y-4">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex flex-col">
                    <div className="flex items-center">
                      {item.image && (
                        <div className="relative w-16 h-16 mr-4 rounded-md overflow-hidden border border-gray-200">
                          <Image
                            src={item.image || "/placeholder.png"}
                            alt={item.name}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-black">{item.name}</p>
                        <p className="text-sm text-black">
                          €{item.price.toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-black">
                        €{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {item.customization && (
                      <div className="ml-20 mt-2 bg-gray-50 p-3 rounded-md">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Customizations
                        </h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          {item.customization.size && (
                            <div className="flex justify-between">
                              <span className="text-black">Size:</span>
                              <span className="text-black font-medium">
                                {item.customization.size}{" "}
                                {item.customization.isKidSize ? "(Kid)" : ""}
                              </span>
                            </div>
                          )}

                          {item.customization.name && (
                            <div className="flex justify-between">
                              <span className="text-black">Name:</span>
                              <span className="text-black font-medium">
                                {item.customization.name}
                              </span>
                            </div>
                          )}

                          {item.customization.number && (
                            <div className="flex justify-between">
                              <span className="text-black">Number:</span>
                              <span className="text-black font-medium">
                                {item.customization.number}
                              </span>
                            </div>
                          )}

                          {item.customization.isPlayerEdition && (
                            <div className="flex justify-between col-span-2">
                              <span className="text-black">
                                Player Edition:
                              </span>
                              <span className="text-black font-medium">
                                Yes
                              </span>
                            </div>
                          )}

                          {item.customization.includeShorts && (
                            <div className="flex justify-between col-span-2">
                              <span className="text-black">
                                Includes Shorts:
                              </span>
                              <span className="text-black font-medium">
                                Yes
                              </span>
                            </div>
                          )}

                          {item.customization.includeSocks && (
                            <div className="flex justify-between col-span-2">
                              <span className="text-black">
                                Includes Socks:
                              </span>
                              <span className="text-black font-medium">
                                Yes
                              </span>
                            </div>
                          )}

                          {item.customization.selectedPatches &&
                            item.customization.selectedPatches.length > 0 && (
                              <div className="col-span-2 mt-2">
                                <p className="text-black mb-1">Patches:</p>
                                <div className="flex flex-wrap gap-2">
                                  {item.customization.selectedPatches.map(
                                    (patch) => (
                                      <div
                                        key={patch.id}
                                        className="flex items-center bg-white p-1 px-2 rounded border"
                                      >
                                        <span className="text-sm text-black">
                                          {patch.name}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <h3 className="font-medium text-black mb-2">Shipping Address</h3>
              <p className="text-black">
                {selectedOrder.shippingAddress.street}
              </p>
              <p className="text-black">
                {selectedOrder.shippingAddress.city},{" "}
                {selectedOrder.shippingAddress.state}{" "}
                {selectedOrder.shippingAddress.postalCode}
              </p>
              <p className="text-black">
                {selectedOrder.shippingAddress.country}
              </p>
            </div>

            {selectedOrder.trackingCode && (
              <div className="border-t border-gray-200 pt-4 mb-6">
                <h3 className="font-medium text-black mb-2">
                  Tracking Information
                </h3>
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-500 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 7.586V3a1 1 0 10-2 0v4.586l-.293-.293z" />
                      <path d="M3 5a2 2 0 012-2h1a1 1 0 010 2H5v7h2l1 2h4l1-2h2V5h-1a1 1 0 110-2h1a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                    </svg>
                    <p className="text-blue-700 font-medium">
                      Tracking Number: {selectedOrder.trackingCode}
                    </p>
                  </div>
                  <p className="text-sm text-blue-600 mt-2">
                    You can use this tracking number to follow your package's
                    journey.
                  </p>
                  <div className="mt-3">
                    <a
                      href={`https://www.packagetrackr.com/track/${selectedOrder.trackingCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Track My Package
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4 mb-6">
              <h3 className="font-medium text-black mb-2">Payment Summary</h3>
              <div className="flex justify-between mb-2">
                <p className="text-black">Subtotal</p>
                <p className="text-black">€{selectedOrder.amount.toFixed(2)}</p>
              </div>

              {selectedOrder.coupon && (
                <div className="flex justify-between mb-2 text-green-600">
                  <p>
                    Discount
                    {` (${selectedOrder.coupon.code} - ${selectedOrder.coupon.discountPercentage}%)`}
                  </p>
                  <p>-€{selectedOrder.coupon.discountAmount.toFixed(2)}</p>
                </div>
              )}

              <div className="flex justify-between font-semibold text-lg mt-2 pt-2 border-t">
                <p className="text-black">Total</p>
                <p className="text-black">€{selectedOrder.amount.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                Close
              </button>

              {/* Only show cancel button if order is pending or processing */}
              {(selectedOrder.status === "pending" ||
                selectedOrder.status === "processing") && (
                <button
                  onClick={() => handleCancelOrder(selectedOrder._id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Loading fallback for Suspense
function OrdersLoading() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-black">My Orders</h1>
      <div className="flex justify-center items-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersLoading />}>
      <OrdersContent />
    </Suspense>
  );
}
