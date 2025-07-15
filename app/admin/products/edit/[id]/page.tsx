"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import * as React from "react";
import {
  IProduct,
  VALID_ADULT_SIZES,
  VALID_KID_SIZES,
  VALID_PATCHES,
  PRODUCT_CATEGORIES,
  AdultSize,
  KidSize,
  Patch,
} from "@/lib/types/product";

const PATCHES = VALID_PATCHES.map((id: string) => {
  // Map patch IDs to display names
  let name = "";
  if (id === "champions-league") {
    name = "Coppa Europea";
  } else if (id === "serie-a") {
    name = "Campionato Nazionale";
  } else if (id === "coppa-italia") {
    name = "Coppa Nazionale";
  } else {
    name = id
      .split("-")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  return { id, name };
});

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : "";

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  const [formData, setFormData] = useState<Partial<IProduct>>({
    title: "",
    description: "",
    basePrice: 30,
    retroPrice: 35,
    shippingPrice: 0,
    stockQuantity: 0,
    images: [],
    hasShorts: true,
    hasSocks: true,
    hasPlayerEdition: true,
    isMysteryBox: false,
    adultSizes: Array.from(VALID_ADULT_SIZES) as AdultSize[],
    kidsSizes: Array.from(VALID_KID_SIZES) as KidSize[],
    category: "2024/25",
    availablePatches: [],
    allowsNumberOnShirt: true,
    allowsNameOnShirt: true,
    isActive: true,
    feature: true,
    isRetro: false,
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) throw new Error("Failed to fetch product");
        const product = await response.json();

        // Debug logging
        console.log("Product data received:", product);

        // Handle migration from old schema (sizes) to new schema (adultSizes, kidsSizes)
        const processedProduct = { ...product };

        // If the product has 'sizes' but not 'adultSizes', migrate the data
        if (
          product.sizes &&
          (!product.adultSizes || product.adultSizes.length === 0)
        ) {
          // Convert old sizes format to new format - all old sizes considered adult sizes
          processedProduct.adultSizes = product.sizes
            .map((size: string) => {
              // Handle case variations and normalize
              const normalizedSize = size.trim().toUpperCase();

              // Map common size variations to standard format
              if (normalizedSize === "XXS") return null; // XXS is not in adult sizes
              if (normalizedSize === "S" || normalizedSize === "SMALL")
                return "S";
              if (normalizedSize === "M" || normalizedSize === "MEDIUM")
                return "M";
              if (normalizedSize === "L" || normalizedSize === "LARGE")
                return "L";
              if (
                normalizedSize === "XL" ||
                normalizedSize === "XLARGE" ||
                normalizedSize === "X-LARGE"
              )
                return "XL";
              if (
                normalizedSize === "XXL" ||
                normalizedSize === "XXLARGE" ||
                normalizedSize === "XX-LARGE" ||
                normalizedSize === "2XL"
              )
                return "XXL";
              if (
                normalizedSize === "XXXL" ||
                normalizedSize === "3XL" ||
                normalizedSize === "XXX-LARGE"
              )
                return "3XL";

              // If it's already a valid size, return it
              if (VALID_ADULT_SIZES.includes(normalizedSize as AdultSize))
                return normalizedSize;

              // If it's not a recognized size format, return null to be filtered out
              return null;
            })
            .filter(Boolean) as AdultSize[]; // Filter out null values

          // Initialize kidsSizes if missing
          if (!processedProduct.kidsSizes) {
            processedProduct.kidsSizes = [];

            // Check if any of the original sizes might be kid sizes
            product.sizes.forEach((size: string) => {
              const normalizedSize = size.trim().toUpperCase();
              // Check for kid-specific sizes
              if (
                normalizedSize === "XXS" ||
                normalizedSize === "XS" ||
                normalizedSize.includes("KID") ||
                normalizedSize.includes("CHILD")
              ) {
                // Map to appropriate kid size
                if (normalizedSize === "XXS" || normalizedSize === "XS") {
                  processedProduct.kidsSizes.push("XS" as KidSize);
                } else if (normalizedSize.includes("S")) {
                  processedProduct.kidsSizes.push("S" as KidSize);
                } else if (normalizedSize.includes("M")) {
                  processedProduct.kidsSizes.push("M" as KidSize);
                } else if (normalizedSize.includes("L")) {
                  processedProduct.kidsSizes.push("L" as KidSize);
                } else if (normalizedSize.includes("XL")) {
                  processedProduct.kidsSizes.push("XL" as KidSize);
                }
              }
            });
          }

          console.log("Migrated product sizes for edit page:", {
            oldSizes: product.sizes,
            newAdultSizes: processedProduct.adultSizes,
            newKidSizes: processedProduct.kidsSizes,
          });
        }

        // Ensure adultSizes and kidsSizes are initialized if missing
        if (!processedProduct.adultSizes) {
          processedProduct.adultSizes = Array.from(
            VALID_ADULT_SIZES
          ) as AdultSize[];
          console.log("Initialized missing adultSizes");
        }

        if (!processedProduct.kidsSizes) {
          processedProduct.kidsSizes = Array.from(VALID_KID_SIZES) as KidSize[];
          console.log("Initialized missing kidsSizes");
        }

        setFormData(processedProduct);
        setImageUrls(processedProduct.images || []);
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Failed to fetch product data");
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    let parsedValue: string | number | boolean = value;

    if (type === "number") {
      parsedValue = value === "" ? 0 : parseFloat(value);
    } else if (type === "checkbox") {
      parsedValue = (e.target as HTMLInputElement).checked;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const handleAdultSizeToggle = (size: AdultSize) => {
    setFormData((prev) => ({
      ...prev,
      adultSizes: prev.adultSizes?.includes(size)
        ? prev.adultSizes.filter((s) => s !== size)
        : [...(prev.adultSizes || []), size],
    }));
  };

  const handleKidSizeToggle = (size: KidSize) => {
    setFormData((prev) => ({
      ...prev,
      kidsSizes: prev.kidsSizes?.includes(size)
        ? prev.kidsSizes.filter((s) => s !== size)
        : [...(prev.kidsSizes || []), size],
    }));
  };

  const handlePatchToggle = (patch: Patch) => {
    setFormData((prev) => ({
      ...prev,
      availablePatches: prev.availablePatches?.includes(patch)
        ? prev.availablePatches.filter((p) => p !== patch)
        : [...(prev.availablePatches || []), patch],
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      );

      try {
        const response = await fetch(process.env.NEXT_PUBLIC_CLOUDINARY_URL!, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");
        const data = await response.json();
        return data.secure_url;
      } catch (error) {
        console.error("Upload error:", error);
        return null;
      }
    });

    try {
      const urls = (await Promise.all(uploadPromises)).filter(Boolean);
      setImageUrls((prev) => [...prev, ...urls]);
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...urls],
      }));
    } catch (error) {
      console.error("Error uploading images:", error);
      setError("Failed to upload images");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleImageUrlAdd = () => {
    if (!imageUrl.trim()) return;

    setImageUrls((prev) => [...prev, imageUrl]);
    setFormData((prev) => ({
      ...prev,
      images: [...(prev.images || []), imageUrl],
    }));
    setImageUrl("");
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls((prev) => prev.filter((_, index) => index !== indexToRemove));
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, index) => index !== indexToRemove) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update product");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Error updating product:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update product"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title || ""}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-black"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            value={formData.description || ""}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-black"
            required
          />
        </div>

        {/* Stock Quantity */}
        <div>
          <label
            htmlFor="stockQuantity"
            className="block text-sm font-medium text-gray-700"
          >
            Stock Quantity
          </label>
          <input
            type="number"
            name="stockQuantity"
            id="stockQuantity"
            value={formData.stockQuantity || 0}
            onChange={handleInputChange}
            min="0"
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-black"
            required
          />
        </div>

        {/* Base Price */}
        <div>
          <label
            htmlFor="basePrice"
            className="block text-sm font-medium text-gray-700"
          >
            Base Price
          </label>
          <input
            type="number"
            name="basePrice"
            id="basePrice"
            value={formData.basePrice || 0}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-black"
            required
          />
        </div>

        {/* Retro Price */}
        <div>
          <label
            htmlFor="retroPrice"
            className="block text-sm font-medium text-gray-700"
          >
            Retro Price
          </label>
          <input
            type="number"
            name="retroPrice"
            id="retroPrice"
            value={formData.retroPrice || 0}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-black"
            required
          />
        </div>

        {/* Shipping Price */}
        <div>
          <label
            htmlFor="shippingPrice"
            className="block text-sm font-medium text-gray-700"
          >
            Shipping Price
          </label>
          <input
            type="number"
            name="shippingPrice"
            id="shippingPrice"
            value={formData.shippingPrice || 0}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-black"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category || "2024/25"}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-black"
            required
          >
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images
          </label>

          {/* Upload by URL */}
          <div className="mb-3">
            <label className="block text-xs text-gray-500 mb-1">
              Add image by URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="block w-full text-sm text-gray-900 rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleImageUrlAdd}
                className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Add
              </button>
            </div>
          </div>

          {/* Upload file */}
          <label className="block text-xs text-gray-500 mb-1">
            Upload from device
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            disabled={uploadingImages}
          />
          {uploadingImages && (
            <p className="mt-2 text-sm text-gray-500">Uploading images...</p>
          )}

          <div className="mt-4 grid grid-cols-4 gap-4">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative aspect-square group">
                <Image
                  src={url}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Product Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Product Options Checkboxes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Options
            </label>
            <div className="space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="hasShorts"
                  checked={formData.hasShorts}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-900">Has Shorts</span>
              </label>
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="hasSocks"
                    checked={formData.hasSocks}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">Has Socks</span>
                </label>
              </div>
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="hasPlayerEdition"
                    checked={formData.hasPlayerEdition}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">
                    Player Edition
                  </span>
                </label>
              </div>
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="isRetro"
                    checked={formData.isRetro || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">
                    Retro Jersey
                  </span>
                </label>
              </div>
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="allowsNameOnShirt"
                    checked={formData.allowsNameOnShirt}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">
                    Allows Name On Shirt
                  </span>
                </label>
              </div>
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="allowsNumberOnShirt"
                    checked={formData.allowsNumberOnShirt}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">
                    Allows Number On Shirt
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Available Patches */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Patches
            </label>
            <div className="space-y-2">
              {PATCHES.map((patch) => (
                <label key={patch.id} className="inline-flex items-center mr-4">
                  <input
                    type="checkbox"
                    checked={formData.availablePatches?.includes(
                      patch.id as Patch
                    )}
                    onChange={() => handlePatchToggle(patch.id as Patch)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">
                    {patch.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Adult Sizes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adult Sizes
          </label>
          <div className="flex flex-wrap gap-2">
            {VALID_ADULT_SIZES.map((size) => (
              <label
                key={size}
                className={`px-3 py-1.5 border rounded text-sm font-medium cursor-pointer transition-colors ${
                  formData.adultSizes?.includes(size)
                    ? "bg-indigo-100 border-indigo-300 text-indigo-800"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.adultSizes?.includes(size)}
                  onChange={() => handleAdultSizeToggle(size)}
                  className="sr-only"
                />
                {size}
              </label>
            ))}
          </div>
        </div>

        {/* Kids Sizes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kids Sizes
          </label>
          <div className="flex flex-wrap gap-2">
            {VALID_KID_SIZES.map((size) => (
              <label
                key={size}
                className={`px-3 py-1.5 border rounded text-sm font-medium cursor-pointer transition-colors ${
                  formData.kidsSizes?.includes(size)
                    ? "bg-indigo-100 border-indigo-300 text-indigo-800"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.kidsSizes?.includes(size)}
                  onChange={() => handleKidSizeToggle(size)}
                  className="sr-only"
                />
                {`Kids ${size}`}
              </label>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="space-y-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive || false}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-900">Active</span>
            </label>

            <div className="mt-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="feature"
                  checked={formData.feature || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-900">
                  Featured Product
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="px-4 py-2 border border-gray-300 rounded shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
