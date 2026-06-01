"use client";

import { useState, useEffect } from "react";
import { Elements, PaymentElement, useStripe, useElements, PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CheckCircleIcon, ExclamationTriangleIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import PayPalButton from "./PayPalButton";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "");

const stripeAppearance = {
  theme: "night" as const,
  variables: {
    colorPrimary: "#c8f000",
    colorBackground: "#111111",
    colorText: "#ffffff",
    colorTextSecondary: "rgba(255,255,255,0.5)",
    colorTextPlaceholder: "rgba(255,255,255,0.25)",
    colorDanger: "#f87171",
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSizeBase: "14px",
    borderRadius: "12px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": {
      border: "1px solid rgba(255,255,255,0.1)",
      backgroundColor: "rgba(255,255,255,0.05)",
      color: "#ffffff",
    },
    ".Input:focus": {
      border: "1px solid #c8f000",
      boxShadow: "0 0 0 3px rgba(200,240,0,0.1)",
    },
    ".Label": {
      color: "rgba(255,255,255,0.6)",
      fontSize: "11px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    ".Tab": {
      border: "1px solid rgba(255,255,255,0.08)",
      backgroundColor: "rgba(255,255,255,0.03)",
    },
    ".Tab:hover": {
      border: "1px solid rgba(200,240,0,0.3)",
    },
    ".Tab--selected": {
      border: "1px solid #c8f000",
      backgroundColor: "rgba(200,240,0,0.08)",
    },
  },
};

const paypalOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
  currency: "EUR",
  intent: "capture",
  "enable-funding": "paylater,venmo",
  "disable-funding": "card",
  "data-sdk-integration-source": "button-factory",
  debug: process.env.NODE_ENV === "development",
  "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
  "merchant-id": process.env.NEXT_PUBLIC_PAYPAL_MERCHANT_ID || "",
};

// ── Stripe form ──────────────────────────────────────────────────────────────
function StripePayment({ clientSecret, total, onSuccess }: { clientSecret: string; total: number; onSuccess: () => void }) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);

  useEffect(() => {
    if (!stripe || !clientSecret) return;
    const pr = stripe.paymentRequest({
      country: "IT",
      currency: "eur",
      total: { label: "Goal Mania", amount: Math.round(total * 100) },
      requestPayerName: true,
      requestPayerEmail: true,
    });
    pr.canMakePayment().then((result) => {
      if (result) { setPaymentRequest(pr); setCanMakePayment(true); }
    });
    pr.on("paymentmethod", async (e) => {
      setIsLoading(true);
      setError(null);
      try {
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, { payment_method: e.paymentMethod.id }, { handleActions: false });
        if (confirmError) { e.complete("fail"); setError(confirmError.message || "Pagamento fallito"); setIsLoading(false); return; }
        e.complete("success");
        if (paymentIntent?.status === "requires_action") {
          const { error } = await stripe.confirmCardPayment(clientSecret);
          if (error) setError(error.message || "Pagamento fallito");
          else { toast.success("Pagamento completato!"); onSuccess(); }
        } else { toast.success("Pagamento completato!"); onSuccess(); }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Pagamento fallito");
        e.complete("fail");
      }
      setIsLoading(false);
    });
  }, [stripe, total, clientSecret, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsLoading(true);
    setError(null);
    const { error, paymentIntent } = await stripe.confirmPayment({ elements, redirect: "if_required" });
    if (error) {
      setError(error.message || "Pagamento fallito");
    } else if (paymentIntent && ["succeeded", "processing"].includes(paymentIntent.status)) {
      toast.success(paymentIntent.status === "succeeded" ? "Pagamento completato!" : "Pagamento in elaborazione!");
      onSuccess();
    } else {
      setError("Si è verificato un errore con il pagamento");
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Express Checkout (Apple Pay / Google Pay) */}
      {canMakePayment && paymentRequest && (
        <div className="space-y-2">
          <p className="text-xs text-white/40 uppercase tracking-wider font-semibold text-center">Pagamento rapido</p>
          <PaymentRequestButtonElement
            options={{
              paymentRequest,
              style: { paymentRequestButton: { theme: "dark", height: "48px", type: "buy" } },
            }}
          />
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-white/30">oppure paga con carta</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>
        </div>
      )}

      {/* Stripe Payment Element */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <PaymentElement
          options={{
            layout: { type: "tabs", defaultCollapsed: false },
            paymentMethodOrder: ["card", "apple_pay", "google_pay", "klarna", "paypal"],
          }}
        />

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
            <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || isLoading}
          className="w-full flex items-center justify-center gap-2 bg-[#c8f000] hover:bg-[#d4f520] text-black font-black text-base py-4 rounded-2xl active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <><div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />Elaborazione...</>
          ) : (
            <><LockClosedIcon className="w-4 h-4" />Paga €{total.toFixed(2)}</>
          )}
        </button>

        <p className="text-center text-xs text-white/25 flex items-center justify-center gap-1">
          <LockClosedIcon className="w-3 h-3" />
          Pagamento sicuro con crittografia SSL
        </p>
      </form>
    </div>
  );
}

