"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "react-hot-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconLayoutColumns,
  IconPlus,
  IconGripVertical,
} from "@tabler/icons-react";
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
import { IArticle } from "@/lib/models/Article";
import { useArticles } from "@/hooks/useArticles";


const CATEGORY_OPTIONS = [
  { value: "news", label: "Main News" },
  { value: "transferMarket", label: "Transfer Market" },
  { value: "serieA", label: "Serie A" },
  { value: "internationalTeams", label: "International Teams" },
];

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

function DraggableRow({ row }: { row: Row<IArticle> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: (row.original._id || row.original.slug || '') as string,
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

function ArticleDataTable({ 
  articles, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  showDrafts, 
  onShowDraftsChange,
  pagination,
  onPageChange,
  onPageSizeChange,
  isLoading,
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  statusFilter,
  onStatusFilterChange,
  router
}: {
  articles: IArticle[];
  onEdit: (articleId: string) => void;
  onDelete: (articleId: string) => void;
  onToggleStatus: (articleId: string, status: string) => void;
  showDrafts: boolean;
  onShowDraftsChange: (show: boolean) => void;
  pagination: any;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  router: any;
}) {
  const [data, setData] = useState(() => articles);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ _id, slug }) => (_id || slug || '') as string) || [],
    [data]
  );

  // Update data when articles prop changes
  useEffect(() => {
    setData(articles);
  }, [articles]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(globalFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [globalFilter, onSearchChange]);

  // Define columns for the article table
  const columns: ColumnDef<IArticle>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={(row.original._id || row.original.slug || '') as string} />,
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
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => (
        <div className="h-12 w-12 relative rounded-md overflow-hidden">
          <Image
            src={row.original.image || "/images/image.png"}
            alt={row.original.title || "Article image"}
            fill
            className="object-cover"
          />
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "title",
      header: "Article Details",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium text-sm">
            {row.original.title}
          </div>
          <div className="text-xs text-muted-foreground line-clamp-2 max-w-[200px]">
            {row.original.summary}
          </div>
          {row.original.featured && (
            <Badge variant="secondary" className="text-xs">
              Featured
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1.5">
          <Badge variant="outline" className="text-xs">
            {row.original.category === "news" && "Main News"}
            {row.original.category === "transferMarket" && "Transfer Market"}
            {row.original.category === "serieA" && "Serie A"}
            {row.original.category === "internationalTeams" && (
              <>International - {row.original.league || "Unknown"}</>
            )}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "author",
      header: "Author",
      cell: ({ row }) => (
        <div className="text-sm truncate max-w-[120px]">
          {row.original.author}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Badge 
            variant={row.original.status === "published" ? "default" : "secondary"}
          >
            {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleStatus(
              (row.original._id || row.original.slug || '') as string, 
              row.original.status === "published" ? "draft" : "published"
            )}
            className="h-6 w-6 p-0"
          >
            {row.original.status === "published" ? (
              <EyeSlashIcon className="h-3 w-3" />
            ) : (
              <EyeIcon className="h-3 w-3" />
            )}
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "publishedAt",
      header: "Date",
      cell: ({ row }) => (
        <div className="text-sm whitespace-nowrap">
          {row.original.publishedAt
            ? new Date(row.original.publishedAt).toLocaleDateString()
            : "Not published"}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit((row.original._id || row.original.slug || '') as string)}
            className="h-8 w-8 p-0"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete((row.original._id || row.original.slug || '') as string)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
      enableSorting: false,
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
      globalFilter,
    },
    getRowId: (row) => (row._id || row.slug || '') as string,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    globalFilterFn: "includesString",
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
    <Tabs
      defaultValue="articles"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="articles">
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="articles">Articles</SelectItem>
          </SelectContent>
        </Select>

        {/* Search Input and Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search articles..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={categoryFilter || "all"} onValueChange={(value) => onCategoryFilterChange(value === "all" ? "" : value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter || "all"} onValueChange={(value) => onStatusFilterChange(value === "all" ? "" : value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-drafts"
              checked={showDrafts}
              onCheckedChange={(checked) => onShowDraftsChange(checked as boolean)}
            />
            <label
              htmlFor="show-drafts"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Show drafts
            </label>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
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
          <Button 
            onClick={() => router.push("/admin/articles/edit/new")}
            variant="outline" 
            size="sm"
          >
            <IconPlus />
            <span className="hidden lg:inline">Add Article</span>
          </Button>
        </div>
      </div>
      <TabsContent
        value="articles"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
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
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {isLoading ? (
                  // Loading skeleton rows
                  Array.from({ length: pagination.limit }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell><Skeleton className="h-6 w-6" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-12 w-12 rounded-md" /></TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-3 w-[150px]" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                    </TableRow>
                  ))
                ) : table.getRowModel().rows?.length ? (
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
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {pagination.total} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${pagination.limit}`}
                onValueChange={(value) => {
                  onPageSizeChange(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={pagination.limit}
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
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => onPageChange(1)}
                disabled={!pagination.hasPreviousPage || isLoading}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={!pagination.hasPreviousPage || isLoading}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage || isLoading}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => onPageChange(pagination.totalPages)}
                disabled={!pagination.hasNextPage || isLoading}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

export default function ArticlesPage() {
  const router = useRouter();
  const [showDrafts, setShowDrafts] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [optimisticArticles, setOptimisticArticles] = useState<IArticle[]>([]);

  // Use the optimized articles hook
  const {
    articles,
    pagination,
    isLoading,
    error,
    fetchArticles,
    refreshArticles,
    clearError,
    updateArticleOptimistically,
    deleteArticleOptimistically,
  } = useArticles({
    initialLimit: 20,
    enableCache: true,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
  });

  // Update optimistic articles when articles change
  useEffect(() => {
    setOptimisticArticles(articles);
  }, [articles]);

  // Use optimistic articles for display
  const displayArticles = optimisticArticles.length > 0 ? optimisticArticles : articles;

  const handleEditArticle = (articleId: string) => {
    router.push(`/admin/articles/edit/${articleId}`);
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm("Are you sure you want to delete this article? This action cannot be undone.")) return;

    // Optimistically remove from UI
    deleteArticleOptimistically(articleId);

    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete article");
      }

      toast.success("Article deleted successfully");
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("Failed to delete article");
      
      // Refresh to restore the article
      await fetchArticles({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        category: categoryFilter,
        status: statusFilter,
        includeDrafts: showDrafts,
      });
    }
  };

  const handleToggleStatus = async (articleId: string, newStatus: string) => {
    const article = articles.find(a => (a._id || a.slug) === articleId);
    if (!article) return;

    const isPublished = newStatus === "published";
    
    // Optimistically update the UI immediately
    updateArticleOptimistically(articleId, { 
      status: newStatus as "draft" | "published",
      publishedAt: isPublished ? new Date() : undefined
    });

    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...article,
          status: newStatus,
          publishedAt: isPublished ? new Date().toISOString() : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update article status");
      }

      toast.success(`Article ${isPublished ? "published" : "unpublished"} successfully`);
    } catch (error) {
      console.error("Error updating article status:", error);
      toast.error("Failed to update article status");
      
      // Revert the optimistic update on error
      setOptimisticArticles(articles);
    }
  };

  const handlePageChange = useCallback((page: number) => {
    fetchArticles({
      page,
      limit: pagination.limit,
      search: searchTerm,
      category: categoryFilter,
      status: statusFilter,
      includeDrafts: showDrafts,
    });
  }, [fetchArticles, pagination.limit, searchTerm, categoryFilter, statusFilter, showDrafts]);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    fetchArticles({
      page: 1,
      limit: pageSize,
      search: searchTerm,
      category: categoryFilter,
      status: statusFilter,
      includeDrafts: showDrafts,
    });
  }, [fetchArticles, searchTerm, categoryFilter, statusFilter, showDrafts]);

  const handleShowDraftsChange = useCallback((show: boolean) => {
    setShowDrafts(show);
  }, []);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleCategoryFilterChange = useCallback((category: string) => {
    setCategoryFilter(category);
  }, []);

  const handleStatusFilterChange = useCallback((status: string) => {
    setStatusFilter(status);
  }, []);

  // Effect to fetch articles when filters change
  useEffect(() => {
    fetchArticles({
      page: 1,
      limit: pagination.limit,
      search: searchTerm,
      category: categoryFilter,
      status: statusFilter,
      includeDrafts: showDrafts,
    });
  }, [searchTerm, categoryFilter, statusFilter, showDrafts, fetchArticles, pagination.limit]);

  // Memoized stats to prevent unnecessary recalculations
  const stats = useMemo(() => {
    const publishedArticles = articles.filter(a => a.status === "published").length;
    const draftArticles = articles.filter(a => a.status === "draft").length;
    const featuredArticles = articles.filter(a => a.featured).length;
    
    return {
      total: pagination.total,
      published: publishedArticles,
      drafts: draftArticles,
      featured: featuredArticles,
    };
  }, [articles, pagination.total]);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-[#0e1924] tracking-tight">Articles</h1>
          <p className="mt-2 text-base text-gray-700 max-w-2xl">
            Manage your news articles, blog posts, and content across different categories.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Articles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {stats.published}
            </div>
            <p className="text-xs text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {stats.drafts}
            </div>
            <p className="text-xs text-muted-foreground">Drafts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {stats.featured}
            </div>
            <p className="text-xs text-muted-foreground">Featured</p>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Summary */}
      {!isLoading && (
        <div className="text-sm text-muted-foreground">
          Showing {articles.length} of {pagination.total} articles{" "}
          {!showDrafts && "(published only)"}
          {searchTerm && ` matching "${searchTerm}"`}
          {categoryFilter && ` in ${CATEGORY_OPTIONS.find(c => c.value === categoryFilter)?.label}`}
        </div>
      )}

      {/* Articles DataTable */}
      <ArticleDataTable
        articles={displayArticles}
        onEdit={handleEditArticle}
        onDelete={handleDeleteArticle}
        onToggleStatus={handleToggleStatus}
        showDrafts={showDrafts}
        onShowDraftsChange={handleShowDraftsChange}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={handleCategoryFilterChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        router={router}
      />

    </>
  );
}
