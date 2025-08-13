"use client";

import React, { useState, useMemo, useCallback } from "react";
import { 
  MagnifyingGlassIcon, 
  EyeIcon, 
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  PrinterIcon,
  EnvelopeIcon,
  ArrowPathIcon,
  CurrencyEuroIcon,
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  TagIcon
} from "@heroicons/react/24/outline";
import { 
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconLayoutColumns,
  IconPlus,
  IconTrendingUp,
  IconCircleCheckFilled,
  IconLoader,
  IconGripVertical
} from "@tabler/icons-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { z } from "zod";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Utility function for consistent date formatting
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB'); // Use British format for consistency
};

// Schema for order data
const orderSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  items: z.array(z.object({
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
    productId: z.string().optional(),
    customization: z.object({
      name: z.string().optional(),
      number: z.string().optional(),
      selectedPatches: z.array(z.object({
        id: z.string(),
        name: z.string(),
        image: z.string(),
        price: z.number().optional(),
      })).optional(),
      includeShorts: z.boolean().optional(),
      includeSocks: z.boolean().optional(),
      isPlayerEdition: z.boolean().optional(),
      size: z.string().optional(),
      isKidSize: z.boolean().optional(),
      hasCustomization: z.boolean().optional(),
    }).optional(),
  })),
  amount: z.number(),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
  createdAt: z.string(),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }).optional(),
  cancelledAt: z.string().optional(),
  cancelledBy: z.string().optional(),
  cancellationReason: z.string().optional(),
  refunded: z.boolean().optional(),
  refundedAt: z.string().optional(),
  paymentIntentId: z.string().optional(),
  trackingCode: z.string().optional(),
});

interface User {
  id: string;
  name: string;
  email: string;
}

interface OrdersManagerProps {
  initialOrders: z.infer<typeof orderSchema>[];
}

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: ClockIcon,
    description: "Order received, awaiting processing"
  },
  processing: {
    label: "Processing",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: ChartBarIcon,
    description: "Order is being prepared"
  },
  shipped: {
    label: "Shipped",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: TruckIcon,
    description: "Order has been shipped"
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircleIcon,
    description: "Order has been delivered"
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircleIcon,
    description: "Order has been cancelled"
  },
};