// ── Metodi di pagamento ──────────────────────────────────────────────────────
function PaymentMethods({ clientSecret, total, onSuccess, items, addressId, coupon }: {
  clientSecret: string; total: number; onSuccess: () => void; items: any[]; addressId: string; coupon: any;
}) {
  const [selectedMethod, setSelectedMethod] = useState<"stripe" | "paypal">(clientSecret ? "stripe" : "paypal");

  return (
    <div className="space-y-5">
      {/* Selezione metodo */}
      <div className="grid grid-cols-2 gap-3">
        {clientSecret && (
          <button
            type="button"
            onClick={() => setSelectedMethod("stripe")}
            className={`p-3.5 border rounded-xl text-left transition-all duration-150 ${
              selectedMethod === "stripe"
                ? "border-[#c8f000] bg-[#c8f000]/8"
                : "border-white/10 hover:border-white/20 bg-white/3"
            }`}
          >
            <p className={`font-semibold text-sm ${selectedMethod === "stripe" ? "text-white" : "text-white/60"}`}>
              💳 Carta / Link
            </p>
            <p className="text-[11px] text-white/30 mt-0.5">Visa, MC, Amex, Klarna</p>
          </button>
        )}

        <button
          type="button"
          onClick={() => setSelectedMethod("paypal")}
          className={`p-3.5 border rounded-xl text-left transition-all duration-150 ${
            selectedMethod === "paypal"
              ? "border-[#c8f000] bg-[#c8f000]/8"
              : "border-white/10 hover:border-white/20 bg-white/3"
          }`}
        >
          <p className={`font-semibold text-sm ${selectedMethod === "paypal" ? "text-white" : "text-white/60"}`}>
            🅿️ PayPal
          </p>
          <p className="text-[11px] text-white/30 mt-0.5">Veloce e sicuro</p>
        </button>

        {/* Scalapay — presto */}
        <div className="p-3.5 border border-dashed border-white/6 rounded-xl opacity-40 cursor-not-allowed">
          <p className="font-semibold text-sm text-white/30">Scalapay</p>
          <p className="text-[10px] text-white/20 mt-0.5 uppercase tracking-widest font-mono">Presto disponibile</p>
        </div>
      </div>

      {/* Form del metodo selezionato */}
      <div>
        {selectedMethod === "stripe" && clientSecret ? (
          <StripePayment clientSecret={clientSecret} total={total} onSuccess={onSuccess} />
        ) : (
          <PayPalButton total={total} items={items} addressId={addressId} coupon={coupon} onSuccess={onSuccess} />
        )}
      </div>
    </div>
  );
}

// ── Export principale ────────────────────────────────────────────────────────
export default function PaymentStep({ clientSecret, total, onSuccess, items, addressId, coupon }: {
  clientSecret: string; total: number; onSuccess: () => void; items: any[]; addressId: string; coupon: any;
}) {
  return (
    <PayPalScriptProvider options={paypalOptions} deferLoading={false}>
      {clientSecret ? (
        <Elements
          stripe={stripePromise}
          options={{ clientSecret, appearance: stripeAppearance }}
        >
          <PaymentMethods clientSecret={clientSecret} total={total} onSuccess={onSuccess} items={items} addressId={addressId} coupon={coupon} />
        </Elements>
      ) : (
        <PaymentMethods clientSecret="" total={total} onSuccess={onSuccess} items={items} addressId={addressId} coupon={coupon} />
      )}
    </PayPalScriptProvider>
  );
}
