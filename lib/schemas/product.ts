import { z } from "zod";

// Size enums
export const AdultSizeSchema = z.enum(["S", "M", "L", "XL", "XXL", "3XL"]);
export const KidSizeSchema = z.enum(["XS", "S", "M", "L", "XL"]);

// Patch enum
export const PatchSchema = z.enum([
  "champions-league",
  "serie-a", 
  "coppa-italia"
]);

// Category enum
// Keep the hardcoded static categories for UI/typing elsewhere, but allow
// any non-empty string for the product schema so admins can create dynamic
// categories that are not part of the hardcoded enum. We still preserve the
// previous enum intent by accepting those values as well, but the runtime
// validation accepts any non-empty string.
export const CategorySchema = z.union([
  z.enum([
    "2024/25",
    "2025/26",
    "SerieA",
    "International",
    "Retro",
    "Mystery Box",
  ]),
  z.string().min(1, "Category must be a non-empty string"),
]);

// Product form schema
export const ProductFormSchema = z.object({
  title: z.string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be less than 100 characters"),
  
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  
  basePrice: z.number()
    .min(0, "Base price must be 0 or greater")
    .max(1000, "Base price must be less than €1000"),
  
  retroPrice: z.number()
    .min(0, "Retro price must be 0 or greater")
    .max(1000, "Retro price must be less than €1000")
    .optional(),
  
  shippingPrice: z.number()
    .min(0, "Shipping price must be 0 or greater")
    .max(100, "Shipping price must be less than €100"),
  
  stockQuantity: z.number()
    .int("Stock quantity must be a whole number")
    .min(0, "Stock quantity must be 0 or greater")
    .max(10000, "Stock quantity must be less than 10,000"),
  
  category: CategorySchema,
  
  // Product options
  hasShorts: z.boolean(),
  hasSocks: z.boolean(),
  hasPlayerEdition: z.boolean(),
  isRetro: z.boolean(),
  isMysteryBox: z.boolean(),
  allowsNameOnShirt: z.boolean(),
  allowsNumberOnShirt: z.boolean(),
  
  // Status
  isActive: z.boolean(),
  feature: z.boolean(),
  
  // Sizes
  adultSizes: z.array(AdultSizeSchema)
    .min(1, "At least one adult size must be selected"),
  
  kidsSizes: z.array(KidSizeSchema),
  
  // Patches - link to global patches
  patchIds: z.array(z.string())
    .optional()
    .default([]),
  
  // Images
  images: z.array(z.string().url("Invalid image URL"))
    .min(1, "At least one image is required")
    .max(10, "Maximum 10 images allowed"),
  
  // Videos
  videos: z.array(z.string().url("Invalid video URL"))
    .max(5, "Maximum 5 videos allowed")
    .optional(),
  
  // Optional fields
  slug: z.string().optional(),
  categories: z.array(z.string()).optional(),
});

// Type for the form data
export type ProductFormData = z.infer<typeof ProductFormSchema>;

// Partial schema for editing (all fields optional)
export const ProductEditSchema = ProductFormSchema.partial();

// Validation schema for specific steps
export const BasicInfoSchema = z.object({
  title: ProductFormSchema.shape.title,
  description: ProductFormSchema.shape.description,
  stockQuantity: ProductFormSchema.shape.stockQuantity,
  category: ProductFormSchema.shape.category,
  isMysteryBox: ProductFormSchema.shape.isMysteryBox,
});

export const PricingSchema = z.object({
  basePrice: ProductFormSchema.shape.basePrice,
  retroPrice: ProductFormSchema.shape.retroPrice,
  shippingPrice: ProductFormSchema.shape.shippingPrice,
});

export const OptionsSchema = z.object({
  hasShorts: ProductFormSchema.shape.hasShorts,
  hasSocks: ProductFormSchema.shape.hasSocks,
  hasPlayerEdition: ProductFormSchema.shape.hasPlayerEdition,
  isRetro: ProductFormSchema.shape.isRetro,
  allowsNameOnShirt: ProductFormSchema.shape.allowsNameOnShirt,
  allowsNumberOnShirt: ProductFormSchema.shape.allowsNumberOnShirt,
  adultSizes: ProductFormSchema.shape.adultSizes,
  kidsSizes: ProductFormSchema.shape.kidsSizes,
  isActive: ProductFormSchema.shape.isActive,
  feature: ProductFormSchema.shape.feature,
  patchIds: ProductFormSchema.shape.patchIds,
});

export const ImagesSchema = z.object({
  images: ProductFormSchema.shape.images,
  videos: ProductFormSchema.shape.videos,
});

// Step form schema for multi-step validation
export const ProductStepSchema = z.object({
  basic: BasicInfoSchema,
  pricing: PricingSchema,
  options: OptionsSchema,
  images: ImagesSchema,
});

export type ProductStepData = z.infer<typeof ProductStepSchema>;

// Helper function to validate individual steps
export const validateStep = (step: keyof ProductStepData, data: any) => {
  const stepSchema = ProductStepSchema.shape[step];
  return stepSchema.safeParse(data);
};

// Helper function to get step validation errors
export const getStepErrors = (step: keyof ProductStepData, data: any) => {
  const result = validateStep(step, data);
  if (!result.success) {
    return result.error.flatten().fieldErrors;
  }
  return {};
}; 