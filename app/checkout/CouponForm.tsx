"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import {
  TicketIcon,
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
  const [couponCode, setCouponCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!couponCode.trim()) {
      setError("Per favore inserisci un codice coupon");
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
        setError(data.error || "Impossibile validare il coupon");
        return;
      }

      toast.success(data.message);
      onApplyCoupon(data.discountPercentage, data.couponId, couponCode);
      setCouponCode(""); // Clear input after successful application
    } catch (err) {
      setError("Si è verificato un errore durante la validazione del coupon");
      console.error("Coupon validation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <TicketIcon className="h-3.5 w-3.5 text-[#c8f000]" />
        <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Hai un coupon?</span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Inserisci codice sconto"
            className="h-10 bg-white/5 border border-white/10 text-white placeholder:text-white/25 rounded-xl focus:border-[#c8f000] focus:ring-0 text-sm pr-8"
            disabled={isDisabled || isLoading}
          />
          {couponCode && (
            <button
              type="button"
              onClick={() => setCouponCode("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              <XMarkIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={isDisabled || isLoading || !couponCode.trim()}
          className="h-10 px-4 bg-[#c8f000] hover:bg-[#d4f520] text-black text-sm font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          {isLoading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : "Applica"}
        </button>
      </form>

      {error && (
        <div className="flex items-center justify-between text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          <span>{error}</span>
          <button onClick={clearError}><XMarkIcon className="h-3.5 w-3.5" /></button>
        </div>
      )}
    </div>
  );
}
