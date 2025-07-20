"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";
import { 
  ArrowUpTrayIcon, 
  XMarkIcon, 
  PlusIcon,
  PhotoIcon,
  TagIcon,
  Cog6ToothIcon,
  EyeIcon,
  EyeSlashIcon
} from "@heroicons/react/24/outline";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductFormSchema, ProductFormData } from "@/lib/schemas/product";
import { StepIndicator } from "@/components/admin/StepIndicator";
import { StockQuantityInput } from "@/components/admin/StockQuantityInput";
import { FormStep } from "@/hooks/useProductForm";

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
  const productId = typeof params?.id === "string" ? params.id : "";

  const [currentStep, setCurrentStep] = useState<FormStep>("basic");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Initialize form with React Hook Form
  const form = useForm<ProductFormData>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
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
      adultSizes: [...VALID_ADULT_SIZES],
      kidsSizes: [...VALID_KID_SIZES],
      category: "2024/25",
      availablePatches: [],
      allowsNumberOnShirt: true,
      allowsNameOnShirt: true,
      isActive: true,
      feature: true,
      isRetro: false,
    },
    mode: "onChange",
  });

  const { control, watch, setValue, getValues, formState: { errors, isValid }, trigger } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  const fetchProductData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error("Failed to fetch product");
      const product = await response.json();

      // Debug logging
      console.log("Product data received:", product);

      // Handle migration from old schema (sizes) to new schema (adultSizes, kidsSizes)
      const processedProduct = { ...product };

      // If the product has 'sizes' but not 'adultSizes', migrate the data
      if (product.sizes && (!product.adultSizes || product.adultSizes.length === 0)) {
        // Convert old sizes format to new format - all old sizes considered adult sizes
        processedProduct.adultSizes = product.sizes
          .map((size: string) => {
            const normalizedSize = size.trim().toUpperCase();

            // Map common size variations to standard format
            if (normalizedSize === "XXS") return null;
            if (normalizedSize === "S" || normalizedSize === "SMALL") return "S";
            if (normalizedSize === "M" || normalizedSize === "MEDIUM") return "M";
            if (normalizedSize === "L" || normalizedSize === "LARGE") return "L";
            if (normalizedSize === "XL" || normalizedSize === "XLARGE" || normalizedSize === "X-LARGE") return "XL";
            if (normalizedSize === "XXL" || normalizedSize === "XXLARGE" || normalizedSize === "XX-LARGE" || normalizedSize === "2XL") return "XXL";
            if (normalizedSize === "XXXL" || normalizedSize === "3XL" || normalizedSize === "XXX-LARGE") return "3XL";

            if (VALID_ADULT_SIZES.includes(normalizedSize as AdultSize)) return normalizedSize;
            return null;
          })
          .filter(Boolean) as AdultSize[];

        // Initialize kidsSizes if missing
        if (!processedProduct.kidsSizes) {
          processedProduct.kidsSizes = [];
          product.sizes.forEach((size: string) => {
            const normalizedSize = size.trim().toUpperCase();
            if (normalizedSize === "XXS" || normalizedSize === "XS" || normalizedSize.includes("KID") || normalizedSize.includes("CHILD")) {
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
        processedProduct.adultSizes = Array.from(VALID_ADULT_SIZES) as AdultSize[];
      }

      if (!processedProduct.kidsSizes) {
        processedProduct.kidsSizes = Array.from(VALID_KID_SIZES) as KidSize[];
      }

      // Ensure shippingPrice is set to 0 if undefined
      if (processedProduct.shippingPrice === undefined) {
        processedProduct.shippingPrice = 0;
      }

      // Reset form with fetched data
      Object.keys(processedProduct).forEach((key) => {
        if (processedProduct[key] !== undefined) {
          setValue(key as keyof ProductFormData, processedProduct[key]);
        }
      });

    } catch (error) {
      console.error("Error fetching product:", error);
      setError("Failed to fetch product data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    setUploadingImages(true);
    const files = Array.from(e.target.files);
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

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
      const currentImages = getValues("images") || [];
      setValue("images", [...currentImages, ...urls]);
      toast.success(`${urls.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleImageUrlAdd = (imageUrl: string) => {
    if (!imageUrl.trim()) return;

    const currentImages = getValues("images") || [];
    if (!currentImages.includes(imageUrl)) {
      setValue("images", [...currentImages, imageUrl]);
      toast.success("Image URL added successfully");
    }
  };

  const handleImageRemove = (imageUrl: string) => {
    const currentImages = getValues("images") || [];
    setValue("images", currentImages.filter(img => img !== imageUrl));
  };

  const handleSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error response:", errorData);

        if (errorData.details && Array.isArray(errorData.details)) {
          const validationMessages = errorData.details
            .map((err: any) => `${err.path.join(".")} - ${err.message}`)
            .join(", ");
          throw new Error(`Validation failed: ${validationMessages}`);
        }

        throw new Error(errorData.message || "Failed to update product");
      }

      toast.success("Product updated successfully");
      router.push("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error);
      setError(error instanceof Error ? error.message : "Failed to update product");
      toast.error("Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  // Step validation and navigation
  const validateCurrentStep = async () => {
    const fieldsToValidate = {
      basic: ["title", "description", "stockQuantity", "category", "isMysteryBox"],
      pricing: ["basePrice", "retroPrice", "shippingPrice"],
      options: ["hasShorts", "hasSocks", "hasPlayerEdition", "isRetro", "allowsNameOnShirt", "allowsNumberOnShirt", "availablePatches", "adultSizes", "kidsSizes", "isActive", "feature"],
      images: ["images"],
    };

    const fields = fieldsToValidate[currentStep];
    const isValid = await trigger(fields as any);
    return isValid;
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    const steps: FormStep[] = ["basic", "pricing", "options", "images"];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: FormStep[] = ["basic", "pricing", "options", "images"];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const goToStep = (step: FormStep) => {
    setCurrentStep(step);
  };

  // Step completion status
  const getStepStatus = (step: FormStep) => {
    const currentData = getValues();
    
    switch (step) {
      case "basic":
        return !!(currentData.title && currentData.description && currentData.stockQuantity !== undefined && currentData.category);
      case "pricing":
        return !!(currentData.basePrice !== undefined && currentData.shippingPrice !== undefined);
      case "options":
        return !!(currentData.adultSizes && currentData.adultSizes.length > 0);
      case "images":
        return !!(currentData.images && currentData.images.length > 0);
      default:
        return false;
    }
  };

  // Progress calculation
  const getProgress = () => {
    const steps: FormStep[] = ["basic", "pricing", "options", "images"];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const steps = [
    {
      id: "basic" as FormStep,
      title: "Basic Info",
      description: "Product details",
      isCompleted: getStepStatus("basic"),
    },
    {
      id: "pricing" as FormStep,
      title: "Pricing",
      description: "Costs & shipping",
      isCompleted: getStepStatus("pricing"),
    },
    {
      id: "options" as FormStep,
      title: "Options",
      description: "Features & sizes",
      isCompleted: getStepStatus("options"),
    },
    {
      id: "images" as FormStep,
      title: "Images",
      description: "Product photos",
      isCompleted: getStepStatus("images"),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-[#0e1924] tracking-tight">
            Edit Product
          </h1>
          <p className="mt-2 text-base text-gray-700 max-w-2xl">
            Update product information, pricing, and settings.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.push("/admin/products")}
        >
          Back to Products
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Indicator */}
      <Card>
        <CardContent className="pt-6">
          <StepIndicator
            currentStep={currentStep}
            steps={steps}
            onStepClick={goToStep}
            progress={getProgress()}
          />
        </CardContent>
      </Card>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information Step */}
        {currentStep === "basic" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TagIcon className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
              <CardDescription>
                Essential product details and description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="title">Product Title *</Label>
                      <Input
                        {...field}
                        placeholder="Enter product title"
                        className={errors.title ? "border-red-500" : ""}
                      />
                      {errors.title && (
                        <p className="text-xs text-red-500">{errors.title.message}</p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCT_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-xs text-red-500">{errors.category.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder="Enter detailed product description"
                      className={errors.description ? "border-red-500" : ""}
                    />
                    {errors.description && (
                      <p className="text-xs text-red-500">{errors.description.message}</p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="stockQuantity"
                control={control}
                render={({ field }) => (
                  <StockQuantityInput
                    value={field.value}
                    onChange={field.onChange}
                    label="Stock Quantity"
                    error={errors.stockQuantity?.message}
                    required={true}
                    description="Set the available stock quantity for this product"
                  />
                )}
              />

              <Separator />

              <Controller
                name="isMysteryBox"
                control={control}
                render={({ field }) => (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isMysteryBox"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label htmlFor="isMysteryBox" className="text-sm font-medium">
                        Mystery Box Product
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      Check this if this is a Mystery Box product. Mystery Box products have special handling for size selection and exclusion preferences.
                    </p>
                  </div>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Pricing Step */}
        {currentStep === "pricing" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TagIcon className="h-5 w-5" />
                <span>Pricing Information</span>
              </CardTitle>
              <CardDescription>
                Set product pricing and shipping costs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Controller
                  name="basePrice"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="basePrice">Base Price (€) *</Label>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className={errors.basePrice ? "border-red-500" : ""}
                      />
                      {errors.basePrice && (
                        <p className="text-xs text-red-500">{errors.basePrice.message}</p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="retroPrice"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="retroPrice">Retro Price (€)</Label>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className={errors.retroPrice ? "border-red-500" : ""}
                      />
                      {errors.retroPrice && (
                        <p className="text-xs text-red-500">{errors.retroPrice.message}</p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="shippingPrice"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="shippingPrice">Shipping Price (€)</Label>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className={errors.shippingPrice ? "border-red-500" : ""}
                      />
                      {errors.shippingPrice && (
                        <p className="text-xs text-red-500">{errors.shippingPrice.message}</p>
                      )}
                      {watchedValues.shippingPrice === 0 && (
                        <p className="text-xs text-green-600">Free shipping</p>
                      )}
                    </div>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Options Step */}
        {currentStep === "options" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Cog6ToothIcon className="h-5 w-5" />
                    <span>Product Options</span>
                  </CardTitle>
                  <CardDescription>
                    Configure product features and capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Controller
                      name="hasShorts"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasShorts"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <Label htmlFor="hasShorts">Has Shorts</Label>
                        </div>
                      )}
                    />

                    <Controller
                      name="hasSocks"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasSocks"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <Label htmlFor="hasSocks">Has Socks</Label>
                        </div>
                      )}
                    />

                    <Controller
                      name="hasPlayerEdition"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasPlayerEdition"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <Label htmlFor="hasPlayerEdition">Player Edition</Label>
                        </div>
                      )}
                    />

                    <Controller
                      name="isRetro"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="isRetro"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <Label htmlFor="isRetro">Retro Jersey</Label>
                        </div>
                      )}
                    />

                    <Controller
                      name="allowsNameOnShirt"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="allowsNameOnShirt"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <Label htmlFor="allowsNameOnShirt">Allows Name On Shirt</Label>
                        </div>
                      )}
                    />

                    <Controller
                      name="allowsNumberOnShirt"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="allowsNumberOnShirt"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <Label htmlFor="allowsNumberOnShirt">Allows Number On Shirt</Label>
                        </div>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Available Patches */}
              <Card>
                <CardHeader>
                  <CardTitle>Available Patches</CardTitle>
                  <CardDescription>
                    Select which patches are available for this product
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    {PATCHES.map((patch) => (
                      <Controller
                        key={patch.id}
                        name="availablePatches"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`patch-${patch.id}`}
                              checked={field.value?.includes(patch.id)}
                              onCheckedChange={(checked) => {
                                const currentPatches = field.value || [];
                                const newPatches = checked
                                  ? [...currentPatches, patch.id]
                                  : currentPatches.filter(p => p !== patch.id);
                                field.onChange(newPatches);
                              }}
                            />
                            <Label htmlFor={`patch-${patch.id}`} className="text-sm">
                              {patch.name}
                            </Label>
                          </div>
                        )}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sizes */}
            <Card>
              <CardHeader>
                <CardTitle>Available Sizes</CardTitle>
                <CardDescription>
                  Select which sizes are available for this product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Adult Sizes</Label>
                  <div className="flex flex-wrap gap-2">
                    {VALID_ADULT_SIZES.map((size) => (
                      <Controller
                        key={size}
                        name="adultSizes"
                        control={control}
                        render={({ field }) => (
                          <Button
                            type="button"
                            variant={field.value?.includes(size) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              const currentSizes = field.value || [];
                              const newSizes = currentSizes.includes(size)
                                ? currentSizes.filter(s => s !== size)
                                : [...currentSizes, size];
                              field.onChange(newSizes);
                            }}
                            className="h-8"
                          >
                            {size}
                          </Button>
                        )}
                      />
                    ))}
                  </div>
                  {errors.adultSizes && (
                    <p className="text-xs text-red-500 mt-2">{errors.adultSizes.message}</p>
                  )}
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium mb-3 block">Kids Sizes</Label>
                  <div className="flex flex-wrap gap-2">
                    {VALID_KID_SIZES.map((size) => (
                      <Controller
                        key={size}
                        name="kidsSizes"
                        control={control}
                        render={({ field }) => (
                          <Button
                            type="button"
                            variant={field.value?.includes(size) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              const currentSizes = field.value || [];
                              const newSizes = currentSizes.includes(size)
                                ? currentSizes.filter(s => s !== size)
                                : [...currentSizes, size];
                              field.onChange(newSizes);
                            }}
                            className="h-8"
                          >
                            Kids {size}
                          </Button>
                        )}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
                <CardDescription>
                  Control product visibility and features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isActive"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label htmlFor="isActive">Active Product</Label>
                    </div>
                  )}
                />

                <Controller
                  name="feature"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="feature"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label htmlFor="feature">Featured Product</Label>
                    </div>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Images Step */}
        {currentStep === "images" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PhotoIcon className="h-5 w-5" />
                <span>Product Images</span>
              </CardTitle>
              <CardDescription>
                Upload and manage product images
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <Label>Upload Images</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImages}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#f5963c] file:text-white hover:file:bg-[#e0852e]"
                  />
                  {uploadingImages && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#f5963c]"></div>
                      <span>Uploading...</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Manual URL */}
              <Controller
                name="images"
                control={control}
                render={({ field }) => (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="imageUrl">Add Image URL</Label>
                      <div className="flex space-x-2">
                        <Input
                          type="text"
                          id="imageUrl"
                          placeholder="https://example.com/image.jpg"
                          className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.target as HTMLInputElement;
                              if (input.value.trim()) {
                                handleImageUrlAdd(input.value.trim());
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            if (input.value.trim()) {
                              handleImageUrlAdd(input.value.trim());
                              input.value = '';
                            }
                          }}
                          size="sm"
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* Image Preview */}
                    {field.value && field.value.length > 0 && (
                      <div className="space-y-4">
                        <Label>Image Preview ({field.value.length} images)</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {field.value.map((url, index) => (
                            <div
                              key={index}
                              className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 group"
                            >
                              <img
                                src={url}
                                alt={`Product image ${index + 1}`}
                                className="object-cover w-full h-full"
                              />
                              <Button
                                type="button"
                                onClick={() => handleImageRemove(url)}
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                              >
                                <XMarkIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        {errors.images && (
                          <p className="text-xs text-red-500">{errors.images.message}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === "basic"}
          >
            Previous
          </Button>

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/products")}
            >
              Cancel
            </Button>

            {currentStep === "images" ? (
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#f5963c] hover:bg-[#e0852e]"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  "Update Product"
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-[#f5963c] hover:bg-[#e0852e]"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </form>
    </>
  );
}
