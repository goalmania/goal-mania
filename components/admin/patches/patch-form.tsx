"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { createPatchSchema } from "@/lib/schemas/patch";
import { PATCH_CATEGORIES, IPatch } from "@/lib/types/patch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { usePatches } from "@/hooks/usePatches";
import { z } from "zod";
import { useDropzone } from "react-dropzone";
import { 
  ArrowUpTrayIcon, 
  XMarkIcon, 
  PhotoIcon, 
  TagIcon, 
  Cog6ToothIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { StepIndicator } from "@/components/admin/StepIndicator";
import { getCloudinaryUrl } from "@/lib/constants";

interface UploadedImage {
  url: string;
  filename: string;
  preview: string;
}

interface PatchFormProps {
  isDialog?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: IPatch | null;
}

type PatchFormStep = "basic" | "image" | "settings";

type PatchFormData = z.infer<typeof createPatchSchema>;

export const PatchForm = ({ isDialog = false, onSuccess, onCancel, initialData }: PatchFormProps) => {
  const router = useRouter();
  const { createPatch, updatePatch } = usePatches();
  const [currentStep, setCurrentStep] = useState<PatchFormStep>("basic");
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(
    initialData?.imageUrl ? {
      url: initialData.imageUrl,
      filename: 'existing-image',
      preview: initialData.imageUrl
    } : null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(createPatchSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      imageUrl: initialData?.imageUrl || "",
      category: initialData?.category || "serie-a" as const,
      price: initialData?.price || 5,
      isActive: initialData?.isActive ?? true,
      isFeatured: initialData?.isFeatured || false,
      sortOrder: initialData?.sortOrder || 0,
      metadata: initialData?.metadata || {},
    },
    mode: "onChange",
  });

  const { control, watch, setValue, getValues, formState: { errors, isValid }, trigger } = form;

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Please select a valid image file (JPEG, PNG, WebP, or GIF)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size should be less than 5MB");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      );

      // Add folder for patches
      formData.append("folder", "patches");

      const response = await fetch(getCloudinaryUrl(), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      
      const uploadedImageData: UploadedImage = {
        url: result.secure_url,
        filename: file.name,
        preview: URL.createObjectURL(file),
      };

      setUploadedImage(uploadedImageData);
      setValue("imageUrl", result.secure_url);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError("Failed to upload image. Please try again.");
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, [setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: isUploading,
    multiple: false
  });

  const removeImage = () => {
    if (uploadedImage?.preview) {
      URL.revokeObjectURL(uploadedImage.preview);
    }
    setUploadedImage(null);
    setValue("imageUrl", "");
    setUploadError(null);
  };

  const onSubmit = async (data: any) => {
    if (!data.imageUrl) {
      toast.error("Please upload an image for the patch");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const isEditing = !!initialData;
      let result;

      if (isEditing) {
        result = await updatePatch(initialData._id, data);
      } else {
        result = await createPatch(data);
      }

      if (result) {
        const successMessage = isEditing ? "Patch updated successfully!" : "Patch created successfully!";
        toast.success(successMessage);
        
        if (!isEditing) {
          form.reset();
          removeImage();
        }
        
        if (isDialog && onSuccess) {
          onSuccess();
        } else {
          // Navigate back to products page (where patches are managed)
          router.push("/admin/products");
        }
      }
    } catch (error) {
      console.error(`Error ${initialData ? 'updating' : 'creating'} patch:`, error);
      const errorMessage = `Failed to ${initialData ? 'update' : 'create'} patch`;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step validation and navigation
  const validateCurrentStep = async () => {
    const fieldsToValidate = {
      basic: ["title", "description", "category", "price"],
      image: ["imageUrl"],
      settings: ["isActive", "isFeatured", "sortOrder"],
    };

    const fields = fieldsToValidate[currentStep];
    const isValid = await trigger(fields as any);
    return isValid;
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    const steps: PatchFormStep[] = ["basic", "image", "settings"];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: PatchFormStep[] = ["basic", "image", "settings"];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const goToStep = (step: PatchFormStep) => {
    setCurrentStep(step);
  };

  // Step completion status
  const getStepStatus = (step: PatchFormStep) => {
    const currentData = getValues();
    
    switch (step) {
      case "basic":
        return !!(currentData.title && currentData.description && currentData.category && currentData.price);
      case "image":
        return !!(currentData.imageUrl);
      case "settings":
        return true; // Settings step is always considered complete since all fields have defaults
      default:
        return false;
    }
  };

  // Progress calculation
  const getProgress = () => {
    const steps: PatchFormStep[] = ["basic", "image", "settings"];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "champions-league":
        return "🏆";
      case "serie-a":
        return "⚽";
      case "coppa-italia":
        return "🏆";
      case "europa-league":
        return "🌍";
      case "other":
        return "🎯";
      default:
        return "🏷️";
    }
  };

  const steps = [
    {
      id: "basic" as any,
      title: "Basic Info",
      description: "Patch details",
      isCompleted: getStepStatus("basic"),
    },
    {
      id: "image" as any,
      title: "Image",
      description: "Patch photo",
      isCompleted: getStepStatus("image"),
    },
    {
      id: "settings" as any,
      title: "Settings",
      description: "Visibility & order",
      isCompleted: getStepStatus("settings"),
    },
  ];

    return (
    <>
      {/* Header - only show in full page mode */}
      {!isDialog && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-[#0e1924] tracking-tight">
                 Create New Patch
               </h1>
              <p className="mt-2 text-base text-gray-700 max-w-2xl">
                Upload a patch image and configure its details and settings.
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push("/admin/products")}
            >
              Back to Products
            </Button>
          </div>

          {/* Step Indicator */}
          <Card>
            <CardContent className="pt-6">
              <StepIndicator
                currentStep={currentStep as any}
                steps={steps}
                onStepClick={(step: any) => goToStep(step)}
                progress={getProgress()}
              />
            </CardContent>
          </Card>
        </>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
         {/* Basic Information Step */}
         {(currentStep === "basic" || isDialog) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TagIcon className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
              <CardDescription>
                Provide the essential details about your patch
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="title">Patch Title *</Label>
                      <Input
                        {...field}
                        placeholder="e.g., Juventus Home Patch 2024"
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
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {PATCH_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              <span className="flex items-center gap-2">
                                <span>{getCategoryIcon(category)}</span>
                                <span className="capitalize">{category.replace('-', ' ')}</span>
                              </span>
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
                      placeholder="Describe the patch design, materials, and any special features..."
                      className={errors.description ? "border-red-500" : ""}
                    />
                    {errors.description && (
                      <p className="text-xs text-red-500">{errors.description.message}</p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (€) *</Label>
                    <Input
                      type="number"
                      placeholder="5.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className={errors.price ? "border-red-500" : ""}
                      min="0"
                      step="0.01"
                    />
                    {errors.price && (
                      <p className="text-xs text-red-500">{errors.price.message}</p>
                    )}
                  </div>
                )}
              />
            </CardContent>
          </Card>
        )}

                 {/* Image Upload Step */}
         {(currentStep === "image" || isDialog) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PhotoIcon className="h-5 w-5" />
                <span>Patch Image</span>
              </CardTitle>
              <CardDescription>
                Upload a high-quality image of your patch. This will be displayed to customers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!uploadedImage ? (
                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
                    ${isDragActive 
                      ? "border-[#f5963c] bg-orange-50" 
                      : "border-gray-300 hover:border-[#f5963c] hover:bg-gray-50"
                    }
                    ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  <input {...getInputProps()} />
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f5963c]" />
                      ) : (
                        <ArrowUpTrayIcon className="h-8 w-8 text-[#f5963c]" />
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        {isDragActive 
                          ? "Drop your patch image here" 
                          : "Drag & drop your patch image here"
                        }
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        or click to browse files
                      </p>
                    </div>
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>Supports: JPG, PNG, WebP, GIF</p>
                      <p>Maximum size: 5MB</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative group">
                    <div className="aspect-square max-w-xs mx-auto rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={uploadedImage.preview}
                        alt={uploadedImage.filename}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={removeImage}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-2">
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Image uploaded successfully
                    </Badge>
                    <p className="text-sm text-gray-600">{uploadedImage.filename}</p>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-700">{uploadError}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

                 {/* Settings Step */}
         {(currentStep === "settings" || isDialog) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cog6ToothIcon className="h-5 w-5" />
                <span>Patch Settings</span>
              </CardTitle>
              <CardDescription>
                Configure visibility and display options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label className="text-base flex items-center gap-2">
                          <EyeIcon className="h-4 w-4" />
                          Active Status
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Make this patch visible to customers
                        </p>
                      </div>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="isFeatured"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label className="text-base flex items-center gap-2">
                          <SparklesIcon className="h-4 w-4" />
                          Featured Patch
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Highlight this patch on the homepage
                        </p>
                      </div>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  )}
                />
              </div>

              <Controller
                name="sortOrder"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor="sortOrder">Sort Order</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      min="0"
                    />
                    <p className="text-sm text-muted-foreground">
                      Lower numbers appear first in listings (0 = highest priority)
                    </p>
                  </div>
                )}
              />
            </CardContent>
          </Card>
        )}

                {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          {!isDialog ? (
            <>
              {/* Full page navigation */}
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

                {currentStep === "settings" ? (
                  <Button
                    type="submit"
                    disabled={isSubmitting || !uploadedImage}
                    className="bg-[#f5963c] hover:bg-[#e0852e]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                         {initialData ? 'Updating Patch...' : 'Creating Patch...'}
                      </>
                     ) : (
                       initialData ? "Update Patch" : "Create Patch"
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
            </>
          ) : (
            <>
                               {/* Dialog navigation - simplified */}
               <div className="flex justify-end space-x-3">
                 <Button
                   type="button"
                   variant="outline"
                   onClick={onCancel}
                   disabled={isSubmitting}
                 >
                   Cancel
                 </Button>

                 <Button
                   type="submit"
                   disabled={isSubmitting || (isDialog ? !uploadedImage || !getValues().title || !getValues().description : !uploadedImage)}
                   className="bg-[#f5963c] hover:bg-[#e0852e]"
                 >
                   {isSubmitting ? (
                     <>
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                       {initialData ? 'Updating...' : 'Creating...'}
                     </>
                   ) : (
                     initialData ? "Update Patch" : "Create Patch"
                   )}
                 </Button>
               </div>
            </>
          )}
        </div>
      </form>
    </>
  );
};