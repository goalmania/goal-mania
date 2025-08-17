import mongoose, { Schema, Document } from "mongoose";

export interface IDiscountRule extends Document {
  name: string;
  description: string;
  type: "quantity_based" | "buy_x_get_y" | "percentage_off" | "fixed_amount_off";
  isActive: boolean;
  expiresAt?: Date;
  maxUses?: number;
  currentUses: number;
  priority: number; // Higher priority rules are applied first
  
  // For quantity-based discounts
  minQuantity?: number;
  maxQuantity?: number;
  discountPercentage?: number;
  discountAmount?: number;
  
  // For buy X get Y free
  buyQuantity?: number;
  getFreeQuantity?: number;
  freeProductIds?: string[]; // Specific products that can be free
  
  // For category/product specific discounts
  applicableCategories?: string[];
  applicableProductIds?: string[];
  excludedProductIds?: string[];
  
  // Eligibility conditions
  eligibilityConditions?: {
    minCartValue?: number; // Minimum total cart value
    minCategoryItems?: number; // Minimum items from specific categories
    maxCategoryItems?: number; // Maximum items from specific categories
    requiredCategories?: string[]; // Categories that must be present
    excludedCategories?: string[]; // Categories that cannot be present
    timeRestrictions?: {
      startTime?: string; // HH:MM format
      endTime?: string; // HH:MM format
      daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
    };
    userRestrictions?: {
      minOrders?: number; // Minimum previous orders
      userTypes?: string[]; // e.g., ["new", "returning", "vip"]
    };
  };
  
  // Usage tracking
  createdAt: Date;
  updatedAt: Date;
}

const discountRuleSchema = new Schema<IDiscountRule>(
  {
    name: {
      type: String,
      required: [true, "Rule name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Rule description is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Rule type is required"],
      enum: ["quantity_based", "buy_x_get_y", "percentage_off", "fixed_amount_off"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    maxUses: {
      type: Number,
      default: null,
    },
    currentUses: {
      type: Number,
      default: 0,
    },
    priority: {
      type: Number,
      default: 1,
      min: [1, "Priority must be at least 1"],
    },
    
    // Quantity-based discount fields
    minQuantity: {
      type: Number,
      default: null,
      min: [1, "Minimum quantity must be at least 1"],
    },
    maxQuantity: {
      type: Number,
      default: null,
      min: [1, "Maximum quantity must be at least 1"],
    },
    discountPercentage: {
      type: Number,
      default: null,
      min: [0, "Discount percentage cannot be negative"],
      max: [100, "Discount percentage cannot exceed 100%"],
    },
    discountAmount: {
      type: Number,
      default: null,
      min: [0, "Discount amount cannot be negative"],
    },
    
    // Buy X get Y free fields
    buyQuantity: {
      type: Number,
      default: null,
      min: [1, "Buy quantity must be at least 1"],
    },
    getFreeQuantity: {
      type: Number,
      default: null,
      min: [1, "Free quantity must be at least 1"],
    },
    freeProductIds: [{
      type: String,
      trim: true,
    }],
    
    // Category and product targeting
    applicableCategories: [{
      type: String,
      trim: true,
    }],
    applicableProductIds: [{
      type: String,
      trim: true,
    }],
    excludedProductIds: [{
      type: String,
      trim: true,
    }],
    
    // Eligibility conditions
    eligibilityConditions: {
      minCartValue: {
        type: Number,
        default: null,
        min: [0, "Minimum cart value cannot be negative"],
      },
      minCategoryItems: {
        type: Number,
        default: null,
        min: [1, "Minimum category items must be at least 1"],
      },
      maxCategoryItems: {
        type: Number,
        default: null,
        min: [1, "Maximum category items must be at least 1"],
      },
      requiredCategories: [{
        type: String,
        trim: true,
      }],
      excludedCategories: [{
        type: String,
        trim: true,
      }],
      timeRestrictions: {
        startTime: {
          type: String,
          default: null,
          match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Start time must be in HH:MM format"],
        },
        endTime: {
          type: String,
          default: null,
          match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "End time must be in HH:MM format"],
        },
        daysOfWeek: [{
          type: Number,
          min: [0, "Day must be 0-6"],
          max: [6, "Day must be 0-6"],
        }],
      },
      userRestrictions: {
        minOrders: {
          type: Number,
          default: null,
          min: [0, "Minimum orders cannot be negative"],
        },
        userTypes: [{
          type: String,
          enum: ["new", "returning", "vip"],
          trim: true,
        }],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Add validation based on rule type
discountRuleSchema.pre("validate", function (next) {
  // Validate expiry date is in the future if provided
  if (this.expiresAt && this.expiresAt < new Date()) {
    this.invalidate("expiresAt", "Expiry date must be in the future");
  }
  
  // Validate rule type specific requirements
  switch (this.type) {
    case "quantity_based":
      if (!this.minQuantity && !this.maxQuantity) {
        this.invalidate("minQuantity", "Quantity-based rules require min or max quantity");
      }
      if (!this.discountPercentage && !this.discountAmount) {
        this.invalidate("discountPercentage", "Quantity-based rules require discount percentage or amount");
      }
      break;
      
    case "buy_x_get_y":
      if (!this.buyQuantity || !this.getFreeQuantity) {
        this.invalidate("buyQuantity", "Buy X get Y rules require both buy and free quantities");
      }
      break;
      
    case "percentage_off":
      if (!this.discountPercentage) {
        this.invalidate("discountPercentage", "Percentage off rules require discount percentage");
      }
      break;
      
    case "fixed_amount_off":
      if (!this.discountAmount) {
        this.invalidate("discountAmount", "Fixed amount off rules require discount amount");
      }
      break;
  }
  
  next();
});

// Check if the model is already defined to prevent OverwriteModelError
const DiscountRule =
  mongoose.models.DiscountRule || mongoose.model<IDiscountRule>("DiscountRule", discountRuleSchema);

export default DiscountRule;
