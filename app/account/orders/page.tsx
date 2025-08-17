"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { OrderStatus } from "./OrderStatus";
import { XMarkIcon, EyeIcon, TruckIcon } from "@heroicons/react/24/outline";
import { z } from "zod";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconLayoutColumns,
  IconGripVertical,
  IconCircleCheckFilled,
  IconLoader,
} from "@tabler/icons-react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// Schema for order data
const orderSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
    image: z.string().optional(),
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
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
  coupon: z.object({
    code: z.string(),
    discountPercentage: z.number(),
    discountAmount: z.number(),
  }).optional(),
  trackingCode: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

type Order = z.infer<typeof orderSchema>;

// Create a separate component for the drag handle
function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

// Draggable row component
function DraggableRow({ row }: { row: Row<Order> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original._id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

// Order details dialog component
function OrderDetailsDialog({ order, isOpen, onClose }: { 
  order: Order | null; 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  if (!order) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl sm:text-3xl">Order Details</DialogTitle>
          <DialogDescription className="text-base">
            Order placed on {formatDate(order.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {/* Order Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Order ID</Label>
              <p className="text-sm font-mono bg-muted p-3 rounded-md">{order._id}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Badge className={`${getStatusColor(order.status)} text-sm px-3 py-1`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Items */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Items</Label>
            <div className="space-y-6">
              {order.items.map((item, index) => (
                <div key={index} className="flex flex-col">
                  <div className="flex items-start space-x-4">
                    {item.image && (
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base sm:text-lg mb-2">{item.name}</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        €{item.price.toFixed(2)} x {item.quantity}
                      </p>
                      <p className="font-semibold text-lg">
                        €{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {item.customization && (
                    <div className="mt-4 ml-0 sm:ml-24 bg-muted/50 p-4 sm:p-6 rounded-lg">
                      <h4 className="text-sm font-semibold mb-4">Customizations</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        {item.customization.size && (
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Size:</span>
                            <span className="bg-background px-3 py-1 rounded-md">
                              {item.customization.size}{" "}
                              {item.customization.isKidSize ? "(Kid)" : ""}
                            </span>
                          </div>
                        )}
                        {item.customization.name && (
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Name:</span>
                            <span className="bg-background px-3 py-1 rounded-md">
                              {item.customization.name}
                            </span>
                          </div>
                        )}
                        {item.customization.number && (
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Number:</span>
                            <span className="bg-background px-3 py-1 rounded-md">
                              {item.customization.number}
                            </span>
                          </div>
                        )}
                        {item.customization.isPlayerEdition && (
                          <div className="flex justify-between items-center sm:col-span-2">
                            <span className="font-medium">Player Edition:</span>
                            <Badge variant="secondary">Yes</Badge>
                          </div>
                        )}
                        {item.customization.includeShorts && (
                          <div className="flex justify-between items-center sm:col-span-2">
                            <span className="font-medium">Includes Shorts:</span>
                            <Badge variant="secondary">Yes</Badge>
                          </div>
                        )}
                        {item.customization.includeSocks && (
                          <div className="flex justify-between items-center sm:col-span-2">
                            <span className="font-medium">Includes Socks:</span>
                            <Badge variant="secondary">Yes</Badge>
                          </div>
                        )}
                        {item.customization.selectedPatches &&
                          item.customization.selectedPatches.length > 0 && (
                            <div className="sm:col-span-2 space-y-3">
                              <p className="font-medium">Patches:</p>
                              <div className="flex flex-wrap gap-2">
                                {item.customization.selectedPatches.map(
                                  (patch) => (
                                    <div
                                      key={patch.id}
                                      className="flex items-center bg-background p-2 px-3 rounded-md border"
                                    >
                                      <span className="text-sm">
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

          <Separator className="my-8" />

          {/* Shipping Address */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Shipping Address</Label>
            <div className="bg-muted/30 p-4 sm:p-6 rounded-lg space-y-2 text-sm">
              <p className="font-medium">{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p className="font-medium">{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Tracking Information */}
          {order.trackingCode && (
            <>
              <Separator className="my-8" />
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Tracking Information</Label>
                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 sm:p-6 rounded-lg space-y-4">
                  <div className="flex items-center space-x-3">
                    <TruckIcon className="h-6 w-6 text-blue-500 flex-shrink-0" />
                    <div>
                      <p className="text-blue-700 dark:text-blue-300 font-semibold">
                        Tracking Number: {order.trackingCode}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        You can use this tracking number to follow your package's journey.
                      </p>
                    </div>
                  </div>
                  <Button asChild className="w-full sm:w-auto">
                    <a
                      href={`https://www.packagetrackr.com/track/${order.trackingCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Track My Package
                    </a>
                  </Button>
                </div>
              </div>
            </>
          )}

          <Separator className="my-8" />

          {/* Payment Summary */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Payment Summary</Label>
            <div className="bg-muted/30 p-4 sm:p-6 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-base">Subtotal</span>
                <span className="text-base font-medium">€{order.amount.toFixed(2)}</span>
              </div>
              {order.coupon && (
                <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                  <span className="text-sm">
                    Discount ({order.coupon.code} - {order.coupon.discountPercentage}%)
                  </span>
                  <span className="text-sm font-medium">-€{order.coupon.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">Total</span>
                <span className="text-xl font-bold">€{order.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function OrdersDataTable({ orders }: { orders: Order[] }) {
  const [data, setData] = useState(() => orders);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ _id }) => _id) || [],
    [data]
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <IconLoader className="h-3 w-3 mr-1" />;
      case "processing":
        return <IconLoader className="h-3 w-3 mr-1" />;
      case "shipped":
        return <TruckIcon className="h-3 w-3 mr-1" />;
      case "delivered":
        return <IconCircleCheckFilled className="h-3 w-3 mr-1 fill-green-500" />;
      case "cancelled":
        return <XMarkIcon className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const columns: ColumnDef<Order>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original._id} />,
    },
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
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
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <div className="text-sm">
          {formatDate(row.original.createdAt)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge className={`${getStatusColor(status)} border`}>
            {getStatusIcon(status)}
            <span className="hidden sm:inline">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
            <span className="sm:hidden">{status.charAt(0).toUpperCase()}</span>
          </Badge>
        );
      },
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
      accessorKey: "items",
      header: "Items",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          <span className="hidden sm:inline">{row.original.items.length} item{row.original.items.length !== 1 ? 's' : ''}</span>
          <span className="sm:hidden">{row.original.items.length}</span>
        </div>
      ),
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
            <DropdownMenuItem onClick={() => {
              setSelectedOrder(row.original);
              setIsDetailsOpen(true);
            }}>
              <EyeIcon className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {row.original.status === "shipped" && row.original.trackingCode && (
              <DropdownMenuItem asChild>
                <a
                  href={`https://www.packagetrackr.com/track/${row.original.trackingCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <TruckIcon className="mr-2 h-4 w-4" />
                  Track Package
                </a>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row._id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <div className="flex-1">
          <div className="relative max-w-md">
            <Input
              placeholder="Search orders by ID..."
              value={(table.getColumn("_id")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("_id")?.setFilterValue(event.target.value)
              }
              className="w-full"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
            onValueChange={(value) =>
              table.getColumn("status")?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-full sm:w-40">
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
              <Button variant="outline" className="w-full sm:w-auto">
                <IconLayoutColumns className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Columns</span>
                <span className="sm:hidden">View</span>
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
      <div className="rounded-lg border bg-card">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="px-4 py-3">
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
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-32 text-center"
                    >
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <p className="text-muted-foreground">No orders found.</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DndContext>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="flex-1 text-sm text-muted-foreground text-center sm:text-left">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="flex items-center space-x-2">
            <Label htmlFor="rows-per-page" className="text-sm font-medium hidden sm:block">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
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
          <div className="flex items-center space-x-2">
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Dialog */}
      <OrderDetailsDialog
        order={selectedOrder}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedOrder(null);
        }}
      />
    </div>
  );
}

function OrdersContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-center items-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">My Orders</h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
          View and track your order history with detailed information about each purchase.
        </p>
      </div>

      {/* Show order status when success=true */}
      <OrderStatus />

      {orders.length === 0 ? (
        <div className="bg-card rounded-xl border p-8 sm:p-12 text-center max-w-md mx-auto">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-semibold">No Orders Yet</h3>
              <p className="text-muted-foreground">
                You haven't placed any orders yet. Start shopping to see your order history here.
              </p>
            </div>
            <Button onClick={() => router.push("/shop")} className="w-full sm:w-auto">
              Browse Products
            </Button>
          </div>
        </div>
      ) : (
        <OrdersDataTable orders={orders} />
      )}
    </div>
  );
}

// Loading fallback for Suspense
function OrdersLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">My Orders</h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
            View and track your order history with detailed information about each purchase.
          </p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
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
