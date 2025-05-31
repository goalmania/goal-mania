"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { refreshUserSession } from "@/lib/utils/session";

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

  // Check premium status whenever session changes
  useEffect(() => {
    const userRole = session?.user?.role;
    const premium = userRole === "premium" || userRole === "admin";
    setIsPremiumUser(premium);
  }, [session?.user?.role]);

  // Force refresh session when component mounts
  useEffect(() => {
    if (session?.user) {
      refreshUserSession(updateSession, session)
        .then((userData) => {
          // Directly update premium status based on the response
          const premium =
            userData?.role === "premium" || userData?.role === "admin";
          setIsPremiumUser(premium);
        })
        .catch((error) => {
          console.error("Error refreshing session:", error);
        });
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
    } catch (err) {
      setError("An error occurred while validating the coupon");
      console.error("Coupon validation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything if not premium
  if (!isPremiumUser) {
    return null;
  }

  return (
    <div className="mb-6 p-4 border border-gray-200 rounded-md">
      <h3 className="text-sm font-medium text-black mb-2">Have a coupon?</h3>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          placeholder="Enter coupon code"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black h-10"
          disabled={isDisabled || isLoading}
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 h-10"
          disabled={isDisabled || isLoading}
        >
          {isLoading ? "Applying..." : "Apply"}
        </button>
      </form>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
}
