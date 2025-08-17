import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import DiscountRule from "@/lib/models/DiscountRule";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category?: string;
  customization?: any;
}

export interface RuleAnalysis {
  ruleId: string;
  ruleName: string;
  ruleType: string;
  description: string;
  isApplicable: boolean;
  reason: string;
  potentialDiscount: number;
  requirements?: {
    minQuantity?: number;
    maxQuantity?: number;
    buyQuantity?: number;
    getFreeQuantity?: number;
    currentQuantity: number;
    currentValue: number;
  };
  appliedToItems?: string[];
  eligibilityMessage?: string;
  howToQualify?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { cartItems } = await req.json();

    if (!cartItems || !Array.isArray(cartItems)) {
      return NextResponse.json(
        { error: "Cart items are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get all active discount rules, ordered by priority (highest first)
    const activeRules = await DiscountRule.find({
      isActive: true,
      $and: [
        {
          $or: [
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
          ]
        },
        {
          $or: [
            { maxUses: null },
            { $expr: { $lt: ["$currentUses", "$maxUses"] } }
          ]
        }
      ]
    }).sort({ priority: -1 });

    if (activeRules.length === 0) {
      return NextResponse.json({
        success: true,
        rules: [],
        message: "No active discount rules found"
      });
    }

    const ruleAnalysis: RuleAnalysis[] = [];

    // Analyze each rule for the cart
    for (const rule of activeRules) {
      const analysis = analyzeRuleForCart(rule, cartItems);
      ruleAnalysis.push(analysis);
    }

    return NextResponse.json({
      success: true,
      rules: ruleAnalysis,
      cartSummary: {
        totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        totalValue: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }
    });

  } catch (error) {
    console.error("Error analyzing discount rules for cart:", error);
    return NextResponse.json(
      { error: "Failed to analyze discount rules" },
      { status: 500 }
    );
  }
}

function analyzeRuleForCart(rule: any, cartItems: CartItem[]): RuleAnalysis {
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Filter applicable items based on rule criteria
  const applicableItems = cartItems.filter(item => isItemApplicable(rule, item));
  const applicableQuantity = applicableItems.reduce((sum, item) => sum + item.quantity, 0);
  const applicableValue = applicableItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Check eligibility conditions
  const eligibilityCheck = checkEligibility(rule, cartItems, totalValue);
  
  let isApplicable = false;
  let reason = "";
  let potentialDiscount = 0;
  let eligibilityMessage = "";
  let howToQualify = "";

  // If not eligible, return early with eligibility message
  if (!eligibilityCheck.isEligible) {
    return {
      ruleId: rule._id.toString(),
      ruleName: rule.name,
      ruleType: rule.type,
      description: rule.description,
      isApplicable: false,
      reason: eligibilityCheck.reason,
      potentialDiscount: 0,
      requirements: {
        minQuantity: rule.minQuantity,
        maxQuantity: rule.maxQuantity,
        buyQuantity: rule.buyQuantity,
        getFreeQuantity: rule.getFreeQuantity,
        currentQuantity: applicableQuantity,
        currentValue: Math.round(applicableValue * 100) / 100
      },
      appliedToItems: applicableItems.map(item => item.id),
      eligibilityMessage: eligibilityCheck.message,
      howToQualify: eligibilityCheck.howToQualify
    };
  }

  switch (rule.type) {
    case "quantity_based":
      if (rule.minQuantity && applicableQuantity < rule.minQuantity) {
        const needed = rule.minQuantity - applicableQuantity;
        reason = `Need ${needed} more applicable item(s)`;
        howToQualify = `Add ${needed} more ${rule.applicableCategories?.length ? rule.applicableCategories.join(' or ') : 'applicable'} items to your cart`;
        isApplicable = false;
      } else if (rule.maxQuantity && applicableQuantity > rule.maxQuantity) {
        const excess = applicableQuantity - rule.maxQuantity;
        reason = `Too many applicable items (max: ${rule.maxQuantity})`;
        howToQualify = `Remove ${excess} ${rule.applicableCategories?.length ? rule.applicableCategories.join(' or ') : 'applicable'} items from your cart`;
        isApplicable = false;
      } else {
        reason = "Ready to apply";
        isApplicable = true;
        if (rule.discountPercentage) {
          potentialDiscount = (applicableValue * rule.discountPercentage) / 100;
        } else if (rule.discountAmount) {
          potentialDiscount = rule.discountAmount;
        }
      }
      break;

    case "buy_x_get_y":
      if (rule.buyQuantity && applicableQuantity < rule.buyQuantity) {
        const needed = rule.buyQuantity - applicableQuantity;
        reason = `Need ${needed} more applicable item(s)`;
        howToQualify = `Add ${needed} more ${rule.applicableCategories?.length ? rule.applicableCategories.join(' or ') : 'applicable'} items to get ${rule.getFreeQuantity} free`;
        isApplicable = false;
      } else {
        reason = "Ready to apply";
        isApplicable = true;
        const ruleApplications = Math.floor(applicableQuantity / rule.buyQuantity);
        const freeQuantity = ruleApplications * rule.getFreeQuantity;
        potentialDiscount = freeQuantity * Math.min(...applicableItems.map(i => i.price));
      }
      break;

    case "percentage_off":
      if (applicableItems.length === 0) {
        reason = "No applicable items in cart";
        howToQualify = `Add items from ${rule.applicableCategories?.length ? rule.applicableCategories.join(' or ') : 'any category'} to qualify`;
        isApplicable = false;
      } else {
        reason = "Ready to apply";
        isApplicable = true;
        potentialDiscount = (applicableValue * rule.discountPercentage) / 100;
      }
      break;

    case "fixed_amount_off":
      if (applicableItems.length === 0) {
        reason = "No applicable items in cart";
        howToQualify = `Add items from ${rule.applicableCategories?.length ? rule.applicableCategories.join(' or ') : 'any category'} to qualify`;
        isApplicable = false;
      } else {
        reason = "Ready to apply";
        isApplicable = true;
        potentialDiscount = Math.min(rule.discountAmount, applicableValue);
      }
      break;

    default:
      reason = "Unknown rule type";
      isApplicable = false;
  }

  return {
    ruleId: rule._id.toString(),
    ruleName: rule.name,
    ruleType: rule.type,
    description: rule.description,
    isApplicable,
    reason,
    potentialDiscount: Math.round(potentialDiscount * 100) / 100, // Round to 2 decimal places
    requirements: {
      minQuantity: rule.minQuantity,
      maxQuantity: rule.maxQuantity,
      buyQuantity: rule.buyQuantity,
      getFreeQuantity: rule.getFreeQuantity,
      currentQuantity: applicableQuantity,
      currentValue: Math.round(applicableValue * 100) / 100
    },
    appliedToItems: applicableItems.map(item => item.id),
    eligibilityMessage: eligibilityCheck.message,
    howToQualify
  };
}

function isItemApplicable(rule: any, item: CartItem): boolean {
  // Check if item is excluded
  if (rule.excludedProductIds && rule.excludedProductIds.includes(item.id)) {
    return false;
  }

  // Check if item is specifically included
  if (rule.applicableProductIds && rule.applicableProductIds.length > 0) {
    return rule.applicableProductIds.includes(item.id);
  }

  // Check if item category is applicable
  if (rule.applicableCategories && rule.applicableCategories.length > 0) {
    return item.category && rule.applicableCategories.includes(item.category);
  }

  // If no specific targeting, apply to all items
  return true;
}

function checkEligibility(rule: any, cartItems: CartItem[], totalValue: number): {
  isEligible: boolean;
  reason: string;
  message: string;
  howToQualify: string;
} {
  const conditions = rule.eligibilityConditions;
  
  if (!conditions) {
    return {
      isEligible: true,
      reason: "",
      message: "",
      howToQualify: ""
    };
  }

  // Check minimum cart value
  if (conditions.minCartValue && totalValue < conditions.minCartValue) {
    const needed = conditions.minCartValue - totalValue;
    return {
      isEligible: false,
      reason: `Cart value too low`,
      message: `Your cart value is €${totalValue.toFixed(2)}, but you need at least €${conditions.minCartValue.toFixed(2)}`,
      howToQualify: `Add items worth €${needed.toFixed(2)} more to qualify for this discount`
    };
  }

  // Check minimum category items
  if (conditions.minCategoryItems) {
    const categoryItems = cartItems.filter(item => 
      item.category && conditions.requiredCategories?.includes(item.category)
    );
    const categoryQuantity = categoryItems.reduce((sum, item) => sum + item.quantity, 0);
    
    if (categoryQuantity < conditions.minCategoryItems) {
      const needed = conditions.minCategoryItems - categoryQuantity;
      return {
        isEligible: false,
        reason: `Not enough items from required categories`,
        message: `You have ${categoryQuantity} items from required categories, but need ${conditions.minCategoryItems}`,
        howToQualify: `Add ${needed} more items from ${conditions.requiredCategories?.join(' or ')} to qualify`
      };
    }
  }

  // Check maximum category items
  if (conditions.maxCategoryItems) {
    const categoryItems = cartItems.filter(item => 
      item.category && conditions.requiredCategories?.includes(item.category)
    );
    const categoryQuantity = categoryItems.reduce((sum, item) => sum + item.quantity, 0);
    
    if (categoryQuantity > conditions.maxCategoryItems) {
      const excess = categoryQuantity - conditions.maxCategoryItems;
      return {
        isEligible: false,
        reason: `Too many items from required categories`,
        message: `You have ${categoryQuantity} items from required categories, but maximum is ${conditions.maxCategoryItems}`,
        howToQualify: `Remove ${excess} items from ${conditions.requiredCategories?.join(' or ')} to qualify`
      };
    }
  }

  // Check required categories
  if (conditions.requiredCategories && conditions.requiredCategories.length > 0) {
    const hasRequiredCategory = cartItems.some(item => 
      item.category && conditions.requiredCategories?.includes(item.category)
    );
    
    if (!hasRequiredCategory) {
      return {
        isEligible: false,
        reason: `Missing required categories`,
        message: `This discount requires items from ${conditions.requiredCategories.join(' or ')}`,
        howToQualify: `Add items from ${conditions.requiredCategories.join(' or ')} to qualify`
      };
    }
  }

  // Check excluded categories
  if (conditions.excludedCategories && conditions.excludedCategories.length > 0) {
    const hasExcludedCategory = cartItems.some(item => 
      item.category && conditions.excludedCategories?.includes(item.category)
    );
    
    if (hasExcludedCategory) {
      return {
        isEligible: false,
        reason: `Excluded categories present`,
        message: `This discount cannot be used with items from ${conditions.excludedCategories.join(' or ')}`,
        howToQualify: `Remove items from ${conditions.excludedCategories.join(' or ')} to qualify`
      };
    }
  }

  // Check time restrictions
  if (conditions.timeRestrictions) {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    const currentDay = now.getDay(); // 0-6 (Sunday-Saturday)
    
    // Check days of week
    if (conditions.timeRestrictions.daysOfWeek && conditions.timeRestrictions.daysOfWeek.length > 0) {
      if (!conditions.timeRestrictions.daysOfWeek.includes(currentDay)) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const allowedDays = conditions.timeRestrictions.daysOfWeek.map((day: number) => dayNames[day]).join(', ');
        return {
          isEligible: false,
          reason: `Not available today`,
          message: `This discount is only available on ${allowedDays}`,
          howToQualify: `Come back on ${allowedDays} to use this discount`
        };
      }
    }
    
    // Check time range
    if (conditions.timeRestrictions.startTime && conditions.timeRestrictions.endTime) {
      if (currentTime < conditions.timeRestrictions.startTime || currentTime > conditions.timeRestrictions.endTime) {
        return {
          isEligible: false,
          reason: `Outside time window`,
          message: `This discount is only available between ${conditions.timeRestrictions.startTime} and ${conditions.timeRestrictions.endTime}`,
          howToQualify: `Come back between ${conditions.timeRestrictions.startTime} and ${conditions.timeRestrictions.endTime} to use this discount`
        };
      }
    }
  }

  // All eligibility checks passed
  return {
    isEligible: true,
    reason: "",
    message: "",
    howToQualify: ""
  };
}
