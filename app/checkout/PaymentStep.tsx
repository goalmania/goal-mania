"use client";

import { useState, useEffect } from "react";
import { Elements, PaymentElement, useStripe, useElements, PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircleIcon, CreditCardIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Card, CardContent } from "@/components/ui/card";
import toast from "react-hot-toast";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import PayPalButton from "./PayPalButton";

// Stripe configuration - only loads when needed
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "");

// PayPal configuration - completely separate from Stripe
const paypalOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
  currency: "EUR",
  intent: "capture",
  // Add additional options to resolve authentication issues
  "enable-funding": "paylater,venmo",
  "disable-funding": "card",
  "data-client-token": "",
  "data-page-type": "checkout",
  // Ensure proper sandbox/live mode
  "data-sdk-integration-source": "button-factory",
  // Add debugging
  debug: process.env.NODE_ENV === "development",
  // Add additional options to help with authentication
  "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
  "merchant-id": process.env.NEXT_PUBLIC_PAYPAL_MERCHANT_ID || "",
};

// Log PayPal configuration for debugging
if (process.env.NODE_ENV === "development") {
  console.log("PayPal configuration:", {
    clientId: paypalOptions.clientId ? "✅ Set" : "❌ Missing",
    currency: paypalOptions.currency,
    intent: paypalOptions.intent,
    mode: process.env.PAYPAL_MODE || "sandbox",
    merchantId: process.env.NEXT_PUBLIC_PAYPAL_MERCHANT_ID ? "✅ Set" : "❌ Missing"
  });
}

// Stripe-specific payment component
function StripePayment({ 
  clientSecret, 
  total, 
  onSuccess 
}: { 
  clientSecret: string; 
  total: number; 
  onSuccess: () => void;
}) {
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
      total: { label: "Goal Mania Order", amount: Math.round(total * 100) },
      requestPayerName: true,
      requestPayerEmail: true,
    });
    
    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
        setCanMakePayment(true);
      }
    });
    
    pr.on("paymentmethod", async (e) => {
      setIsLoading(true);
      setError(null);
      try {
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: e.paymentMethod.id },
          { handleActions: false }
        );
        if (confirmError) {
          e.complete("fail");
          setError(confirmError.message || "Payment failed");
          setIsLoading(false);
          return;
        }
        e.complete("success");
        if (paymentIntent?.status === "requires_action") {
          const { error } = await stripe.confirmCardPayment(clientSecret);
          if (error) setError(error.message || "Payment failed");
          else {
            toast.success("Payment successful!");
            onSuccess();
          }
        } else {
          toast.success("Payment successful!");
          onSuccess();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Payment failed");
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
    if (error) setError(error.message || "Payment failed");
    else if (paymentIntent && ["succeeded", "processing"].includes(paymentIntent.status)) {
      toast.success(paymentIntent.status === "succeeded" ? "Payment successful!" : "Your payment is processing!");
      onSuccess();
    } else setError("Something went wrong with the payment");
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Express Checkout (Apple Pay, Google Pay) */}
      {canMakePayment && paymentRequest && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <p className="text-sm font-medium text-green-800">Express Checkout Available</p>
            </div>
            <PaymentRequestButtonElement options={{ paymentRequest, style: { paymentRequestButton: { theme: "dark", height: "48px" } } }} />
          </CardContent>
        </Card>
      )}
      
      {/* Stripe Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <PaymentElement className="mb-6" />
            {error && (
              <Alert variant="destructive" className="mb-4">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" disabled={!stripe || isLoading} className="w-full bg-[#f5963c] hover:bg-[#e0852e] text-white">
              {isLoading ? t("checkout.processing") : `Pay €${total.toFixed(2)}`}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

// Main payment component with method selection
function PaymentMethods({ 
  clientSecret, 
  total, 
  onSuccess, 
  items, 
  addressId, 
  coupon 
}: { 
  clientSecret: string; 
  total: number; 
  onSuccess: () => void;
  items: any[];
  addressId: string;
  coupon: any;
}) {
  const { t } = useTranslation();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"stripe" | "paypal">(
    clientSecret ? "stripe" : "paypal"
  );

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <Card className="border-2 border-gray-200">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-[#0e1924] mb-4">
            {t("checkout.choosePaymentMethod")}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Stripe Option - only show if clientSecret exists */}
            {clientSecret && (
              <button
                type="button"
                onClick={() => setSelectedPaymentMethod("stripe")}
                className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                  selectedPaymentMethod === "stripe"
                    ? "border-[#f5963c] bg-orange-50 shadow-md"
                    : "border-gray-200 hover:border-[#f5963c]/30 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCardIcon className="h-6 w-6 text-[#f5963c]" />
                  <div>
                    <p className="font-medium text-[#0e1924]">{t("checkout.payWithCard")}</p>
                    <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
                  </div>
                </div>
              </button>
            )}
            
            {/* PayPal Option - always available */}
            <button
              type="button"
              onClick={() => setSelectedPaymentMethod("paypal")}
              className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                selectedPaymentMethod === "paypal"
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 hover:border-blue-500/30 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.067 8.500c.492.315.844.825.844 1.406 0 .58-.352 1.09-.844 1.406l-3.547 2.266a1.5 1.5 0 0 1-.844.266H7.5c-.828 0-1.5-.672-1.5-1.5V7.5c0-.828.672-1.5 1.5-1.5h8.172c.316 0 .62.105.844.266l3.547 2.266z"/>
                </svg>
                <div>
                  <p className="font-medium text-[#0e1924]">{t("checkout.payWithPayPal")}</p>
                  <p className="text-sm text-gray-600">Fast & secure checkout</p>
                </div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Render selected payment method */}
      {selectedPaymentMethod === "stripe" && clientSecret ? (
        <StripePayment 
          clientSecret={clientSecret} 
          total={total} 
          onSuccess={onSuccess}
        />
      ) : (
        <PayPalButton
          total={total}
          items={items}
          addressId={addressId}
          coupon={coupon}
          onSuccess={onSuccess}
        />
      )}
    </div>
  );
}

// Main export component - handles provider wrapping
export default function PaymentStep({ 
  clientSecret, 
  total, 
  onSuccess, 
  items, 
  addressId, 
  coupon 
}: { 
  clientSecret: string; 
  total: number; 
  onSuccess: () => void;
  items: any[];
  addressId: string;
  coupon: any;
}) {
  // Always wrap with PayPalScriptProvider for PayPal functionality
  return (
    <PayPalScriptProvider 
      options={paypalOptions}
      deferLoading={false} // Ensure script loads immediately
    >
      {clientSecret ? (
        // If Stripe is available, wrap with Elements provider
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
          <PaymentMethods 
            clientSecret={clientSecret} 
            total={total} 
            onSuccess={onSuccess}
            items={items}
            addressId={addressId}
            coupon={coupon}
          />
        </Elements>
      ) : (
        // If no Stripe, just render PayPal
        <PaymentMethods 
          clientSecret="" 
          total={total} 
          onSuccess={onSuccess}
          items={items}
          addressId={addressId}
          coupon={coupon}
        />
      )}
    </PayPalScriptProvider>
  );
}


