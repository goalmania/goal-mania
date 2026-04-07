import { z } from "zod";

export const AdultSizeSchema = z.enum(["S", "M", "L", "XL", "XXL", "3XL"]);
export const KidSizeSchema = z.enum(["XS", "S", "M", "L", "XL"]);

export const PatchSchema = z.enum([
  "champions-league",
  "serie-a", 
  "coppa-italia"
]);

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

export const ProductFormBaseSchema = z.object({
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
  
  hasShorts: z.boolean(),
  hasSocks: z.boolean(),
  hasPlayerEdition: z.boolean(),
  hasLongSleeve: z.boolean(), // Added
  isRetro: z.boolean(),
  isWorldCup: z.boolean(), // Added
  isMysteryBox: z.boolean(),
  allowsNameOnShirt: z.boolean(),
  allowsNumberOnShirt: z.boolean(),
  
  country: z.string().optional().or(z.literal("")), // Added
  
  isActive: z.boolean(),
  feature: z.boolean(),
  
  adultSizes: z.array(AdultSizeSchema)
    .min(1, "At least one adult size must be selected"),
  
  kidsSizes: z.array(KidSizeSchema),
  
  patchIds: z.array(z.string())
    .optional()
    .default([]),
  
  images: z.array(z.string().url("Invalid image URL"))
    .min(1, "At least one image is required")
    .max(10, "Maximum 10 images allowed"),
  
  videos: z.array(z.string().url("Invalid video URL"))
    .max(5, "Maximum 5 videos allowed")
    .optional(),
  
  slug: z.string().optional(),
  categories: z.array(z.string()).optional(),
});

export const ProductFormSchema = ProductFormBaseSchema.refine((data) => {
  // Logic: If it's a World Cup item, country must be provided
  if (data.isWorldCup && (!data.country || data.country.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Country is required for World Cup products",
  path: ["country"],
});

export type ProductFormData = z.infer<typeof ProductFormSchema>;

export const ProductEditSchema = ProductFormBaseSchema.partial();

export const BasicInfoSchema = z.object({
  title: ProductFormBaseSchema.shape.title,
  description: ProductFormBaseSchema.shape.description,
  stockQuantity: ProductFormBaseSchema.shape.stockQuantity,
  category: ProductFormBaseSchema.shape.category,
  isMysteryBox: ProductFormBaseSchema.shape.isMysteryBox,
});

export const PricingSchema = z.object({
  basePrice: ProductFormBaseSchema.shape.basePrice,
  retroPrice: ProductFormBaseSchema.shape.retroPrice,
  shippingPrice: ProductFormBaseSchema.shape.shippingPrice,
});

export const OptionsSchema = z.object({
  hasShorts: ProductFormBaseSchema.shape.hasShorts,
  hasSocks: ProductFormBaseSchema.shape.hasSocks,
  hasPlayerEdition: ProductFormBaseSchema.shape.hasPlayerEdition,
  hasLongSleeve: ProductFormBaseSchema.shape.hasLongSleeve, // Added
  isRetro: ProductFormBaseSchema.shape.isRetro,
  isWorldCup: ProductFormBaseSchema.shape.isWorldCup, // Added
  country: ProductFormBaseSchema.shape.country, // Added
  allowsNameOnShirt: ProductFormBaseSchema.shape.allowsNameOnShirt,
  allowsNumberOnShirt: ProductFormBaseSchema.shape.allowsNumberOnShirt,
  adultSizes: ProductFormBaseSchema.shape.adultSizes,
  kidsSizes: ProductFormBaseSchema.shape.kidsSizes,
  isActive: ProductFormBaseSchema.shape.isActive,
  feature: ProductFormBaseSchema.shape.feature,
  patchIds: ProductFormBaseSchema.shape.patchIds,
}).refine((data) => {
  if (data.isWorldCup && (!data.country || data.country.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Country is required for World Cup products",
  path: ["country"],
});

export const ImagesSchema = z.object({
  images: ProductFormBaseSchema.shape.images,
  videos: ProductFormBaseSchema.shape.videos,
});

export const ProductStepSchema = z.object({
  basic: BasicInfoSchema,
  pricing: PricingSchema,
  options: OptionsSchema,
  images: ImagesSchema,
});

export type ProductStepData = z.infer<typeof ProductStepSchema>;

export const validateStep = (step: keyof ProductStepData, data: any) => {
  const stepSchema = ProductStepSchema.shape[step];
  return stepSchema.safeParse(data);
};

export const getStepErrors = (step: keyof ProductStepData, data: any) => {
  const result = validateStep(step, data);
  if (!result.success) {
    return result.error.flatten().fieldErrors;
  }
  return {};
};