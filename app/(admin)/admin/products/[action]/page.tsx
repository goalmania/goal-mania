"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  IProduct,
  VALID_ADULT_SIZES,
  VALID_KID_SIZES,
  PRODUCT_CATEGORIES,
  AdultSize,
  KidSize,
} from "@/lib/types/product";
import { NextRequest } from "next/server";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { getCloudinaryUrl, getCloudinaryUploadPreset } from "@/lib/constants";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductFormSchema, ProductFormData } from "@/lib/schemas/product";
import { StepIndicator } from "@/components/admin/StepIndicator";
import { StockQuantityInput } from "@/components/admin/StockQuantityInput";
import { FormStep } from "@/hooks/useProductForm";
import { PatchManagementDialog } from "@/components/admin/patches/PatchManagementDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PatchsCard } from "@/components/admin/patches/patchs-card";





export default function ProductForm() {
  const router = useRouter();
  const params = useParams();
  const isEditing = params?.action === "edit";

  const [currentStep, setCurrentStep] = useState<FormStep>("basic");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [deleteVideoDialogOpen, setDeleteVideoDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string>("");

  // Initialize form with React Hook Form
  const form = useForm<ProductFormData>({
    defaultValues: {
      title: "",
      description: "",
      basePrice: 30,
      retroPrice: 35,
      shippingPrice: 0,
      stockQuantity: 0,
      images: [],
      videos: [],
      hasShorts: true,
      hasSocks: true,
      hasPlayerEdition: true,
      isMysteryBox: false,
      adultSizes: [...VALID_ADULT_SIZES] as AdultSize[],
      kidsSizes: [...VALID_KID_SIZES] as KidSize[],
      category: "2024/25" as const,
      allowsNumberOnShirt: true,
      allowsNameOnShirt: true,
      isActive: true,
      feature: true,
      isRetro: false,
      patchIds: [],
    },
    mode: "onChange",
  });

  const { control, watch, setValue, getValues, formState: { errors, isValid }, trigger } = form;
  const watchedValues = watch();

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

      // Reset form with fetched data
      Object.keys(product).forEach((key) => {
        if (product[key] !== undefined) {
          setValue(key as keyof ProductFormData, product[key]);
        }
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("Failed to fetch product data");
    }
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
        const response = await fetch(getCloudinaryUrl(), {
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

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    // Validate Cloudinary configuration
    const cloudinaryUrl = getCloudinaryUrl('video');
    const uploadPreset = getCloudinaryUploadPreset();
    
    console.log("Cloudinary Configuration Check:", {
      cloudinaryUrl,
      uploadPreset,
      baseUrl: process.env.NEXT_PUBLIC_CLOUDINARY_URL,
      expectedUrl: "https://api.cloudinary.com/v1_1/dj5p3cwir/video/upload",
      expectedPreset: "ml_default"
    });
    
    if (!cloudinaryUrl || !uploadPreset) {
      const errorMsg = `Cloudinary configuration missing. Expected URL: https://api.cloudinary.com/v1_1/dj5p3cwir and preset: ml_default`;
      toast.error(errorMsg);
      console.error("Missing Cloudinary configuration:", {
        url: cloudinaryUrl || 'NOT SET',
        preset: uploadPreset || 'NOT SET',
        fullUrl: cloudinaryUrl,
        fullPreset: uploadPreset,
        suggestion: "Please check your .env.local file and ensure NEXT_PUBLIC_CLOUDINARY_URL=https://api.cloudinary.com/v1_1/dj5p3cwir and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ml_default"
      });
      return;
    }

    // Test network connectivity
    console.log("Testing Cloudinary connectivity...");
    try {
      const testResponse = await fetch(cloudinaryUrl.replace('/upload', '/ping'), {
        method: 'GET',
        mode: 'cors'
      });
      console.log("Cloudinary ping test:", testResponse.status);
    } catch (pingError) {
      console.warn("Cloudinary ping failed (this might be normal):", pingError);
    }

    console.log("Starting video upload...");
    setUploadingVideos(true);
    const files = Array.from(e.target.files);
    
    // Enhanced validation with detailed error reporting
    const validFiles: File[] = [];
    const rejectedFiles: Array<{file: File, reason: string}> = [];
    
    files.forEach(file => {
      const isVideo = file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.mp4') || file.name.toLowerCase().endsWith('.mov') || file.name.toLowerCase().endsWith('.webm');
      const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB limit (Cloudinary free tier)
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      
      console.log(`File validation:`, {
        name: file.name,
        type: file.type,
        size: file.size,
        sizeInMB: `${sizeInMB}MB`,
        isVideo,
        isValidSize,
        valid: isVideo && isValidSize
      });
      
      if (!isVideo) {
        rejectedFiles.push({file, reason: `Invalid file type: ${file.type}. Expected video file.`});
      } else if (!isValidSize) {
        rejectedFiles.push({file, reason: `File too large: ${sizeInMB}MB. Maximum allowed: 100MB.`});
      } else {
        validFiles.push(file);
      }
    });

    // Show detailed error messages for rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({file, reason}) => {
        console.error(`Rejected file: ${file.name} - ${reason}`);
        toast.error(`${file.name}: ${reason}`);
      });
    }

    if (validFiles.length === 0) {
      toast.error("No valid video files to upload");
      setUploadingVideos(false);
      return;
    }

    console.log(`Proceeding with ${validFiles.length} valid files out of ${files.length} total`);

    const uploadPromises = validFiles.map(async (file, index) => {
      const fileId = `${file.name}-${Date.now()}`;
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      // Simulate progress for large files
      const fileSize = file.size;
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[fileId] || 0;
          if (currentProgress < 90) {
            const increment = Math.random() * 10 + 5; // Random increment between 5-15%
            return { ...prev, [fileId]: parseFloat(Math.min(90, currentProgress + increment).toFixed(2)) };
          }
          return prev;
        });
      }, 1000);
      
      console.log(`Uploading video ${index + 1}/${validFiles.length}: ${file.name}`);
      
      // Sanitize filename for Cloudinary
      const sanitizedFileName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
        .replace(/_{2,}/g, '_') // Replace multiple underscores with single
        .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("resource_type", "video");
      formData.append("public_id", `product_videos/${sanitizedFileName}_${Date.now()}`);
      
      // Optimized parameters for faster upload
      formData.append("quality", "auto:good"); // Good quality, faster processing
      formData.append("fetch_format", "auto");
      formData.append("chunk_size", "10000000"); // 10MB chunks for better speed

      console.log(`Upload details:`, {
        originalName: file.name,
        sanitizedName: sanitizedFileName,
        size: (file.size / (1024 * 1024)).toFixed(2) + 'MB',
        sizeBytes: file.size,
        type: file.type,
        cloudinaryUrl: cloudinaryUrl,
        uploadPreset: uploadPreset,
        publicId: `product_videos/${sanitizedFileName}_${Date.now()}`,
        formDataEntries: formData.entries ? Array.from(formData.entries()).map(([key, value]) => [key, typeof value === 'string' ? value : 'File']) : 'FormData not iterable'
      });

      // Retry mechanism
      const maxRetries = 3;
      let retryCount = 0;

      while (retryCount < maxRetries) {
        try {
          // Add timeout for large files
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 900000); // 15 minute timeout

          console.log(`Making fetch request to: ${cloudinaryUrl}`);
          console.log(`Request headers will be auto-set by browser for FormData`);
          
          const response = await fetch(cloudinaryUrl, {
            method: "POST",
            body: formData,
            signal: controller.signal,
            mode: 'cors', // Explicitly set CORS mode
            credentials: 'omit', // Don't send credentials
          });

          clearTimeout(timeoutId);
          clearInterval(progressInterval);
          
          // Update progress to 100% on successful response
          setUploadProgress(prev => ({ ...prev, [fileId]: 100.00 }));
          
          console.log(`Upload response status for ${file.name}:`, response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Upload failed for ${file.name}:`, {
              status: response.status,
              statusText: response.statusText,
              errorText,
              attempt: retryCount + 1
            });
            
            // Check if it's a retryable error
            if (response.status >= 500 || response.status === 429) {
              throw new Error(`Server error: ${response.status} - Retrying...`);
            } else {
              throw new Error(`Upload failed: ${response.status} - ${response.statusText}`);
            }
          }
          
          const data = await response.json();
          console.log(`Upload successful for ${file.name}:`, data.secure_url);
          
          // Clear progress for this file
          setUploadProgress(prev => {
            const newPrev = { ...prev };
            delete newPrev[fileId];
            return newPrev;
          });
          
          return data.secure_url;
          
        } catch (error) {
          retryCount++;
          console.error(`Upload error for ${file.name} (attempt ${retryCount}):`, {
            error,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            errorName: error instanceof Error ? error.name : 'Unknown',
            errorStack: error instanceof Error ? error.stack : 'No stack',
            fileSize: file.size,
            fileName: file.name,
            cloudinaryUrl,
            uploadPreset,
            retryCount,
            maxRetries
          });
          
          if (error instanceof Error) {
            if (error.name === 'AbortError') {
              toast.error(`Upload timeout for ${file.name} (max 15 minutes)`);
              break;
            } else if (error.message.includes('Failed to fetch')) {
              // Network/CORS/URL issues
              if (retryCount < maxRetries) {
                toast.error(`Network error uploading ${file.name}, retrying... (${retryCount}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, 3000 * retryCount));
                continue;
              } else {
                toast.error(`Network error: Cannot reach Cloudinary. Check your internet connection and Cloudinary URL.`);
                console.error('Failed to fetch troubleshooting:', {
                  suggestion: 'This usually means: 1) Invalid Cloudinary URL, 2) Network connectivity issues, 3) CORS problems, 4) Firewall blocking the request',
                  cloudinaryUrl,
                  uploadPreset,
                  fileSize: file.size,
                  browserInfo: navigator.userAgent
                });
                break;
              }
            } else if (retryCount < maxRetries && error.message.includes('Server error')) {
              toast.error(`Upload failed for ${file.name}, retrying... (${retryCount}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
              continue;
            } else {
              toast.error(`Failed to upload ${file.name}: ${error.message}`);
              break;
            }
          } else {
            toast.error(`Failed to upload ${file.name}: Unknown error`);
            break;
          }
        }
      }
      
      // Clear progress for failed upload
      clearInterval(progressInterval);
      setUploadProgress(prev => {
        const newPrev = { ...prev };
        delete newPrev[fileId];
        return newPrev;
      });
      
      return null;
    });

    try {
      const urls = (await Promise.all(uploadPromises)).filter(Boolean);
      console.log("Successfully uploaded video URLs:", urls);
      
      if (urls.length > 0) {
        const currentVideos = getValues("videos") || [];
        setValue("videos", [...currentVideos, ...urls]);
        toast.success(`${urls.length} video(s) uploaded successfully`);
      } else {
        toast.error("No videos were uploaded successfully");
      }
    } catch (error) {
      console.error("Error uploading videos:", error);
      toast.error("Failed to upload videos");
    } finally {
      setUploadingVideos(false);
    }
  };

  const handleVideoUrlAdd = (videoUrl: string) => {
    if (!videoUrl.trim()) return;

    const currentVideos = getValues("videos") || [];
    if (!currentVideos.includes(videoUrl)) {
      setValue("videos", [...currentVideos, videoUrl]);
      toast.success("Video URL added successfully");
    }
  };

  const handleVideoRemove = (videoUrl: string) => {
    setVideoToDelete(videoUrl);
    setDeleteVideoDialogOpen(true);
  };

  const confirmVideoRemove = () => {
    const currentVideos = getValues("videos") || [];
    setValue("videos", currentVideos.filter(video => video !== videoToDelete));
    setDeleteVideoDialogOpen(false);
    setVideoToDelete("");
    toast.success("Video removed successfully");
  };

  // Helper function to ensure proper video URL format
  const getVideoUrl = (url: string) => {
    if (!url) return url;
    
    // If it's a Cloudinary URL without extension, add .mp4
    if (url.includes('cloudinary.com') && !url.match(/\.(mp4|webm|mov|avi)$/i)) {
      return url + '.mp4';
    }
    
    // Return as-is for other URLs
    return url;
  };

  const handleSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        isEditing ? `/api/products/${params?.id}` : "/api/products",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
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

      toast.success(`Product ${isEditing ? "updated" : "created"} successfully`);
      router.push("/admin/products");
    } catch (error) {
      console.error("Error saving product:", error);
      setError(
        error instanceof Error ? error.message : "Failed to save product"
      );
      toast.error("Failed to save product");
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
      images: ["images", "videos"],
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
      title: "Images & Videos",
      description: "Product photos & videos",
      isCompleted: getStepStatus("images"),
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-[#0e1924] tracking-tight">
            {isEditing ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="mt-2 text-base text-gray-700 max-w-2xl">
            {isEditing 
              ? "Update product information, pricing, and settings." 
              : "Create a new product with all necessary details and configurations."
            }
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

              {/* Global Patches */}
              <PatchsCard control={control} />
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

        {/* Videos Step */}
        {currentStep === "images" && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Product Videos</span>
              </CardTitle>
              <CardDescription>
                Upload and manage product video previews
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Video File Upload */}
              <div className="space-y-2">
                <Label>Upload Videos</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={handleVideoUpload}
                    disabled={uploadingVideos}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#f5963c] file:text-white hover:file:bg-[#e0852e]"
                  />
                  {uploadingVideos && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#f5963c]"></div>
                      <span>Uploading videos...</span>
                    </div>
                  )}
                </div>
                
                {/* Upload Progress */}
                {Object.keys(uploadProgress).length > 0 && (
                  <div className="space-y-2 mt-2">
                    <Label>Upload Progress</Label>
                    {Object.entries(uploadProgress).map(([fileId, progress]) => {
                      const fileName = fileId.split('-')[0];
                      return (
                        <div key={fileId} className="flex items-center space-x-2 text-xs bg-gray-50 p-2 rounded">
                          <span className="truncate flex-1 font-medium">{fileName}</span>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-[#f5963c] h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <span className="text-[#f5963c] font-medium min-w-[3rem]">{progress.toFixed(2)}%</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground">
                  Supported formats: MP4, WebM, MOV. Maximum 5 videos per product, 100MB each.
                </p>
              </div>

              <Separator />

              {/* Manual Video URL */}
              <Controller
                name="videos"
                control={control}
                render={({ field }) => (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="videoUrl">Add Video URL</Label>
                      <div className="flex space-x-2">
                        <Input
                          type="text"
                          id="videoUrl"
                          placeholder="https://example.com/video.mp4"
                          className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.target as HTMLInputElement;
                              if (input.value.trim()) {
                                handleVideoUrlAdd(input.value.trim());
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
                              handleVideoUrlAdd(input.value.trim());
                              input.value = '';
                            }
                          }}
                          size="sm"
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* Video Preview */}

                    {field.value && field.value.length > 0 && (
                      <div className="space-y-4">
                        <Label>Video Preview ({field.value.length} videos)</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {field.value.map((url, index) => (
                            <div
                              key={index}
                              className="relative aspect-video overflow-hidden rounded-lg border border-gray-200 group cursor-pointer hover:border-[#f5963c] transition-colors"
                              onClick={() => {
                                console.log("Video clicked:", url);
                                setSelectedVideoUrl(url);
                                setVideoDialogOpen(true);
                                console.log("Video dialog should open with URL:", url);
                              }}
                            >
                              <video
                                src={getVideoUrl(url)}
                                className="object-cover w-full h-full"
                                preload="metadata"
                                muted
                                playsInline
                                crossOrigin="anonymous"
                                onMouseEnter={(e) => {
                                  const video = e.target as HTMLVideoElement;
                                  video.currentTime = 1; // Show frame at 1 second for thumbnail
                                }}
                                onError={(e) => {
                                  console.error("Thumbnail video error for URL:", url);
                                  console.error("Formatted URL:", getVideoUrl(url));
                                  console.error("Error details:", e);
                                }}
                                onLoadedData={() => {
                                  console.log("Thumbnail loaded for:", url);
                                }}
                              />
                              
                              {/* Play overlay */}
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                                  <svg className="h-4 w-4 text-[#f5963c]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                </div>
                              </div>

                              {/* Video indicator */}
                              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                                Video {index + 1}
                              </div>

                              {/* Remove button - same as images */}
                              <Button
                                type="button"
                                onClick={() => handleVideoRemove(url)}
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                              >
                                <XMarkIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        {errors.videos && (
                          <p className="text-xs text-red-500">{errors.videos.message}</p>
                        )}
                      </div>
                    )}

                    {/* Show message when no videos */}
                    {(!field.value || field.value.length === 0) && (
                      <div className="text-sm text-gray-500 italic">
                        No videos uploaded yet. Upload videos above or add video URLs.
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
                    Saving...
                  </>
                ) : (
                  `Save ${isEditing ? "Changes" : "Product"}`
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

      {/* Video Dialog */}
      <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Video Preview</DialogTitle>
          </DialogHeader>
          <div className="relative w-full">
            <video
              src={getVideoUrl(selectedVideoUrl)}
              controls
              autoPlay
              muted
              playsInline
              crossOrigin="anonymous"
              className="w-full h-auto max-h-[70vh] rounded-lg"
              preload="metadata"
              onLoadStart={() => console.log("Video load started:", selectedVideoUrl)}
              onLoadedData={() => console.log("Video loaded successfully:", selectedVideoUrl)}
              onError={(e) => {
                console.error("Video error:", e);
                console.error("Original URL:", selectedVideoUrl);
                console.error("Formatted URL:", getVideoUrl(selectedVideoUrl));
                
                // Try to reload without crossOrigin if it fails
                const video = e.target as HTMLVideoElement;
                if (video.crossOrigin) {
                  console.log("Retrying without crossOrigin...");
                  video.crossOrigin = '';
                  video.load();
                }
              }}
              onCanPlay={() => console.log("Video can play:", selectedVideoUrl)}
            >
              Your browser does not support the video tag.
            </video>
            {selectedVideoUrl && (
              <div className="mt-2 text-xs text-gray-500 break-all">
                Video URL: {selectedVideoUrl}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Video Confirmation Dialog */}
      <AlertDialog open={deleteVideoDialogOpen} onOpenChange={setDeleteVideoDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this video? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteVideoDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmVideoRemove}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
