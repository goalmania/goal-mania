"use client";

import { useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface ScalapayButtonProps {
  total: number;
  items: any[];
  guestEmail?: string;
  shippingAddress?: any;
  isDisabled?: boolean;
}

export default function ScalapayButton({
  total,
  items,
  guestEmail,
  shippingAddress,
  isDisabled = false,
}: ScalapayButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const installment = (total / 3).toFixed(2);

  const handleScalapay = async () => {
    if (isDisabled || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/scalapay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          totalAmount: total,
          guestEmail,
          shippingAddress,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Errore Scalapay");
      }

      // Redirect al checkout Scalapay
      window.location.href = data.checkoutUrl;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Errore Scalapay";
      setError(msg);
      toast.error(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Info rate */}
      <div className="flex items-center justify-center gap-2 text-xs text-white/40">
        <span>3 rate da</span>
        <span className="text-[#c8f000] font-bold text-sm">€{installment}</span>
        <span>senza interessi</span>
      </div>

      {/* Bottone Scalapay */}
      <button
        type="button"
        onClick={handleScalapay}
        disabled={isDisabled || isLoading}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-base transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: "#FF6384", color: "#ffffff" }}
      >
        {isLoading ? (
          <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Reindirizzamento...</>
        ) : (
          <>
            <svg width="22" height="16" viewBox="0 0 90 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M45 0C20.1 0 0 13.4 0 30C0 46.6 20.1 60 45 60C69.9 60 90 46.6 90 30C90 13.4 69.9 0 45 0Z" fill="white" fillOpacity="0.3"/>
              <text x="45" y="38" textAnchor="middle" fill="white" fontSize="22" fontWeight="900" fontFamily="sans-serif">S</text>
            </svg>
            Paga con Scalapay — 3 rate
          </>
        )}
      </button>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">
          <ExclamationTriangleIcon className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <p className="text-center text-[10px] text-white/20">
        Scalapay è un servizio di acquisto rateale. Soggetto ad approvazione.
      </p>
    </div>
  );
}
