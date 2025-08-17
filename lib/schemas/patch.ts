import { z } from "zod";
import { PATCH_CATEGORIES } from "../types/patch";

// Schema for input validation
export const createPatchSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    imageUrl: z.string().url("Image URL must be a valid URL"),
    category: z.enum(PATCH_CATEGORIES),
    price: z.number().min(0, "Price cannot be negative"),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    sortOrder: z.number().default(0),
    metadata: z.record(z.string()).optional(),
  });
  