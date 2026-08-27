// Server-side recalculation of "buy X get Y" / quantity / percentage / fixed
// discount rules, shared by the checkout PaymentIntent creation.
//
// IMPORTANT: never trust a discount amount sent by the client for anything
// that touches money (the Stripe PaymentIntent amount) — always recompute it
// here from the DB rule + the server's own view of the cart. This mirrors
// the logic in app/api/discount-rules/apply-specific/route.ts.

export interface DiscountCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

export function isItemApplicable(rule: any, item: DiscountCartItem): boolean {
  if (rule.excludedProductIds && rule.excludedProductIds.includes(item.id)) {
    return false;
  }
  if (rule.applicableProductIds && rule.applicableProductIds.length > 0) {
    return rule.applicableProductIds.includes(item.id);
  }
  if (rule.applicableCategories && rule.applicableCategories.length > 0) {
    return !!(item.category && rule.applicableCategories.includes(item.category));
  }
  return true;
}

function applyQuantityBasedDiscount(rule: any, applicableItems: DiscountCartItem[]) {
  const totalQuantity = applicableItems.reduce((sum, item) => sum + item.quantity, 0);
  if (rule.minQuantity && totalQuantity < rule.minQuantity) return 0;
  if (rule.maxQuantity && totalQuantity > rule.maxQuantity) return 0;

  if (rule.discountPercentage) {
    const applicableTotal = applicableItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return (applicableTotal * rule.discountPercentage) / 100;
  }
  if (rule.discountAmount) return rule.discountAmount;
  return 0;
}

function applyBuyXGetYDiscount(rule: any, applicableItems: DiscountCartItem[]) {
  if (!rule.buyQuantity || !rule.getFreeQuantity) return 0;

  const totalQuantity = applicableItems.reduce((sum, item) => sum + item.quantity, 0);
  const minRequired = rule.buyQuantity + rule.getFreeQuantity;
  if (totalQuantity < minRequired) return 0;

  const ruleApplications = Math.floor(totalQuantity / minRequired);
  let freeQuantity = ruleApplications * rule.getFreeQuantity;

  let discountAmount = 0;

  if (rule.freeProductIds && rule.freeProductIds.length > 0) {
    for (const productId of rule.freeProductIds) {
      const item = applicableItems.find((i) => i.id === productId);
      if (item) {
        const itemFreeQuantity = Math.min(freeQuantity, item.quantity);
        discountAmount += item.price * itemFreeQuantity;
      }
    }
    return discountAmount;
  }

  // Cheapest item(s) are free
  const sortedItems = [...applicableItems].sort((a, b) => a.price - b.price);
  for (const item of sortedItems) {
    if (freeQuantity <= 0) break;
    const itemFreeQuantity = Math.min(freeQuantity, item.quantity);
    discountAmount += item.price * itemFreeQuantity;
    freeQuantity -= itemFreeQuantity;
  }
  return discountAmount;
}

function applyPercentageOffDiscount(rule: any, applicableItems: DiscountCartItem[]) {
  if (applicableItems.length === 0) return 0;
  const applicableTotal = applicableItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return (applicableTotal * rule.discountPercentage) / 100;
}

function applyFixedAmountOffDiscount(rule: any, applicableItems: DiscountCartItem[]) {
  if (applicableItems.length === 0) return 0;
  const applicableTotal = applicableItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return Math.min(rule.discountAmount, applicableTotal);
}

/**
 * Recomputes the real discount amount for one active DB rule against the
 * server's own cart items. Returns 0 if the rule no longer applies (e.g. the
 * cart changed after the client last checked).
 */
export function calculateRuleDiscount(rule: any, cartItems: DiscountCartItem[]): number {
  const applicableItems = cartItems.filter((item) => isItemApplicable(rule, item));
  if (applicableItems.length === 0) return 0;

  switch (rule.type) {
    case "quantity_based":
      return applyQuantityBasedDiscount(rule, applicableItems);
    case "buy_x_get_y":
      return applyBuyXGetYDiscount(rule, applicableItems);
    case "percentage_off":
      return applyPercentageOffDiscount(rule, applicableItems);
    case "fixed_amount_off":
      return applyFixedAmountOffDiscount(rule, applicableItems);
    default:
      return 0;
  }
}
