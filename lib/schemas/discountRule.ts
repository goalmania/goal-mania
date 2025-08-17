import { z } from "zod";

// Base discount rule schema for form input (all fields optional for flexibility)
export const DiscountRuleFormSchema = z.object({
  name: z.string()
    .min(2, "Rule name must be at least 2 characters")
    .max(100, "Rule name must be less than 100 characters"),
  
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  
  type: z.enum(["quantity_based", "buy_x_get_y", "percentage_off", "fixed_amount_off"], {
    required_error: "Please select a discount type"
  }),
  
  isActive: z.boolean().default(true),
  
  expiresAt: z.string().optional().nullable(),
  
  maxUses: z.number()
    .int("Max uses must be a whole number")
    .min(1, "Max uses must be at least 1")
    .optional()
    .nullable(),
  
  priority: z.number()
    .int("Priority must be a whole number")
    .min(1, "Priority must be at least 1")
    .max(100, "Priority cannot exceed 100"),
  
  // Quantity-based discount fields
  minQuantity: z.number()
    .int("Min quantity must be a whole number")
    .min(1, "Min quantity must be at least 1")
    .optional()
    .nullable(),
  
  maxQuantity: z.number()
    .int("Max quantity must be a whole number")
    .min(1, "Maximum quantity must be at least 1")
    .optional()
    .nullable(),
  
  discountPercentage: z.number()
    .min(0, "Discount percentage cannot be negative")
    .max(100, "Discount percentage cannot exceed 100%")
    .optional()
    .nullable(),
  
  discountAmount: z.number()
    .min(0, "Discount amount cannot be negative")
    .max(1000, "Discount amount cannot exceed €1000")
    .optional()
    .nullable(),
  
  // Buy X get Y free fields
  buyQuantity: z.number()
    .int("Buy quantity must be a whole number")
    .min(1, "Buy quantity must be at least 1")
    .optional()
    .nullable(),
  
  getFreeQuantity: z.number()
    .int("Free quantity must be a whole number")
    .min(1, "Free quantity must be at least 1")
    .optional()
    .nullable(),
  
  freeProductIds: z.array(z.string()).default([]),
  
  // Category and product targeting
  applicableCategories: z.array(z.string()).default([]),
  applicableProductIds: z.array(z.string()).default([]),
  excludedProductIds: z.array(z.string()).default([]),
  
  // Eligibility conditions
  eligibilityConditions: z.object({
    minCartValue: z.number()
      .min(0, "Minimum cart value cannot be negative")
      .optional()
      .nullable(),
    
    minCategoryItems: z.number()
      .int("Minimum category items must be a whole number")
      .min(1, "Minimum category items must be at least 1")
      .optional()
      .nullable(),
    
    maxCategoryItems: z.number()
      .int("Maximum category items must be a whole number")
      .min(1, "Maximum category items must be at least 1")
      .optional()
      .nullable(),
    
    requiredCategories: z.array(z.string()).default([]),
    excludedCategories: z.array(z.string()).default([]),
    
    timeRestrictions: z.object({
      startTime: z.string()
        .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Start time must be in HH:MM format")
        .optional()
        .nullable(),
      
      endTime: z.string()
        .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "End time must be in HH:MM format")
        .optional()
        .nullable(),
      
      daysOfWeek: z.array(z.number().min(0).max(6)).default([]),
    }).optional(),
    
    userRestrictions: z.object({
      minOrders: z.number()
        .int("Minimum orders must be a whole number")
        .min(0, "Minimum orders cannot be negative")
        .optional()
        .nullable(),
      
      userTypes: z.array(z.enum(["new", "returning", "vip"])).default([]),
    }).optional(),
  }).optional(),
});

// Type for the form data
export type DiscountRuleFormData = z.infer<typeof DiscountRuleFormSchema>;

// Schema for creating new rules
export const CreateDiscountRuleSchema = DiscountRuleFormSchema;

// Schema for updating existing rules
export const UpdateDiscountRuleSchema = DiscountRuleFormSchema.partial();

// Validation function
export const validateDiscountRule = (data: unknown) => {
  return DiscountRuleFormSchema.safeParse(data);
};

// Helper function to get validation errors
export const getDiscountRuleErrors = (data: unknown) => {
  const result = validateDiscountRule(data);
  if (!result.success) {
    return result.error.flatten().fieldErrors;
  }
  return {};
};
