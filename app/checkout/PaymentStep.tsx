"use client";

import { useState, useEffect } from "react";
import { Elements, PaymentElement, useStripe, useElements, PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircleIcon, CreditCardIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Card, CardContent } from "@/components/ui/card";
import toast from "react-hot-toast";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "");

function InnerPayment({ clientSecret, total, onSuccess }: { clientSecret: string; total: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);

  useEffect(() => {
    if (!stripe) return;
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
      {canMakePayment && paymentRequest ? (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <p className="text-sm font-medium text-green-800">Express Checkout Available</p>
            </div>
            <PaymentRequestButtonElement options={{ paymentRequest, style: { paymentRequestButton: { theme: "dark", height: "48px" } } }} />
          </CardContent>
        </Card>
      ) : null}
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
              {isLoading ? "Processing..." : `Pay €${total.toFixed(2)}`}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

export default function PaymentStep({ clientSecret, total, onSuccess }: { clientSecret: string; total: number; onSuccess: () => void }) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
      <InnerPayment clientSecret={clientSecret} total={total} onSuccess={onSuccess} />
    </Elements>
  );
}