export default function OrdersManager({ initialOrders }: OrdersManagerProps) {
  const [orders, setOrders] = useState<z.infer<typeof orderSchema>[]>(initialOrders);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  
  const [selectedOrder, setSelectedOrder] = useState<z.infer<typeof orderSchema> | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [isRefunding, setIsRefunding] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [isSavingTracking, setIsSavingTracking] = useState(false);
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [isSendingInvoice, setIsSendingInvoice] = useState(false);

  // Load user data for orders
  const loadUserData = useCallback(async (userId: string) => {
    if (users[userId]) return;

    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
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
      if (userData && userData.user) {
        setUsers((prev) => ({
          ...prev,
          [userId]: userData.user,
        }));
      } else {
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
      setUsers((prev) => ({
        ...prev,
        [userId]: { id: userId, name: "Unknown User", email: "Not Available" },
      }));
    }
  }, [users]);

  // Load user data for visible orders
  useMemo(() => {
  orders.forEach((order) => {
    if (!users[order.userId]) {
      loadUserData(order.userId);
    }
  });
  }, [orders, users, loadUserData]);

  const handleStatusChange = async (
    orderId: string,
    newStatus: z.infer<typeof orderSchema>["status"]
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
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? updatedOrder : order
          )
        );
        toast.success(`Order status updated to ${newStatus}`);
      } else {
        const error = await response.json();
        toast.error("Failed to update order status");
        console.error("Failed to update order status:", error);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (order: z.infer<typeof orderSchema>) => {
    setSelectedOrder(order);
    setTrackingCode(order.trackingCode || "");
    setIsDetailsModalOpen(true);
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
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? updatedOrder : order
        )
      );
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
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === selectedOrder._id ? updatedOrder : order
        )
      );
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

  const handleSendOrderNotification = async () => {
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
      toast.success(`Order notification sent to ${data.sentTo}`);
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send order notification"
      );
    } finally {
      setIsSendingNotification(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!selectedOrder) {
      toast.error("No order selected");
      return;
    }

    setIsSendingInvoice(true);
    try {
      const response = await fetch(
        `/api/orders/${selectedOrder._id}/send-invoice`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send invoice");
      }

      const data = await response.json();
      toast.success(`Invoice sent successfully to ${data.sentTo}`);
    } catch (error) {
      console.error("Error sending invoice:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send invoice"
      );
    } finally {
      setIsSendingInvoice(false);
    }
  };

  const handlePrintInvoice = () => {
    if (!selectedOrder) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice - Order ${selectedOrder._id}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
              
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #1f2937;
                background: #ffffff;
                padding: 40px;
                max-width: 800px;
                margin: 0 auto;
              }
              
              .invoice-container {
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                overflow: hidden;
                border: 1px solid #e5e7eb;
              }
              
              .header {
                background: linear-gradient(135deg, #0e1924 0%, #1e3a8a 100%);
                color: white;
                padding: 40px;
                text-align: center;
                position: relative;
              }
              
              .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                opacity: 0.3;
              }
              
              .header h1 {
                font-size: 2.5rem;
                font-weight: 700;
                margin-bottom: 8px;
                position: relative;
                z-index: 1;
              }
              
              .header h2 {
                font-size: 1.25rem;
                font-weight: 400;
                opacity: 0.9;
                position: relative;
                z-index: 1;
              }
              
              .content {
                padding: 40px;
              }
              
              .invoice-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
                margin-bottom: 40px;
                padding: 24px;
                background: #f8fafc;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
              }
              
              .detail-section h3 {
                font-size: 0.875rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: #64748b;
                margin-bottom: 12px;
              }
              
              .detail-section p {
                font-size: 1rem;
                color: #1f2937;
                margin-bottom: 4px;
              }
              
              .status-badge {
                display: inline-block;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 0.75rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-top: 8px;
              }
              
              .status-pending { background: #fef3c7; color: #92400e; }
              .status-processing { background: #dbeafe; color: #1e40af; }
              .status-shipped { background: #e9d5ff; color: #7c3aed; }
              .status-delivered { background: #d1fae5; color: #065f46; }
              .status-cancelled { background: #fee2e2; color: #991b1b; }
              
              .items-section {
                margin-bottom: 40px;
              }
              
              .items-section h3 {
                font-size: 1.25rem;
                font-weight: 600;
                margin-bottom: 20px;
                color: #1f2937;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 8px;
              }
              
              .items-table {
                width: 100%;
                border-collapse: collapse;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
              }
              
              .items-table th {
                background: #f8fafc;
                padding: 16px 12px;
                text-align: left;
                font-weight: 600;
                font-size: 0.875rem;
                color: #374151;
                border-bottom: 1px solid #e5e7eb;
              }
              
              .items-table td {
                padding: 16px 12px;
                border-bottom: 1px solid #f3f4f6;
                font-size: 0.875rem;
              }
              
              .items-table tr:last-child td {
                border-bottom: none;
              }
              
              .items-table tr:hover {
                background: #f9fafb;
              }
              
              .item-name {
                font-weight: 500;
                color: #1f2937;
              }
              
              .item-details {
                font-size: 0.75rem;
                color: #6b7280;
                margin-top: 4px;
              }
              
              .price {
                font-weight: 600;
                color: #059669;
              }
              
              .total-section {
                background: #f8fafc;
                padding: 24px;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
                text-align: right;
              }
              
              .total-amount {
                font-size: 1.5rem;
                font-weight: 700;
                color: #0e1924;
              }
              
              .footer {
                margin-top: 40px;
                padding: 24px;
                background: #f8fafc;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
                text-align: center;
                font-size: 0.875rem;
                color: #6b7280;
              }
              
              .customization-details {
                background: #f0f9ff;
                border: 1px solid #bae6fd;
                border-radius: 6px;
                padding: 12px;
                margin-top: 8px;
                font-size: 0.75rem;
              }
              
              .customization-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-top: 8px;
              }
              
              .customization-item {
                display: flex;
                justify-content: space-between;
                font-size: 0.75rem;
              }
              
              .patches-section {
                margin-top: 8px;
              }
              
              .patch-badge {
                display: inline-block;
                background: #e0e7ff;
                color: #3730a3;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 0.625rem;
                margin: 1px;
              }
              
              @media print {
                body {
                  padding: 0;
                  background: white;
                }
                
                .invoice-container {
                  box-shadow: none;
                  border: none;
                }
                
                .header {
                  background: #0e1924 !important;
                  -webkit-print-color-adjust: exact;
                  color-adjust: exact;
                }
                
                .status-badge {
                  -webkit-print-color-adjust: exact;
                  color-adjust: exact;
                }
                
                .items-table th {
                  background: #f8fafc !important;
                  -webkit-print-color-adjust: exact;
                  color-adjust: exact;
                }
                
                .total-section {
                  background: #f8fafc !important;
                  -webkit-print-color-adjust: exact;
                  color-adjust: exact;
                }
                
                .footer {
                  background: #f8fafc !important;
                  -webkit-print-color-adjust: exact;
                  color-adjust: exact;
                }
                
                .customization-details {
                  background: #f0f9ff !important;
                  -webkit-print-color-adjust: exact;
                  color-adjust: exact;
                }
              }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              <div class="header">
                <h1>Goal-Mania</h1>
                <h2>Official Invoice</h2>
              </div>
              
              <div class="content">
                <div class="invoice-details">
                  <div class="detail-section">
                    <h3>Order Information</h3>
                    <p><strong>Order ID:</strong> #${selectedOrder._id.substring(selectedOrder._id.length - 8)}</p>
                    <p><strong>Date:</strong> ${formatDate(selectedOrder.createdAt)}</p>
                    <p><strong>Status:</strong></p>
                    <span class="status-badge status-${selectedOrder.status}">${selectedOrder.status}</span>
                  </div>
                  <div class="detail-section">
                    <h3>Customer Information</h3>
                    <p><strong>Name:</strong> ${users[selectedOrder.userId]?.name || 'Unknown'}</p>
                    <p><strong>Email:</strong> ${users[selectedOrder.userId]?.email || 'Not Available'}</p>
                    ${selectedOrder.shippingAddress ? `
                      <p><strong>Address:</strong></p>
                      <p style="font-size: 0.875rem; color: #6b7280; margin-top: 4px;">
                        ${selectedOrder.shippingAddress.street}<br>
                        ${selectedOrder.shippingAddress.city}, ${selectedOrder.shippingAddress.state} ${selectedOrder.shippingAddress.postalCode}<br>
                        ${selectedOrder.shippingAddress.country}
                      </p>
                    ` : ''}
                  </div>
                </div>
                
                <div class="items-section">
                  <h3>Order Items</h3>
                  <table class="items-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${selectedOrder.items.map(item => `
                        <tr>
                          <td>
                            <div class="item-name">${item.name}</div>
                            ${item.productId ? `<div class="item-details">ID: ${item.productId}</div>` : ''}
                            ${item.customization ? `
                              <div class="customization-details">
                                ${item.customization.size ? `<div class="customization-item"><span>Size:</span> <span>${item.customization.size}${item.customization.isKidSize ? ' (Kid)' : ''}</span></div>` : ''}
                                ${item.customization.name ? `<div class="customization-item"><span>Name:</span> <span>${item.customization.name}</span></div>` : ''}
                                ${item.customization.number ? `<div class="customization-item"><span>Number:</span> <span>${item.customization.number}</span></div>` : ''}
                                ${item.customization.isPlayerEdition ? `<div class="customization-item"><span>Player Edition:</span> <span>Yes</span></div>` : ''}
                                ${item.customization.includeShorts ? `<div class="customization-item"><span>Includes Shorts:</span> <span>Yes</span></div>` : ''}
                                ${item.customization.includeSocks ? `<div class="customization-item"><span>Includes Socks:</span> <span>Yes</span></div>` : ''}
                                ${item.customization.selectedPatches && item.customization.selectedPatches.length > 0 ? `
                                  <div class="patches-section">
                                    <div style="margin-bottom: 4px; font-weight: 500;">Patches:</div>
                                    ${item.customization.selectedPatches.map(patch => `
                                      <span class="patch-badge">${patch.name}</span>
                                    `).join('')}
                                  </div>
                                ` : ''}
                              </div>
                            ` : ''}
                          </td>
                          <td>${item.quantity}</td>
                          <td class="price">€${item.price.toFixed(2)}</td>
                          <td class="price">€${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
                
                <div class="total-section">
                  <div class="total-amount">
                    Total: €${selectedOrder.amount.toFixed(2)}
                  </div>
                </div>
                
                <div class="footer">
                  <p>Thank you for your purchase from Goal-Mania!</p>
                  <p>For any questions, please contact our support team.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Table columns definition
  const columns: ColumnDef<z.infer<typeof orderSchema>>[] = [
      {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          ref={(el) => {
            if (el) el.indeterminate = table.getIsSomePageRowsSelected();
          }}
          onChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          className="rounded border-gray-300"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(value) => row.toggleSelected(!!value)}
          className="rounded border-gray-300"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
    {
      accessorKey: "_id",
      header: "Order ID",
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          #{row.original._id.substring(row.original._id.length - 8)}
        </div>
      ),
    },
    {
      accessorKey: "userId",
      header: "Customer",
      cell: ({ row }) => {
        const user = users[row.original.userId];
        if (!user) {
          loadUserData(row.original.userId);
      return (
        <div className="flex items-center">
          <div className="h-4 w-4 mr-2 rounded-full animate-pulse bg-gray-200"></div>
              <span className="text-gray-500 text-sm">Loading...</span>
        </div>
      );
    }
    return (
      <div>
            <div className="font-medium text-sm">{user.name}</div>
            <div className="text-gray-500 text-xs">{user.email}</div>
      </div>
    );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <div className="text-sm">
          {formatDate(row.original.createdAt)}
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Total",
      cell: ({ row }) => (
        <div className="font-medium text-sm">
          €{Number(row.original.amount).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const config = statusConfig[status];
        const Icon = config.icon;

  return (
          <div className="flex items-center gap-2">
            <Badge className={`${config.color} border`}>
              <Icon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
            {row.original.refunded && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Refunded
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <IconDotsVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewDetails(row.original)}>
              <EyeIcon className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePrintInvoice()}>
              <PrinterIcon className="mr-2 h-4 w-4" />
              Print Invoice
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSendInvoice()}>
              <EnvelopeIcon className="mr-2 h-4 w-4" />
              Send Invoice Email
            </DropdownMenuItem>
            {row.original.status === "shipped" && row.original.trackingCode && (
              <DropdownMenuItem onClick={() => handleSendOrderNotification()}>
                <EnvelopeIcon className="mr-2 h-4 w-4" />
                Send Notification
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleStatusChange(row.original._id, "cancelled")}
              className="text-red-600"
            >
              <XCircleIcon className="mr-2 h-4 w-4" />
              Cancel Order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: orders,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search orders by ID, customer name, or email..."
              value={(table.getColumn("_id")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("_id")?.setFilterValue(event.target.value)
              }
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select
            value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
            onValueChange={(value) =>
              table.getColumn("status")?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <IconLayoutColumns className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="w-[95vw] h-[95vh] max-w-none !max-w-none overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TagIcon className="h-5 w-5" />
              Order Details - #{selectedOrder?._id.substring(selectedOrder._id.length - 8)}
            </DialogTitle>
            <DialogDescription>
              Complete order information and management
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Status Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowPathIcon className="h-5 w-5" />
                    Order Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {Object.entries(statusConfig).map(([status, config]) => {
                        const Icon = config.icon;
                        const isActive = selectedOrder.status === status;
                        const isCompleted = ['shipped', 'delivered'].includes(selectedOrder.status) && 
                                          ['pending', 'processing', 'shipped', 'delivered'].includes(status);
                        
                        return (
                          <div key={status} className="flex items-center gap-2">
                            <div className={`p-2 rounded-full ${isActive ? config.color : 'bg-gray-100'}`}>
                              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                            </div>
                            <div className="text-sm">
                              <div className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                                {config.label}
                              </div>
                              <div className="text-xs text-gray-400">
                                {config.description}
                              </div>
                            </div>
                            {status !== 'cancelled' && (
                              <div className={`w-8 h-0.5 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(value) =>
                        handleStatusChange(selectedOrder._id, value as any)
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([status, config]) => (
                          <SelectItem key={status} value={status}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
      </div>
                </CardContent>
              </Card>

                  {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Name</Label>
                      <p className="text-sm">{users[selectedOrder.userId]?.name || 'Loading...'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Email</Label>
                      <p className="text-sm">{users[selectedOrder.userId]?.email || 'Loading...'}</p>
                    </div>
                                         <div>
                       <Label className="text-sm font-medium text-gray-700">Order Date</Label>
                       <p className="text-sm flex items-center gap-1">
                         <CalendarIcon className="h-4 w-4" />
                         {formatDate(selectedOrder.createdAt)}
                       </p>
                     </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Total Amount</Label>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <CurrencyEuroIcon className="h-4 w-4" />
                        €{Number(selectedOrder.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPinIcon className="h-5 w-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <address className="not-italic text-sm">
                      {selectedOrder.shippingAddress.street}<br />
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}<br />
                      {selectedOrder.shippingAddress.country}
                    </address>
                  </CardContent>
                </Card>
              )}

                  {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                        {selectedOrder.items.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                                  <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                    {item.productId && (
                              <p className="text-xs text-gray-400">ID: {item.productId}</p>
                                    )}
                                  </div>
                          <div className="text-right">
                            <p className="font-medium">€{Number(item.price).toFixed(2)}</p>
                            <p className="text-sm text-gray-500">
                              Total: €{(item.price * item.quantity).toFixed(2)}
                            </p>
                              </div>
                            </div>

                            {item.customization && (
                          <div className="mt-3 pt-3 border-t">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Customizations</h5>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                  {item.customization.size && (
                                    <div className="flex justify-between">
                                  <span>Size:</span>
                                  <span className="font-medium">
                                    {item.customization.size} {item.customization.isKidSize ? "(Kid)" : ""}
                                      </span>
                                    </div>
                                  )}
                                  {item.customization.name && (
                                    <div className="flex justify-between">
                                  <span>Name:</span>
                                  <span className="font-medium">{item.customization.name}</span>
                                    </div>
                                  )}
                                  {item.customization.number && (
                                    <div className="flex justify-between">
                                  <span>Number:</span>
                                  <span className="font-medium">{item.customization.number}</span>
                                    </div>
                                  )}
                                  {item.customization.isPlayerEdition && (
                                    <div className="flex justify-between col-span-2">
                                  <span>Player Edition:</span>
                                  <span className="font-medium">Yes</span>
                                    </div>
                                  )}
                                  {item.customization.includeShorts && (
                                    <div className="flex justify-between col-span-2">
                                  <span>Includes Shorts:</span>
                                  <span className="font-medium">Yes</span>
                                    </div>
                                  )}
                                  {item.customization.includeSocks && (
                                    <div className="flex justify-between col-span-2">
                                  <span>Includes Socks:</span>
                                  <span className="font-medium">Yes</span>
                                    </div>
                                  )}
                                    </div>
                            
                            {item.customization.selectedPatches && item.customization.selectedPatches.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700 mb-1">Patches:</p>
                                <div className="flex flex-wrap gap-1">
                                  {item.customization.selectedPatches.map((patch) => (
                                    <Badge key={patch.id} variant="outline" className="text-xs">
                                                  {patch.name}
                                    </Badge>
                                  ))}
                                        </div>
                                      </div>
                                    )}
                                        </div>
                                  )}
                                </div>
                        ))}
                    </div>
                </CardContent>
              </Card>

              {/* Tracking Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TruckIcon className="h-5 w-5" />
                    Tracking Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter tracking code"
                          value={trackingCode}
                          onChange={(e) => setTrackingCode(e.target.value)}
                        className="flex-1"
                        />
                      <Button 
                          onClick={handleTrackingCodeUpdate}
                          disabled={isSavingTracking}
                        >
                          {isSavingTracking ? "Saving..." : "Save"}
                      </Button>
                      </div>
                    
                      {selectedOrder.trackingCode && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">
                            Current tracking code: {selectedOrder.trackingCode}
                          </p>
                          {selectedOrder.status === "shipped" && (
                          <Button
                              onClick={handleSendOrderNotification}
                              disabled={isSendingNotification}
                            variant="outline"
                            size="sm"
                            className="mt-2"
                          >
                            {isSendingNotification ? "Sending..." : "Send Order Notification"}
                          </Button>
                          )}
                        </div>
                      )}
                    </div>
                </CardContent>
              </Card>

                    {/* Cancellation Information */}
                    {selectedOrder.status === "cancelled" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <XCircleIcon className="h-5 w-5" />
                          Cancellation Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Cancelled on:</span>
                                                 <span>
                            {selectedOrder.cancelledAt
                             ? formatDate(selectedOrder.cancelledAt)
                              : "N/A"}
                         </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reason:</span>
                        <span>{selectedOrder.cancellationReason || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Refunded:</span>
                        <span className={selectedOrder.refunded ? "text-green-600" : "text-red-600"}>
                          {selectedOrder.refunded ? "Yes" : "No"}
                        </span>
                      </div>
                          {selectedOrder.refundedAt && (
                        <div className="flex justify-between">
                          <span>Refunded on:</span>
                          <span>{formatDate(selectedOrder.refundedAt)}</span>
                        </div>
                          )}
                        </div>
                    
                    {!selectedOrder.refunded && selectedOrder.paymentIntentId && (
                      <Button
                              onClick={() => handleRefund(selectedOrder._id)}
                              disabled={isRefunding}
                        className="mt-4"
                        variant="outline"
                            >
                              {isRefunding ? "Processing..." : "Process Refund"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handlePrintInvoice}>
                  <PrinterIcon className="mr-2 h-4 w-4" />
                  Print Invoice
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleSendInvoice}
                  disabled={isSendingInvoice}
                >
                  <EnvelopeIcon className="mr-2 h-4 w-4" />
                  {isSendingInvoice ? "Sending..." : "Send Invoice Email"}
                </Button>
                <Button onClick={() => setIsDetailsModalOpen(false)}>
                      Close
                </Button>
          </div>
        </div>
      )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
