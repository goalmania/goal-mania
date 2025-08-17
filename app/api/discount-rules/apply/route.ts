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

export interface DiscountResult {
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
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
        discounts: [],
        message: "No applicable discount rules found"
      });
    }

    const appliedDiscounts: DiscountResult[] = [];
    let totalDiscountAmount = 0;

    // Process each rule in priority order
    for (const rule of activeRules) {
      const discountResult = await applyDiscountRule(rule, cartItems);
      
      if (discountResult) {
        appliedDiscounts.push(discountResult);
        totalDiscountAmount += discountResult.discountAmount;
        
        // Increment usage count
        rule.currentUses += 1;
        await rule.save();
      }
    }

    return NextResponse.json({
      success: true,
      discounts: appliedDiscounts,
      totalDiscountAmount,
      message: `Applied ${appliedDiscounts.length} discount rule(s)`
    });

  } catch (error) {
    console.error("Error applying discount rules:", error);
    return NextResponse.json(
      { error: "Failed to apply discount rules" },
      { status: 500 }
    );
  }
}

async function applyDiscountRule(rule: any, cartItems: CartItem[]): Promise<DiscountResult | null> {
  try {
    let discountAmount = 0;
    let appliedToItems: string[] = [];
    let freeItems: Array<{ productId: string; quantity: number; name: string }> = [];

    switch (rule.type) {
      case "quantity_based":
        const quantityResult = applyQuantityBasedDiscount(rule, cartItems);
        if (quantityResult) {
          discountAmount = quantityResult.discountAmount;
          appliedToItems = quantityResult.appliedToItems;
        }
        break;

      case "buy_x_get_y":
        const buyXGetYResult = applyBuyXGetYDiscount(rule, cartItems);
        if (buyXGetYResult) {
          discountAmount = buyXGetYResult.discountAmount;
          appliedToItems = buyXGetYResult.appliedToItems;
          freeItems = buyXGetYResult.freeItems;
        }
        break;

      case "percentage_off":
        const percentageResult = applyPercentageOffDiscount(rule, cartItems);
        if (percentageResult) {
          discountAmount = percentageResult.discountAmount;
          appliedToItems = percentageResult.appliedToItems;
        }
        break;

      case "fixed_amount_off":
        const fixedResult = applyFixedAmountOffDiscount(rule, cartItems);
        if (fixedResult) {
          discountAmount = fixedResult.discountAmount;
          appliedToItems = fixedResult.appliedToItems;
        }
        break;
    }

    if (discountAmount > 0) {
      return {
        ruleId: rule._id.toString(),
        ruleName: rule.name,
        ruleType: rule.type,
        description: rule.description,
        discountAmount,
        discountPercentage: rule.discountPercentage,
        appliedToItems,
        freeItems
      };
    }

    return null;
  } catch (error) {
    console.error(`Error applying ${rule.type} discount rule:`, error);
    return null;
  }
}

function applyQuantityBasedDiscount(rule: any, cartItems: CartItem[]) {
  let totalQuantity = 0;
  let applicableItems: CartItem[] = [];

  // Filter items based on rule criteria
  for (const item of cartItems) {
    if (isItemApplicable(rule, item)) {
      totalQuantity += item.quantity;
      applicableItems.push(item);
    }
  }

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

function applyBuyXGetYDiscount(rule: any, cartItems: CartItem[]) {
  let applicableItems: CartItem[] = [];
  let totalQuantity = 0;

  // Filter items based on rule criteria
  for (const item of cartItems) {
    if (isItemApplicable(rule, item)) {
      applicableItems.push(item);
      totalQuantity += item.quantity;
    }
  }

  if (totalQuantity < rule.buyQuantity) {
    return null;
  }

  // Calculate how many times the rule can be applied
  const ruleApplications = Math.floor(totalQuantity / rule.buyQuantity);
  const freeQuantity = ruleApplications * rule.getFreeQuantity;

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
      name: `${freeQuantity} item(s) free`
    }]
  };
}

function applyPercentageOffDiscount(rule: any, cartItems: CartItem[]) {
  let applicableItems: CartItem[] = [];

  // Filter items based on rule criteria
  for (const item of cartItems) {
    if (isItemApplicable(rule, item)) {
      applicableItems.push(item);
    }
  }

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

function applyFixedAmountOffDiscount(rule: any, cartItems: CartItem[]) {
  let applicableItems: CartItem[] = [];

  // Filter items based on rule criteria
  for (const item of cartItems) {
    if (isItemApplicable(rule, item)) {
      applicableItems.push(item);
    }
  }

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
