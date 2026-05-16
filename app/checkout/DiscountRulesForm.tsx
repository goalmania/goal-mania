"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { refreshUserSession } from "@/lib/utils/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  SparklesIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  XMarkIcon,
  TagIcon,
  GiftIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline";

interface DiscountRule {
  _id: string;
  name: string;
  description: string;
  type: "quantity_based" | "buy_x_get_y" | "percentage_off" | "fixed_amount_off";
  discountAmount: number;
  discountPercentage?: number;
  appliedToItems: string[];
  freeItems?: Array<{
    productId: string;
    quantity: number;
    name: string;
  }>;
  isApplicable?: boolean;
  reason?: string;
  requirements?: {
    minQuantity?: number;
    maxQuantity?: number;
    currentQuantity: number;
    currentValue: number;
  };
  howToQualify?: string; // Added for eligibility information
}

interface DiscountRulesFormProps {
  cartItems: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    category?: string;
  }>;
  onApplyDiscounts: (discounts: DiscountRule[]) => void;
  isDisabled?: boolean;
}

export function DiscountRulesForm({
  cartItems,
  onApplyDiscounts,
  isDisabled = false,
}: DiscountRulesFormProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedDiscounts, setAppliedDiscounts] = useState<DiscountRule[]>([]);
  const [availableRules, setAvailableRules] = useState<DiscountRule[]>([]);
  
  // Add ref to prevent automatic rule application from running multiple times
  const hasAppliedAutomaticRules = useRef(false);

  // Memoize the fetchAvailableRules function to prevent recreation on every render
  const fetchAvailableRules = useCallback(async () => {
    console.log('🔍 Fetching available rules for cart items:', cartItems.length);
    try {
      const response = await fetch("/api/discount-rules/check-cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartItems }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Transform the API response to match our component's expected format
          const transformedRules = data.rules.map((rule: any) => ({
            _id: rule.ruleId,
            name: rule.ruleName,
            description: rule.description,
            type: rule.ruleType,
            isApplicable: rule.isApplicable,
            reason: rule.reason,
            discountAmount: rule.potentialDiscount,
            requirements: rule.requirements,
            howToQualify: rule.howToQualify // Added howToQualify
          }));
          
          console.log('✅ Found available rules:', transformedRules.length);
          console.log('🔍 Transformed rule data:', transformedRules);
          setAvailableRules(transformedRules);
        }
      }
    } catch (error) {
      console.error("Error fetching available rules:", error);
    }
  }, [cartItems]);

  // Memoize the checkAndApplyAutomaticRules function
  const checkAndApplyAutomaticRules = useCallback(async () => {
    // Prevent running multiple times
    if (hasAppliedAutomaticRules.current) {
      console.log('🚫 Automatic rules already applied, skipping...');
      return;
    }

    console.log('🎯 Checking for automatic rule application...');
    try {
      // Get rules that are ready to apply automatically
      const readyRules = availableRules.filter(rule => rule.isApplicable);
      
      if (readyRules.length > 0) {
        hasAppliedAutomaticRules.current = true;
        console.log('🚀 Applying automatic rules:', readyRules.length);
        
        // Log the rule details to debug
        console.log('🔍 Ready rules details:', readyRules.map((rule: any) => ({
          id: rule._id,
          name: rule.name,
          type: rule.type,
          requirements: rule.requirements
        })));
        
        // Apply all ready rules automatically using the rule IDs we already have
        const response = await fetch("/api/discount-rules/apply-specific", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            cartItems,
            ruleIds: readyRules.map((rule: any) => rule._id)
          }),
        });

        const data = await response.json();

        if (response.ok && data.success && data.appliedRules && data.appliedRules.length > 0) {
          const appliedRules = data.appliedRules.map((r: any) => ({
            ...r,
            _id: r.ruleId,
            isApplicable: true,
            reason: "Auto-applied"
          }));
          
          console.log('✅ Automatic rules applied successfully:', appliedRules.length);
          setAppliedDiscounts(appliedRules);
          
          // Only call onApplyDiscounts if we haven't already applied these rules
          if (appliedDiscounts.length === 0) {
            onApplyDiscounts(appliedRules);
          }
          
          if (data.appliedRules.length > 1) {
            toast.success(`${data.appliedRules.length} discount rules applied automatically!`);
          } else {
            toast.success(`Discount rule "${data.appliedRules[0].ruleName}" applied automatically!`);
          }
          
          // Refresh available rules to update the UI
          await fetchAvailableRules();
        }
      } else {
        console.log('ℹ️ No ready rules for automatic application');
      }
    } catch (error) {
      console.error("Error applying automatic rules:", error);
      // Reset the flag on error so it can try again
      hasAppliedAutomaticRules.current = false;
    }
  }, [availableRules, cartItems, onApplyDiscounts, fetchAvailableRules, appliedDiscounts.length]);

  // Check for available discount rules when cart items change
  useEffect(() => {
    console.log('🔄 useEffect triggered - cart items changed:', cartItems.length);
    if (cartItems.length > 0) {
      fetchAvailableRules();
      // Reset the automatic rules flag when cart items change
      hasAppliedAutomaticRules.current = false;
    } else {
      setAvailableRules([]);
      setAppliedDiscounts([]);
      hasAppliedAutomaticRules.current = false;
    }
  }, [cartItems, fetchAvailableRules]);

  // Separate useEffect for automatic rule application to prevent infinite loops
  useEffect(() => {
    console.log('🎯 useEffect for automatic rules - availableRules:', availableRules.length, 'cartItems:', cartItems.length, 'hasApplied:', hasAppliedAutomaticRules.current);
    if (availableRules.length > 0 && cartItems.length > 0 && !hasAppliedAutomaticRules.current) {
      // Only apply automatic rules if we have rules and haven't applied any yet
      if (appliedDiscounts.length === 0) {
        // Add a small delay to prevent rapid successive calls
        const timer = setTimeout(() => {
          checkAndApplyAutomaticRules();
        }, 100);
        
        return () => clearTimeout(timer);
      }
    }
  }, [availableRules, cartItems, appliedDiscounts.length, checkAndApplyAutomaticRules]);

  // Reset the automatic rules flag when component unmounts or when cart items change significantly
  useEffect(() => {
    return () => {
      hasAppliedAutomaticRules.current = false;
    };
  }, []);

  // Memoize the cart items to prevent unnecessary re-renders
  const memoizedCartItems = useMemo(() => cartItems, [cartItems]);

  // Memoize the available rules to prevent unnecessary re-renders
  const memoizedAvailableRules = useMemo(() => availableRules, [availableRules]);


  const handleApplyRule = async (rule: any) => {
    if (!rule.isApplicable) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/discount-rules/apply-specific", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          cartItems,
          ruleIds: [rule._id]
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to apply discount rule");
        return;
      }

      if (data.success && data.appliedRules && data.appliedRules.length > 0) {
        const appliedRules = data.appliedRules.map((r: any) => ({
          ...r,
          _id: r.ruleId,
          isApplicable: true,
          reason: "Applied"
        }));
        setAppliedDiscounts(appliedRules);
        onApplyDiscounts(appliedRules);
        toast.success(`Applied discount rule: ${rule.name}`);
        
        // Refresh available rules to update the UI
        await fetchAvailableRules();
      } else if (data.failedRules && data.failedRules.length > 0) {
        toast.error(data.failedRules[0].message || "Failed to apply discount rule");
      }
    } catch (err) {
      toast.error("Failed to apply discount rule");
    } finally {
      setIsLoading(false);
    }
  };

  const removeDiscount = (ruleId: string) => {
    const updatedDiscounts = appliedDiscounts.filter((d: DiscountRule) => d._id !== ruleId);
    setAppliedDiscounts(updatedDiscounts);
    onApplyDiscounts(updatedDiscounts);
    toast.success("Discount rule removed");
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

  const getRuleDescription = (rule: any) => {
    switch (rule.type) {
      case "quantity_based":
        if (rule.requirements?.minQuantity) {
          return `Buy ${rule.requirements.minQuantity}+ items`;
        } else if (rule.requirements?.maxQuantity) {
          return `Buy up to ${rule.requirements.maxQuantity} items`;
        }
        return "Quantity-based discount";
      case "buy_x_get_y":
        if (rule.requirements?.buyQuantity && rule.requirements?.getFreeQuantity) {
          return `Buy ${rule.requirements.buyQuantity}, get ${rule.requirements.getFreeQuantity} free`;
        }
        return "Buy X Get Y Free";
      case "percentage_off":
        // Use the discountAmount from the transformed rule data
        if (rule.discountAmount) {
          return `Save €${rule.discountAmount.toFixed(2)}`;
        }
        return "Percentage discount";
      case "fixed_amount_off":
        // Use the discountAmount from the transformed rule data
        if (rule.discountAmount) {
          return `Save €${rule.discountAmount.toFixed(2)}`;
        }
        return "Fixed amount discount";
      default:
        return rule.description;
    }
  };

  // Show rules to all users

  return (
    <Card className="border-2 border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 hover:border-[#c8f000]/20 transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-gradient-to-r from-[#c8f000] to-orange-500 rounded-lg">
            <SparklesIcon className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#0a0a0a] flex items-center gap-1">
              Available Discount Rules
            </h3>
            <p className="text-xs text-white/60">
              Rules are applied automatically when conditions are met
            </p>
          </div>
        </div>

        {/* Applied Discounts */}
        {appliedDiscounts.length > 0 && (
          <div className="space-y-3 mb-4">
            <h4 className="text-sm font-medium text-green-700">Applied Discounts</h4>
            {appliedDiscounts.map((discount) => (
              <div key={discount._id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      <h4 className="font-medium text-green-900">{discount.name}</h4>
                    </div>
                    <p className="text-sm text-green-700 mb-1">{discount.description}</p>
                    <div className="text-sm font-medium text-green-800">
                      {discount.discountPercentage 
                        ? `${discount.discountPercentage}% off`
                        : `€${discount.discountAmount.toFixed(2)} off`
                      }
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeDiscount(discount._id)}
                    className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Available Rules */}
        {availableRules.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-white/70">Available Rules</h4>
              <div className="text-xs text-white/50">
                {availableRules.filter(r => r.isApplicable).length} ready to apply
              </div>
            </div>
            {availableRules.map((rule) => (
              <div
                key={rule._id}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  rule.isApplicable
                    ? "border-green-300 bg-green-50"
                    : "border-white/8 bg-[#0a0a0a]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1 bg-gradient-to-r from-[#c8f000] to-orange-500 rounded">
                        {getRuleIcon(rule.type)}
                      </div>
                      <h4 className="font-medium text-white">{rule.name}</h4>
                      <Badge 
                        variant={rule.isApplicable ? "default" : "secondary"}
                        className={`text-xs ${rule.isApplicable ? 'bg-green-600' : 'bg-[#0a0a0a]0'}`}
                      >
                        {rule.isApplicable ? "Ready" : "Requirements"}
                      </Badge>
                    </div>
                    <p className="text-sm text-white/60 mb-2">{rule.description}</p>
                    <div className="text-sm font-medium text-[#c8f000] mb-1">
                      {getRuleDescription(rule)}
                    </div>
                    <div className="text-xs text-white/50">
                      {rule.isApplicable ? (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">Ready to apply - Save €{rule.discountAmount?.toFixed(2)}</span>
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            Auto-apply
                          </Badge>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="text-white/60">{rule.reason}</span>
                          {rule.howToQualify && (
                            <div className="text-[#c8f000] bg-blue-50 p-2 rounded border border-blue-200">
                              <div className="flex items-start gap-2">
                                <div className="text-[#c8f000] mt-0.5">💡</div>
                                <div className="text-xs">
                                  <div className="font-medium mb-1">How to qualify:</div>
                                  <div>{rule.howToQualify}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {rule.requirements && (
                        <div className="mt-1 text-xs">
                          {rule.requirements.minQuantity && (
                            <span className="block">Min: {rule.requirements.minQuantity} items</span>
                          )}
                          {rule.requirements.maxQuantity && (
                            <span className="block">Max: {rule.requirements.maxQuantity} items</span>
                          )}
                          {(rule.requirements as any).buyQuantity && (rule.requirements as any).getFreeQuantity && (
                            <span className="block">Buy {(rule.requirements as any).buyQuantity}, get {(rule.requirements as any).getFreeQuantity} free</span>
                          )}
                          <span className="block">Current: {rule.requirements.currentQuantity} items (€{rule.requirements.currentValue?.toFixed(2)})</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {rule.isApplicable && (
                    <Button
                      size="sm"
                      onClick={() => handleApplyRule(rule)}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-[#c8f000] to-orange-500 hover:from-[#e0852e] hover:to-orange-600 text-white"
                    >
                      Apply
                    </Button>
                  )}
                  {!rule.isApplicable && (
                    <div className="text-xs text-white/50 text-right">
                      <div className="text-red-500 font-medium">Not Eligible</div>
                      <div className="text-white/40">Complete requirements to apply</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50 mt-3">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertDescription className="text-red-700">
              <div className="flex items-center justify-between">
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-3 pt-3 border-t border-white/8">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <CheckCircleIcon className="h-3 w-3 text-green-500" />
            <span>
              Discount rules are applied automatically when conditions are met. You can also manually apply rules if needed.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
