"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Image from "next/image";
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

export default function ProductForm() {
  const router = useRouter();
  const params = useParams();
  const isEditing = params?.action === "edit";

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
    adultSizes: [...VALID_ADULT_SIZES] as AdultSize[],
    kidsSizes: [...VALID_KID_SIZES] as KidSize[],
    category: "2024/25",
    availablePatches: [],
    allowsNumberOnShirt: true,
    allowsNameOnShirt: true,
    isActive: true,
    feature: true,
    isRetro: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    if (isEditing && params?.id) {
      fetchProductData();
    }
  }, [isEditing, params?.id]);

  const fetchProductData = async () => {
    try {
      const response = await fetch(`/api/products/${params?.id}`);
      if (!response.ok) throw new Error("Failed to fetch product");
      const product = await response.json();

      // Debug logging
      console.log("Product data received:", product);
      console.log("Shipping price:", product.shippingPrice);

      // Ensure shippingPrice is set to 0 if undefined
      if (product.shippingPrice === undefined) {
        product.shippingPrice = 0;
      }

      setFormData(product);
      setImageUrls(product.images || []);
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("Failed to fetch product data");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    let parsedValue: string | number = value;

    if (type === "number") {
      parsedValue = value === "" ? 0 : parseFloat(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
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

  const handlePatchToggle = (patchId: Patch) => {
    setFormData((prev) => ({
      ...prev,
      availablePatches: prev.availablePatches?.includes(patchId)
        ? prev.availablePatches.filter((p) => p !== patchId)
        : [...(prev.availablePatches || []), patchId],
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    setUploadingImages(true);
    const files = Array.from(e.target.files);
    const uploadPromises = files.map(async (file) => {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Ensure all required fields are filled
      const requiredFields = [
        "title",
        "description",
        "basePrice",
        "images",
        "category",
      ];
      const missingFields = requiredFields.filter((field) => {
        const value = formData[field as keyof typeof formData];
        return !value || (Array.isArray(value) && value.length === 0);
      });

      if (missingFields.length > 0) {
        setError(`Missing required fields: ${missingFields.join(", ")}`);
        setIsLoading(false);
        return;
      }

      // Validate that basePrice, retroPrice, and shippingPrice are numbers
      const numericFormData = {
        ...formData,
        basePrice:
          typeof formData.basePrice === "string"
            ? parseFloat(formData.basePrice)
            : formData.basePrice,
        retroPrice:
          typeof formData.retroPrice === "string"
            ? parseFloat(formData.retroPrice)
            : formData.retroPrice,
        shippingPrice:
          typeof formData.shippingPrice === "string"
            ? parseFloat(formData.shippingPrice)
            : formData.shippingPrice ?? 0, // Default to 0 if missing
        stockQuantity:
          typeof formData.stockQuantity === "string"
            ? parseInt(formData.stockQuantity)
            : formData.stockQuantity,
      };

      const response = await fetch(
        isEditing ? `/api/products/${params?.id}` : "/api/products",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(numericFormData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error response:", errorData);

        // Handle validation errors
        if (errorData.details && Array.isArray(errorData.details)) {
          const validationMessages = errorData.details
            .map((err: any) => `${err.path.join(".")} - ${err.message}`)
            .join(", ");
          throw new Error(`Validation failed: ${validationMessages}`);
        }

        throw new Error(errorData.message || "Failed to save product");
      }

      router.push("/admin/products");
    } catch (error) {
      console.error("Error saving product:", error);
      setError(
        error instanceof Error ? error.message : "Failed to save product"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8 text-gray-900">
        {isEditing ? "Edit Product" : "Add New Product"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-lg shadow"
      >
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
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-gray-900"
            required
            minLength={2}
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
            id="description"
            name="description"
            rows={3}
            value={formData.description || ""}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-gray-900"
            required
            minLength={10}
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
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-gray-900"
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
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-gray-900"
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
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-gray-900"
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
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-gray-900"
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
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-gray-900"
          >
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Product Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  onChange={handleCheckboxChange}
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
                    onChange={handleCheckboxChange}
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
                    onChange={handleCheckboxChange}
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
                    onChange={handleCheckboxChange}
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
                    onChange={handleCheckboxChange}
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
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">
                    Allows Number On Shirt
                  </span>
                </label>
              </div>
            </div>
          </div>

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
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Images
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              disabled={uploadingImages}
            />
            {uploadingImages && <span>Uploading...</span>}
          </div>
        </div>

        {/* Manual Image URL */}
        <div>
          <label
            htmlFor="imageUrl"
            className="block text-sm font-medium text-gray-700"
          >
            Or Add Image URL
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-gray-900"
              placeholder="https://example.com/image.jpg"
            />
            <button
              type="button"
              onClick={handleImageUrlAdd}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add
            </button>
          </div>
        </div>

        {/* Image Preview */}
        {imageUrls.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Image Preview
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
              {imageUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-lg border border-gray-200"
                >
                  <Image
                    src={url}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newUrls = [...imageUrls];
                      newUrls.splice(index, 1);
                      setImageUrls(newUrls);
                      setFormData((prev) => ({
                        ...prev,
                        images: newUrls,
                      }));
                    }}
                    className="absolute top-1 right-1 bg-white bg-opacity-75 rounded-full p-1 text-gray-700 hover:bg-opacity-100"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Section */}
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
                onChange={handleCheckboxChange}
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
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-900">
                  Featured Product
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error saving product
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
