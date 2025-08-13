/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { refreshUserSession } from "@/lib/utils/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TicketIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  SparklesIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

interface CouponFormProps {
  onApplyCoupon: (
    discountPercentage: number,
    couponId: string,
    code: string
  ) => void;
  isDisabled?: boolean;
}

export function CouponForm({
  onApplyCoupon,
  isDisabled = false,
}: CouponFormProps) {
  const { data: session, update: updateSession } = useSession();
  const [couponCode, setCouponCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  // Check premium status whenever session changes
  useEffect(() => {
    const userRole = session?.user?.role;
    const premium = userRole === "premium" || userRole === "admin";
    setIsPremiumUser(premium);
    setIsSessionLoading(false);
  }, [session?.user?.role]);

  // Force refresh session when component mounts
  useEffect(() => {
    if (session?.user) {
      setIsSessionLoading(true);
      refreshUserSession(updateSession, session)
        .then((userData) => {
          // Directly update premium status based on the response
          const premium =
            userData?.role === "premium" || userData?.role === "admin";
          setIsPremiumUser(premium);
        })
        .catch((error) => {
          console.error("Error refreshing session:", error);
        })
        .finally(() => {
          setIsSessionLoading(false);
        });
    } else {
      setIsSessionLoading(false);
    }
  }, [session?.user?.id, updateSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPremiumUser) {
      toast.error("Only premium users can apply coupons");
      return;
    }

    if (!couponCode.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: couponCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to validate coupon");
        return;
      }

      toast.success(data.message);
      onApplyCoupon(data.discountPercentage, data.couponId, couponCode);
      setCouponCode(""); // Clear input after successful application
    } catch (err) {
      setError("An error occurred while validating the coupon");
      console.error("Coupon validation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Show loading skeleton while checking premium status
  if (isSessionLoading) {
    return (
      <Card className="border-2 border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1 rounded" />
            <Skeleton className="h-10 w-20 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't render anything if not premium
  if (!isPremiumUser) {
    return null;
  }

  return (
    <Card className="border-2 border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 hover:border-[#f5963c]/20 transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-gradient-to-r from-[#f5963c] to-orange-500 rounded-lg">
            <TicketIcon className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#0e1924] flex items-center gap-1">
              Have a coupon?
              <Badge variant="secondary" className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                Premium
              </Badge>
            </h3>
            <p className="text-xs text-gray-600">Enter your discount code</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="pr-10 h-10 border-2 border-gray-200 focus:border-[#f5963c] focus:ring-[#f5963c]/20 transition-all duration-200"
                disabled={isDisabled || isLoading}
              />
              {couponCode && (
                <button
                  type="button"
                  onClick={() => setCouponCode("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              type="submit"
              disabled={isDisabled || isLoading || !couponCode.trim()}
              className="h-10 bg-gradient-to-r from-[#f5963c] to-orange-500 hover:from-[#e0852e] hover:to-orange-600 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Applying...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <SparklesIcon className="h-4 w-4" />
                  Apply
                </div>
              )}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertDescription className="text-red-700">
                <div className="flex items-center justify-between">
                  <span>{error}</span>
                  <button
                    onClick={clearError}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </form>

        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <CheckCircleIcon className="h-3 w-3 text-green-500" />
            <span>Premium users get exclusive access to discount codes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
