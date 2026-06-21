"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { refreshUserSession } from "@/lib/utils/session";
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

  if (availableRules.length === 0 && appliedDiscounts.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <SparklesIcon className="h-3.5 w-3.5 text-[#c8f000]" />
        <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Promozioni attive</span>
      </div>

      {/* Sconti già applicati */}
      {appliedDiscounts.map((discount) => (
        <div key={discount._id} className="flex items-center justify-between bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-3 py-2">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-emerald-400">{discount.name}</p>
              <p className="text-[10px] text-emerald-400/70">
                {discount.type === "buy_x_get_y" && discount.freeItems?.length
                  ? `${discount.freeItems[0].name} in omaggio — −€${discount.discountAmount.toFixed(2)}`
                  : discount.discountPercentage
                  ? `${discount.discountPercentage}% di sconto`
                  : `−€${discount.discountAmount.toFixed(2)}`}
              </p>
            </div>
          </div>
          <button onClick={() => removeDiscount(discount._id)} className="text-white/30 hover:text-white/60">
            <XMarkIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      {/* Regole disponibili */}
      {availableRules.map((rule) => (
        <div
          key={rule._id}
          className={`rounded-xl border px-3 py-2.5 ${
            rule.isApplicable
              ? "border-[#c8f000]/30 bg-[#c8f000]/5"
              : "border-white/8 bg-white/3"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold text-white truncate">{rule.name}</span>
                {rule.isApplicable && (
                  <span className="text-[9px] bg-[#c8f000]/20 text-[#c8f000] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide flex-shrink-0">Attivo</span>
                )}
              </div>
              {rule.isApplicable ? (
                <p className="text-[11px] text-emerald-400">
                  {rule.type === "buy_x_get_y"
                    ? `L'articolo meno caro è gratis — risparmia €${rule.discountAmount?.toFixed(2)}`
                    : `Risparmia €${rule.discountAmount?.toFixed(2)}`
                  } — applicato automaticamente
                </p>
              ) : (
                <div>
                  <p className="text-[11px] text-white/40">{rule.howToQualify || rule.reason}</p>
                  {rule.requirements && (
                    <p className="text-[10px] text-white/30 mt-0.5">
                      Attuale: {rule.requirements.currentQuantity} articoli (€{rule.requirements.currentValue?.toFixed(2)})
                    </p>
                  )}
                </div>
              )}
            </div>
            {rule.isApplicable && (
              <button
                onClick={() => handleApplyRule(rule)}
                disabled={isLoading}
                className="text-xs bg-[#c8f000] hover:bg-[#d4f520] text-black font-bold px-3 py-1.5 rounded-lg flex-shrink-0 disabled:opacity-50"
              >
                Applica
              </button>
            )}
            {!rule.isApplicable && (
              <span className="text-[10px] text-white/30 flex-shrink-0 text-right leading-tight">
                Non<br/>idoneo
              </span>
            )}
          </div>
        </div>
      ))}

      {error && (
        <div className="flex items-center justify-between text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          <span>{error}</span>
          <button onClick={() => setError(null)}><XMarkIcon className="h-3.5 w-3.5" /></button>
        </div>
      )}
    </div>
  );
}
