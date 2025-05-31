"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { Document } from "mongoose";

interface IProduct extends Document {
  _id: string;
  title: string;
  description: string;
  basePrice: number;
  retroPrice?: number;
  shippingPrice?: number;
  stockQuantity: number;
  images: string[];
  isRetro?: boolean;
  hasShorts?: boolean;
  hasSocks?: boolean;
  sizes?: string[];
  category?: string;
  availablePatches?: string[];
  allowsNumberOnShirt?: boolean;
  allowsNameOnShirt?: boolean;
  isActive: boolean;
  feature?: boolean;
  slug?: string;
  categories?: string[];
}

interface ProductTableProps {
  products: IProduct[];
  onEdit: (product: IProduct) => void;
  onDelete: (productId: string) => void;
}

function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  return (
    <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                >
                  Image
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Base Price
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Shipping
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Stock
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Category
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {products.map((product) => (
                <tr
                  key={product._id}
                  className={!product.isActive ? "bg-gray-50" : undefined}
                >
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-0">
                    <div className="h-12 w-12 relative">
                      <Image
                        src={product.images[0] || "/images/image.png"}
                        alt={product.title || "Product image"}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    <div className="font-medium text-gray-900">
                      {product.title}
                    </div>
                    <div className="text-gray-700 truncate max-w-xs">
                      {product.description}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    €{product.basePrice}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {product.shippingPrice === 0 ? (
                      <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                        Free
                      </span>
                    ) : (
                      `€${product.shippingPrice || 0}`
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        product.stockQuantity > 10
                          ? "bg-green-100 text-green-800"
                          : product.stockQuantity > 0
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.stockQuantity}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        product.isRetro
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {product.isRetro ? "Retro" : "Regular"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        product.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      {product.category || "Uncategorized"}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                    <button
                      onClick={() => onEdit(product)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(product._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(true);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleAddProduct = () => {
    router.push("/admin/products/new");
  };

  const handleEditProduct = (product: IProduct) => {
    router.push(`/admin/products/edit/${product._id}`);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (error) {
      console.error("Error deleting product:", error);
      setError("Failed to delete product");
    }
  };

  const fetchProducts = async (includeInactive: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/products?limit=1000&noPagination=true&includeInactive=${includeInactive}`
      );
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(showInactive);
  }, [showInactive]);

  // Sort products based on the selected criteria
  const sortProducts = (a: IProduct, b: IProduct) => {
    let valueA, valueB;

    // Handle different sort fields
    switch (sortBy) {
      case "title":
        valueA = a.title.toLowerCase();
        valueB = b.title.toLowerCase();
        break;
      case "price":
        valueA = a.basePrice;
        valueB = b.basePrice;
        break;
      case "stock":
        valueA = a.stockQuantity;
        valueB = b.stockQuantity;
        break;
      case "status":
        valueA = a.isActive ? 1 : 0;
        valueB = b.isActive ? 1 : 0;
        break;
      case "category":
        valueA = (a.category || "").toLowerCase();
        valueB = (b.category || "").toLowerCase();
        break;
      default: // createdAt
        valueA = a._id; // Use _id as a proxy for creation time (MongoDB ObjectIds contain a timestamp)
        valueB = b._id;
    }

    // Apply sort order
    if (sortOrder === "asc") {
      return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    } else {
      return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
    }
  };

  // Filter products by search term and active status
  const filterProducts = (product: IProduct) => {
    // Filter by active status if showInactive is false
    if (!showInactive && !product.isActive) {
      return false;
    }

    // If no search term, include all products that passed the active filter
    if (!searchTerm.trim()) {
      return true;
    }

    // Search in title, description, and category
    const term = searchTerm.toLowerCase();
    return (
      product.title.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      (product.category && product.category.toLowerCase().includes(term))
    );
  };

  // Filter and sort products
  const displayedProducts = [...products]
    .filter(filterProducts)
    .sort(sortProducts);

  // Toggle sort order or change sort field
  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to descending order
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            Products
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all products in your store including their title, price,
            and status.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              id="show-inactive"
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            />
            <label
              htmlFor="show-inactive"
              className="ml-2 text-sm text-gray-900"
            >
              Show inactive products
            </label>
          </div>
          <button
            type="button"
            onClick={handleAddProduct}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <div className="flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />
              Add product
            </div>
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 items-center">
        <div className="flex-grow max-w-md">
          <label htmlFor="search" className="sr-only">
            Search products
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="search"
              id="search"
              name="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by title, description, or category"
              className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="sort-by" className="text-sm text-gray-900">
            Sort by:
          </label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            className="rounded-md border-gray-300 text-sm text-gray-900 bg-white focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="title" className="text-gray-900">
              Title
            </option>
            <option value="price" className="text-gray-900">
              Price
            </option>
            <option value="stock" className="text-gray-900">
              Stock
            </option>
            <option value="status" className="text-gray-900">
              Status
            </option>
            <option value="category" className="text-gray-900">
              Category
            </option>
            <option value="createdAt" className="text-gray-900">
              Created
            </option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="p-1 rounded-md hover:bg-gray-100 text-gray-900"
            title={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mt-4 text-center text-gray-900">
          Loading products...
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}

      {!isLoading && (
        <div className="mt-4 text-sm text-gray-500">
          Showing {displayedProducts.length} of {products.length} products{" "}
          {!showInactive && "(active only)"} • Sorted by {sortBy} (
          {sortOrder === "asc" ? "ascending" : "descending"})
          {searchTerm && ` • Filtered by "${searchTerm}"`}
        </div>
      )}

      <ProductTable
        products={displayedProducts}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />
    </div>
  );
}
