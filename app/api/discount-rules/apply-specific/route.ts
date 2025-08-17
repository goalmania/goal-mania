import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

export interface AppliedRuleResult {
  ruleId: string;
  ruleName: string;
  ruleType: string;
  description: string;
  discountAmount: number;
  discountPercentage?: number;
  appliedToItems: string[];
  freeItems?: Array<{
    productId: string;
    quantity: number;
    name: string;
  }>;
  success: boolean;
  message: string;
}

export async function POST(req: NextRequest) {
  try {

    const { cartItems, ruleIds } = await req.json();

    if (!cartItems || !Array.isArray(cartItems)) {
      return NextResponse.json(
        { error: "Cart items are required" },
        { status: 400 }
      );
    }

    if (!ruleIds || !Array.isArray(ruleIds) || ruleIds.length === 0) {
      return NextResponse.json(
        { error: "Rule IDs are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get the specific rules requested
    const rules = await DiscountRule.find({
      _id: { $in: ruleIds },
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
    });

    if (rules.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No valid discount rules found"
      });
    }

    const appliedResults: AppliedRuleResult[] = [];
    let totalDiscountAmount = 0;

    // Apply each requested rule
    for (const rule of rules) {
      const result = await applySpecificDiscountRule(rule, cartItems);
      
      if (result.success) {
        appliedResults.push(result);
        totalDiscountAmount += result.discountAmount;
        
        // Increment usage count
        rule.currentUses += 1;
        await rule.save();
      } else {
        appliedResults.push(result);
      }
    }

    const successfulRules = appliedResults.filter(r => r.success);

    return NextResponse.json({
      success: true,
      appliedRules: successfulRules,
      failedRules: appliedResults.filter(r => !r.success),
      totalDiscountAmount,
      message: `Successfully applied ${successfulRules.length} discount rule(s)`
    });

  } catch (error) {
    console.error("Error applying specific discount rules:", error);
    return NextResponse.json(
      { error: "Failed to apply discount rules" },
      { status: 500 }
    );
  }
}

async function applySpecificDiscountRule(rule: any, cartItems: CartItem[]): Promise<AppliedRuleResult> {
  try {
    console.log('🔍 Applying discount rule:', {
      ruleId: rule._id,
      ruleName: rule.name,
      ruleType: rule.type,
      cartItemsCount: cartItems.length
    });

    let discountAmount = 0;
    let appliedToItems: string[] = [];
    let freeItems: Array<{ productId: string; quantity: number; name: string }> = [];

    // Check if rule can be applied
    const applicableItems = cartItems.filter(item => isItemApplicable(rule, item));
    
    if (applicableItems.length === 0) {
      console.log('ℹ️ No applicable items for rule:', rule.name);
      return {
        ruleId: rule._id.toString(),
        ruleName: rule.name,
        ruleType: rule.type,
        description: rule.description,
        discountAmount: 0,
        appliedToItems: [],
        success: false,
        message: "No applicable items in cart"
      };
    }

    console.log('✅ Found applicable items:', applicableItems.length);

    switch (rule.type) {
      case "quantity_based":
        const quantityResult = applyQuantityBasedDiscount(rule, applicableItems);
        if (quantityResult) {
          discountAmount = quantityResult.discountAmount;
          appliedToItems = quantityResult.appliedToItems;
        } else {
          return {
            ruleId: rule._id.toString(),
            ruleName: rule.name,
            ruleType: rule.type,
            description: rule.description,
            discountAmount: 0,
            appliedToItems: [],
            success: false,
            message: "Quantity requirements not met"
          };
        }
        break;

      case "buy_x_get_y":
        const buyXGetYResult = applyBuyXGetYDiscount(rule, applicableItems);
        if (buyXGetYResult) {
          discountAmount = buyXGetYResult.discountAmount;
          appliedToItems = buyXGetYResult.appliedToItems;
          freeItems = buyXGetYResult.freeItems;
        } else {
          return {
            ruleId: rule._id.toString(),
            ruleName: rule.name,
            ruleType: rule.type,
            description: rule.description,
            discountAmount: 0,
            appliedToItems: [],
            success: false,
            message: "Buy X Get Y requirements not met"
          };
        }
        break;

      case "percentage_off":
        const percentageResult = applyPercentageOffDiscount(rule, applicableItems);
        if (percentageResult) {
          discountAmount = percentageResult.discountAmount;
          appliedToItems = percentageResult.appliedToItems;
        } else {
          return {
            ruleId: rule._id.toString(),
            ruleName: rule.name,
            ruleType: rule.type,
            description: rule.description,
            discountAmount: 0,
            appliedToItems: [],
            success: false,
            message: "Percentage discount could not be applied"
          };
        }
        break;

      case "fixed_amount_off":
        const fixedResult = applyFixedAmountOffDiscount(rule, applicableItems);
        if (fixedResult) {
          discountAmount = fixedResult.discountAmount;
          appliedToItems = fixedResult.appliedToItems;
        } else {
          return {
            ruleId: rule._id.toString(),
            ruleName: rule.name,
            ruleType: rule.type,
            description: rule.description,
            discountAmount: 0,
            appliedToItems: [],
            success: false,
            message: "Fixed amount discount could not be applied"
          };
        }
        break;

      default:
        return {
          ruleId: rule._id.toString(),
          ruleName: rule.name,
          ruleType: rule.type,
          description: rule.description,
          discountAmount: 0,
          appliedToItems: [],
          success: false,
          message: "Unknown rule type"
        };
    }

    if (discountAmount > 0) {
      console.log('✅ Rule applied successfully:', {
        ruleName: rule.name,
        discountAmount,
        appliedToItems: appliedToItems.length
      });
      
      return {
        ruleId: rule._id.toString(),
        ruleName: rule.name,
        ruleType: rule.type,
        description: rule.description,
        discountAmount,
        discountPercentage: rule.discountPercentage,
        appliedToItems,
        freeItems,
        success: true,
        message: `Successfully applied ${rule.name}`
      };
    }

    return {
      ruleId: rule._id.toString(),
      ruleName: rule.name,
      ruleType: rule.type,
      description: rule.description,
      discountAmount: 0,
      appliedToItems: [],
      success: false,
      message: "No discount amount calculated"
    };

  } catch (error) {
    console.error(`Error applying ${rule.type} discount rule:`, error);
    return {
      ruleId: rule._id.toString(),
      ruleName: rule.name,
      ruleType: rule.type,
      description: rule.description,
      discountAmount: 0,
      appliedToItems: [],
      success: false,
      message: "Error applying discount rule"
    };
  }
}

function applyQuantityBasedDiscount(rule: any, applicableItems: CartItem[]) {
  const totalQuantity = applicableItems.reduce((sum, item) => sum + item.quantity, 0);

  // Check if quantity requirements are met
  if (rule.minQuantity && totalQuantity < rule.minQuantity) {
    return null;
  }
  if (rule.maxQuantity && totalQuantity > rule.maxQuantity) {
    return null;
  }

  // Calculate discount
  let discountAmount = 0;
  if (rule.discountPercentage) {
    const applicableTotal = applicableItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    discountAmount = (applicableTotal * rule.discountPercentage) / 100;
  } else if (rule.discountAmount) {
    discountAmount = rule.discountAmount;
  }

  return {
    discountAmount,
    appliedToItems: applicableItems.map(item => item.id)
  };
}

function applyBuyXGetYDiscount(rule: any, applicableItems: CartItem[]) {
  console.log('🔍 Applying buy_x_get_y discount rule:', {
    ruleId: rule._id,
    ruleName: rule.name,
    buyQuantity: rule.buyQuantity,
    getFreeQuantity: rule.getFreeQuantity,
    applicableItemsCount: applicableItems.length
  });

  // Validate required fields
  if (!rule.buyQuantity || !rule.getFreeQuantity) {
    console.error('❌ Missing required fields for buy_x_get_y rule:', {
      ruleId: rule._id,
      buyQuantity: rule.buyQuantity,
      getFreeQuantity: rule.getFreeQuantity
    });
    return null;
  }

  const totalQuantity = applicableItems.reduce((sum, item) => sum + item.quantity, 0);

  if (totalQuantity < rule.buyQuantity) {
    console.log('ℹ️ Quantity requirement not met:', { totalQuantity, required: rule.buyQuantity });
    return null;
  }

  // Calculate how many times the rule can be applied
  const ruleApplications = Math.floor(totalQuantity / rule.buyQuantity);
  const freeQuantity = ruleApplications * rule.getFreeQuantity;

  console.log('✅ Rule can be applied:', { ruleApplications, freeQuantity });

  // Calculate discount amount (value of free items)
  let discountAmount = 0;
  if (rule.freeProductIds && rule.freeProductIds.length > 0) {
    // Specific products are free
    for (const productId of rule.freeProductIds) {
      const item = applicableItems.find(item => item.id === productId);
      if (item) {
        const itemFreeQuantity = Math.min(freeQuantity, item.quantity);
        discountAmount += item.price * itemFreeQuantity;
      }
    }
  } else {
    // Cheapest applicable items are free
    const sortedItems = [...applicableItems].sort((a, b) => a.price - b.price);
    let remainingFreeQuantity = freeQuantity;
    
    for (const item of sortedItems) {
      if (remainingFreeQuantity <= 0) break;
      const itemFreeQuantity = Math.min(remainingFreeQuantity, item.quantity);
      discountAmount += item.price * itemFreeQuantity;
      remainingFreeQuantity -= itemFreeQuantity;
    }
  }

  return {
    discountAmount,
    appliedToItems: applicableItems.map(item => item.id),
    freeItems: [{
      productId: applicableItems[0]?.id || "",
      quantity: freeQuantity,
      name: `Buy ${rule.buyQuantity}, get ${rule.getFreeQuantity} free`
    }]
  };
}

function applyPercentageOffDiscount(rule: any, applicableItems: CartItem[]) {
  if (applicableItems.length === 0) {
    return null;
  }

  // Calculate discount
  const applicableTotal = applicableItems.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  );
  const discountAmount = (applicableTotal * rule.discountPercentage) / 100;

  return {
    discountAmount,
    appliedToItems: applicableItems.map(item => item.id)
  };
}

function applyFixedAmountOffDiscount(rule: any, applicableItems: CartItem[]) {
  if (applicableItems.length === 0) {
    return null;
  }

  // Calculate discount
  const applicableTotal = applicableItems.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  );
  const discountAmount = Math.min(rule.discountAmount, applicableTotal);

  return {
    discountAmount,
    appliedToItems: applicableItems.map(item => item.id)
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
