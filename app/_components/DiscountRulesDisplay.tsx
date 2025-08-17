"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SparklesIcon, TagIcon, GiftIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

interface DiscountRule {
  _id: string;
  name: string;
  description: string;
  type: "quantity_based" | "buy_x_get_y" | "percentage_off" | "fixed_amount_off";
  isActive: boolean;
  expiresAt?: string;
  maxUses?: number;
  currentUses: number;
  priority: number;
  minQuantity?: number;
  maxQuantity?: number;
  discountPercentage?: number;
  discountAmount?: number;
  buyQuantity?: number;
  getFreeQuantity?: number;
  freeProductIds?: string[];
  applicableCategories?: string[];
  applicableProductIds?: string[];
  excludedProductIds?: string[];
}

interface DiscountRulesDisplayProps {
  productId: string;
  productCategory?: string;
  onApplyDiscount?: (rule: DiscountRule) => void;
  showToAllUsers?: boolean;
  autoApply?: boolean;
}

export default function DiscountRulesDisplay({ 
  productId, 
  productCategory, 
  onApplyDiscount,
  showToAllUsers = false,
  autoApply = false
}: DiscountRulesDisplayProps) {
  const { t } = useTranslation();
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedRules, setAppliedRules] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchApplicableDiscountRules();
  }, [productId, productCategory]);

  const fetchApplicableDiscountRules = async () => {
    try {
      const response = await fetch("/api/discount-rules/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItems: [{
            id: productId,
            name: "Product",
            price: 0,
            quantity: 1,
            image: "",
            category: productCategory
          }]
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Get the rules that were applied to understand which ones are applicable
        if (data.discounts && data.discounts.length > 0) {
          // Fetch the actual rule details to display
          await fetchRuleDetails();
        } else {
          setDiscountRules([]);
        }
      } else {
        setDiscountRules([]);
      }
    } catch (error) {
      console.error("Error fetching discount rules:", error);
      setDiscountRules([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRuleDetails = async () => {
    try {
      const response = await fetch("/api/admin/discount-rules");
      if (response.ok) {
        const allRules = await response.json();
        // Filter rules that apply to this product
        const applicableRules = allRules.filter((rule: DiscountRule) => {
          if (!rule.isActive) return false;
          
          // Check if product is excluded
          if (rule.excludedProductIds && rule.excludedProductIds.includes(productId)) {
            return false;
          }
          
          // Check if product is specifically included
          if (rule.applicableProductIds && rule.applicableProductIds.length > 0) {
            return rule.applicableProductIds.includes(productId);
          }
          
          // Check if product category is applicable
          if (rule.applicableCategories && rule.applicableCategories.length > 0) {
            return productCategory && rule.applicableCategories.includes(productCategory);
          }
          
          // If no specific targeting, apply to all products
          return true;
        });
        
        setDiscountRules(applicableRules);
      }
    } catch (error) {
      console.error("Error fetching rule details:", error);
    }
  };

  const handleApplyRule = (rule: DiscountRule) => {
    if (onApplyDiscount) {
      onApplyDiscount(rule);
      setAppliedRules(prev => new Set(prev).add(rule._id));
      toast.success(`Applied discount rule: ${rule.name}`);
    }
  };

  const getRuleIcon = (type: string) => {
    switch (type) {
      case "quantity_based":
        return <TagIcon className="h-4 w-4" />;
      case "buy_x_get_y":
        return <GiftIcon className="h-4 w-4" />;
      case "percentage_off":
        return <CurrencyDollarIcon className="h-4 w-4" />;
      case "fixed_amount_off":
        return <CurrencyDollarIcon className="h-4 w-4" />;
      default:
        return <SparklesIcon className="h-4 w-4" />;
    }
  };

  const getRuleDescription = (rule: DiscountRule) => {
    switch (rule.type) {
      case "quantity_based":
        if (rule.minQuantity && rule.maxQuantity) {
          return `Buy ${rule.minQuantity}-${rule.maxQuantity} items`;
        } else if (rule.minQuantity) {
          return `Buy ${rule.minQuantity}+ items`;
        } else if (rule.maxQuantity) {
          return `Buy up to ${rule.maxQuantity} items`;
        }
        return "Quantity-based discount";
      case "buy_x_get_y":
        return `Buy ${rule.buyQuantity}, get ${rule.getFreeQuantity} free`;
      case "percentage_off":
        return `${rule.discountPercentage}% off`;
      case "fixed_amount_off":
        return `€${rule.discountAmount} off`;
      default:
        return rule.description;
    }
  };

  if (loading) {
    return (
      <Card className="border-2 border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (discountRules.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-[#f5963c]" />
          {t("shop.offers.availableOffers")}
        </CardTitle>
        <CardDescription>
          {autoApply 
            ? "Rules are applied automatically when conditions are met"
            : t("shop.offers.automaticDiscounts")
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {discountRules.map((rule) => (
          <div
            key={rule._id}
            className={`p-3 rounded-lg border transition-all duration-200 ${
              appliedRules.has(rule._id)
                ? "border-green-300 bg-green-50"
                : "border-gray-200 bg-white hover:border-[#f5963c]/30"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-gradient-to-r from-[#f5963c] to-orange-500 rounded">
                    {getRuleIcon(rule.type)}
                  </div>
                  <h4 className="font-medium text-gray-900">{rule.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {rule.type === "quantity_based" && t("admin.discountRules.quantityBased")}
                    {rule.type === "buy_x_get_y" && t("admin.discountRules.buyXGetY")}
                    {rule.type === "percentage_off" && t("admin.discountRules.percentageOff")}
                    {rule.type === "fixed_amount_off" && t("admin.discountRules.fixedAmountOff")}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                <div className="text-sm font-medium text-[#f5963c]">
                  {getRuleDescription(rule)}
                </div>
                {rule.maxUses && (
                  <div className="text-xs text-gray-500 mt-1">
                    {rule.currentUses} / {rule.maxUses} uses
                  </div>
                )}
              </div>
              {!appliedRules.has(rule._id) && onApplyDiscount && (
                <Button
                  size="sm"
                  onClick={() => handleApplyRule(rule)}
                  className="bg-gradient-to-r from-[#f5963c] to-orange-500 hover:from-[#e0852e] hover:to-orange-600 text-white"
                >
                  Apply
                </Button>
              )}
              {appliedRules.has(rule._id) && (
                <Badge variant="default" className="bg-green-600">
                  Applied
                </Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
