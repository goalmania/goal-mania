"use client";

import { useState } from "react";
import { MagnifyingGlassIcon, EyeIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import toast from "react-hot-toast";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  productId?: string;
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
  createdAt: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  refunded?: boolean;
  refundedAt?: string;
  paymentIntentId?: string;
  trackingCode?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface OrdersManagerProps {
  initialOrders: Order[];
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrdersManager({ initialOrders }: OrdersManagerProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [isRefunding, setIsRefunding] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [isSavingTracking, setIsSavingTracking] = useState(false);
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  // Load user data for orders
  const loadUserData = async (userId: string) => {
    if (users[userId]) return;

    try {
      console.log(`Loading user data for userId: ${userId}`);
      const response = await fetch(`/api/users/${userId}`);

      if (!response.ok) {
        console.error(`Failed to load user data: ${response.status}`);
        // Set a placeholder to avoid repeated failed requests
        setUsers((prev) => ({
          ...prev,
          [userId]: {
            id: userId,
            name: "Unknown User",
            email: "Not Available",
          },
        }));
        return;
      }

      const userData = await response.json();
      console.log(`User data loaded:`, userData);

      if (userData && userData.user) {
        setUsers((prev) => ({
          ...prev,
          [userId]: userData.user,
        }));
      } else {
        // Handle missing user data
        setUsers((prev) => ({
          ...prev,
          [userId]: {
            id: userId,
            name: "Unknown User",
            email: "Not Available",
          },
        }));
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
      // Set a placeholder to avoid repeated failed requests
      setUsers((prev) => ({
        ...prev,
        [userId]: { id: userId, name: "Unknown User", email: "Not Available" },
      }));
    }
  };

  // Filter orders based on search term and status filter
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (users[order.userId]?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (users[order.userId]?.email || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter ? order.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  // Load user data for visible orders
  orders.forEach((order) => {
    if (!users[order.userId]) {
      loadUserData(order.userId);
    }
  });

  const handleStatusChange = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const { order: updatedOrder } = await response.json();

        // Update orders state with the updated order
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? updatedOrder : order
          )
        );
      } else {
        const error = await response.json();
        console.error("Failed to update order status:", error);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setTrackingCode(order.trackingCode || "");
    setIsDetailsModalOpen(true);

    // Debug: Log the complete order details to console
    console.log("Complete order details:", order);
    console.log("Order items:", order.items);
    if (order.items[0]?.customization) {
      console.log("First item customization:", order.items[0].customization);
    }
  };

  const handleRefund = async (orderId: string) => {
    if (!selectedOrder || !selectedOrder.paymentIntentId) {
      toast.error("Cannot process refund: Missing payment information");
      return;
    }

    setIsRefunding(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentIntentId: selectedOrder.paymentIntentId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to process refund");
      }

      const { order: updatedOrder } = await response.json();

      // Update orders state with the updated order
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? updatedOrder : order
        )
      );

      // Update selected order
      setSelectedOrder(updatedOrder);

      toast.success("Refund processed successfully");
    } catch (error) {
      console.error("Error processing refund:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to process refund"
      );
    } finally {
      setIsRefunding(false);
    }
  };

  const handleTrackingCodeUpdate = async () => {
    if (!selectedOrder) return;

    setIsSavingTracking(true);
    try {
      const response = await fetch(`/api/orders/${selectedOrder._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trackingCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update tracking code");
      }

      const { order: updatedOrder } = await response.json();

      // Update orders state with the updated order
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === selectedOrder._id ? updatedOrder : order
        )
      );

      // Update selected order
      setSelectedOrder(updatedOrder);

      toast.success("Tracking code updated successfully");
    } catch (error) {
      console.error("Error updating tracking code:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update tracking code"
      );
    } finally {
      setIsSavingTracking(false);
    }
  };

  const handleSendShippingNotification = async () => {
    if (
      !selectedOrder ||
      !selectedOrder.trackingCode ||
      selectedOrder.status !== "shipped"
    ) {
      toast.error(
        "Order must be shipped and have a tracking code to send notification"
      );
      return;
    }

    setIsSendingNotification(true);
    try {
      const response = await fetch(
        `/api/orders/${selectedOrder._id}/notify-shipping`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send notification");
      }

      const data = await response.json();
      toast.success(`Shipping notification sent to ${data.sentTo}`);
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send shipping notification"
      );
    } finally {
      setIsSendingNotification(false);
    }
  };

  // Render function for the customer column
  const renderCustomer = (userId: string) => {
    // Load user data if not already loaded
    if (!users[userId]) {
      loadUserData(userId);
      return (
        <div className="flex items-center">
          <div className="h-4 w-4 mr-2 rounded-full animate-pulse bg-gray-200"></div>
          <span className="text-gray-500">Loading...</span>
        </div>
      );
    }

    const user = users[userId];
    return (
      <div>
        <div className="font-medium text-gray-900">{user.name}</div>
        <div className="text-gray-500 text-sm">{user.email}</div>
      </div>
    );
  };

  return (
    <>
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </div>
            <input
              type="text"
              placeholder="Search orders by ID, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <select
            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        {isLoading && (
          <div className="p-4 text-center text-sm text-gray-500">
            Loading...
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No orders found
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  Order ID
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Customer
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Total
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Status
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order._id.substring(order._id.length - 8)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {renderCustomer(order.userId)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">
                    €{Number(order.amount).toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(
                          order._id,
                          e.target.value as Order["status"]
                        )
                      }
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        statusColors[order.status as keyof typeof statusColors]
                      }`}
                      disabled={isLoading || order.status === "cancelled"}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    {order.refunded && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Refunded
                      </span>
                    )}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="text-indigo-600 hover:text-indigo-900"
                      disabled={isLoading}
                    >
                      <EyeIcon className="h-5 w-5" />
                      <span className="sr-only">View details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Details Modal */}
      {isDetailsModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-10">
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Order Details - {selectedOrder._id}
                  </h3>

                  {/* Customer Information */}
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900">Customer</h4>
                    <div className="mt-2 text-sm text-black">
                      <p>
                        Name:{" "}
                        {users[selectedOrder.userId]?.name || "Loading..."}
                      </p>
                      <p>
                        Email:{" "}
                        {users[selectedOrder.userId]?.email || "Loading..."}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mt-6 space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900">Items</h4>
                      <ul className="mt-2 divide-y divide-gray-200">
                        {selectedOrder.items.map((item, index) => (
                          <li key={index} className="flex flex-col py-4">
                            <div className="flex">
                              <div className="ml-4 flex flex-1 flex-col">
                                <div className="flex justify-between">
                                  <div>
                                    <h5 className="text-sm font-medium text-gray-900">
                                      {item.name}
                                    </h5>
                                    <p className="text-sm text-black">
                                      Qty: {item.quantity}
                                    </p>
                                    {item.productId && (
                                      <p className="text-xs text-black">
                                        Product ID: {item.productId}
                                      </p>
                                    )}
                                  </div>
                                  <p className="text-sm font-medium text-gray-900">
                                    €{Number(item.price).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {item.customization && (
                              <div className="ml-4 mt-2 bg-gray-50 p-3 rounded-md">
                                <h5 className="text-xs font-medium text-gray-700 mb-2">
                                  Customizations
                                </h5>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                  {item.customization.size && (
                                    <div className="flex justify-between">
                                      <span className="text-black">Size:</span>
                                      <span className="text-gray-900 font-medium">
                                        {item.customization.size}{" "}
                                        {item.customization.isKidSize
                                          ? "(Kid)"
                                          : ""}
                                      </span>
                                    </div>
                                  )}

                                  {item.customization.name && (
                                    <div className="flex justify-between">
                                      <span className="text-black">Name:</span>
                                      <span className="text-gray-900 font-medium">
                                        {item.customization.name}
                                      </span>
                                    </div>
                                  )}

                                  {item.customization.number && (
                                    <div className="flex justify-between">
                                      <span className="text-black">
                                        Number:
                                      </span>
                                      <span className="text-gray-900 font-medium">
                                        {item.customization.number}
                                      </span>
                                    </div>
                                  )}

                                  {item.customization.isPlayerEdition && (
                                    <div className="flex justify-between col-span-2">
                                      <span className="text-black">
                                        Player Edition:
                                      </span>
                                      <span className="text-gray-900 font-medium">
                                        Yes
                                      </span>
                                    </div>
                                  )}

                                  {item.customization.includeShorts && (
                                    <div className="flex justify-between col-span-2">
                                      <span className="text-black">
                                        Includes Shorts:
                                      </span>
                                      <span className="text-gray-900 font-medium">
                                        Yes
                                      </span>
                                    </div>
                                  )}

                                  {item.customization.includeSocks && (
                                    <div className="flex justify-between col-span-2">
                                      <span className="text-black">
                                        Includes Socks:
                                      </span>
                                      <span className="text-gray-900 font-medium">
                                        Yes
                                      </span>
                                    </div>
                                  )}

                                  {item.customization.hasCustomization && (
                                    <div className="flex justify-between col-span-2">
                                      <span className="text-black">
                                        Custom Design:
                                      </span>
                                      <span className="text-gray-900 font-medium">
                                        Yes
                                      </span>
                                    </div>
                                  )}

                                  {item.customization.selectedPatches &&
                                    item.customization.selectedPatches.length >
                                      0 && (
                                      <div className="col-span-2 mt-2">
                                        <p className="text-black mb-1">
                                          Patches:
                                        </p>
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

                                  {/* Display all other customization fields as key-value pairs */}
                                  {Object.entries(item.customization).map(
                                    ([key, value]) => {
                                      // Skip fields we've already handled above
                                      if (
                                        [
                                          "size",
                                          "name",
                                          "number",
                                          "isPlayerEdition",
                                          "includeShorts",
                                          "includeSocks",
                                          "hasCustomization",
                                          "isKidSize",
                                          "selectedPatches",
                                        ].includes(key) ||
                                        value === undefined ||
                                        value === null ||
                                        value === ""
                                      ) {
                                        return null;
                                      }

                                      // Format the key for display
                                      const formattedKey = key
                                        .replace(/([A-Z])/g, " $1")
                                        .replace(/^./, (str) =>
                                          str.toUpperCase()
                                        );

                                      return (
                                        <div
                                          key={key}
                                          className="flex justify-between col-span-2"
                                        >
                                          <span className="text-black">
                                            {formattedKey}:
                                          </span>
                                          <span className="text-gray-900 font-medium">
                                            {typeof value === "boolean"
                                              ? value
                                                ? "Yes"
                                                : "No"
                                              : typeof value === "object"
                                              ? JSON.stringify(value)
                                              : String(value)}
                                          </span>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Shipping Address */}
                    {selectedOrder.shippingAddress && (
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Shipping Address
                        </h4>
                        <address className="mt-2 not-italic text-sm text-black">
                          {selectedOrder.shippingAddress.street}
                          <br />
                          {selectedOrder.shippingAddress.city},{" "}
                          {selectedOrder.shippingAddress.state}{" "}
                          {selectedOrder.shippingAddress.postalCode}
                          <br />
                          {selectedOrder.shippingAddress.country}
                        </address>
                      </div>
                    )}

                    {/* Tracking Code */}
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Tracking Code
                      </h4>
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="text"
                          value={trackingCode}
                          onChange={(e) => setTrackingCode(e.target.value)}
                          placeholder="Enter tracking code"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                        <button
                          onClick={handleTrackingCodeUpdate}
                          disabled={isSavingTracking}
                          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                          {isSavingTracking ? "Saving..." : "Save"}
                        </button>
                      </div>
                      {selectedOrder.trackingCode && (
                        <div className="mt-2">
                          <p className="text-sm text-black">
                            Current tracking code: {selectedOrder.trackingCode}
                          </p>
                          {selectedOrder.status === "shipped" && (
                            <button
                              onClick={handleSendShippingNotification}
                              disabled={isSendingNotification}
                              className="mt-2 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20"
                            >
                              {isSendingNotification
                                ? "Sending..."
                                : "Send Shipping Notification to Customer"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Cancellation Information */}
                    {selectedOrder.status === "cancelled" && (
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Cancellation Details
                        </h4>
                        <div className="mt-2 text-sm text-gray-500">
                          <p>
                            Cancelled on:{" "}
                            {selectedOrder.cancelledAt
                              ? new Date(
                                  selectedOrder.cancelledAt
                                ).toLocaleString()
                              : "N/A"}
                          </p>
                          <p>
                            Reason: {selectedOrder.cancellationReason || "N/A"}
                          </p>
                          <p>
                            Refunded:{" "}
                            {selectedOrder.refunded ? (
                              <span className="text-green-600">Yes</span>
                            ) : (
                              <span className="text-red-600">No</span>
                            )}
                          </p>
                          {selectedOrder.refundedAt && (
                            <p>
                              Refunded on:{" "}
                              {new Date(
                                selectedOrder.refundedAt
                              ).toLocaleString()}
                            </p>
                          )}
                        </div>
                        {!selectedOrder.refunded &&
                          selectedOrder.paymentIntentId && (
                            <button
                              type="button"
                              onClick={() => handleRefund(selectedOrder._id)}
                              disabled={isRefunding}
                              className="mt-2 inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
                            >
                              {isRefunding ? "Processing..." : "Process Refund"}
                            </button>
                          )}
                      </div>
                    )}

                    {/* Order Status */}
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Order Status
                      </h4>
                      <div className="mt-2">
                        <select
                          value={selectedOrder.status}
                          onChange={(e) =>
                            handleStatusChange(
                              selectedOrder._id,
                              e.target.value as Order["status"]
                            )
                          }
                          className={`rounded-md px-3 py-2 text-sm font-semibold ${
                            statusColors[
                              selectedOrder.status as keyof typeof statusColors
                            ]
                          }`}
                          disabled={
                            isLoading || selectedOrder.status === "cancelled"
                          }
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          Total
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          €{Number(selectedOrder.amount).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Debug section - only visible in development */}
                    {process.env.NODE_ENV === "development" && (
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <h4 className="font-medium text-gray-900">
                          Debug Tools
                        </h4>
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() =>
                              console.log("Selected order:", selectedOrder)
                            }
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-2 rounded"
                          >
                            Log Order Data
                          </button>
                          <button
                            onClick={() => {
                              const orderItems = selectedOrder.items;
                              console.log("Order items:", orderItems);
                              orderItems.forEach((item, index) => {
                                console.log(
                                  `Item ${index} customization:`,
                                  item.customization
                                );
                              });
                            }}
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-2 rounded"
                          >
                            Log Customizations
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setIsDetailsModalOpen(false)}
                      className="mt-6 w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
