"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";

interface PayPalButtonProps {
  total: number;
  items: any[];
  addressId: string;
  coupon: any;
  onSuccess: () => void;
}

export default function PayPalButton({ total, items, addressId, coupon, onSuccess }: PayPalButtonProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get PayPal script status
  const [{ isPending, isRejected }] = usePayPalScriptReducer();

  // Check if PayPal client ID is available
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  
  if (!paypalClientId) {
    return (
      <Card className="border-2 border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            <p className="text-sm font-medium text-red-800">PayPal Configuration Error</p>
          </div>
          <p className="text-sm text-red-700 mb-4">
            PayPal is not properly configured. Please contact support or try using card payment instead.
          </p>
          <Button 
            onClick={() => window.location.href = "/checkout?payment_method=stripe"} 
            variant="outline" 
            size="sm"
            className="text-red-700 border-red-300 hover:bg-red-100"
          >
            Use Card Payment Instead
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Add a small delay to ensure PayPal script is fully loaded
  const [isScriptReady, setIsScriptReady] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if PayPal script is properly loaded
      if (typeof window !== 'undefined' && (window as any).paypal) {
        console.log("PayPal script loaded successfully");
        setIsScriptReady(true);
      } else {
        console.error("PayPal script not found in window object");
        setError("PayPal script failed to load. Please refresh the page.");
      }
    }, 1000); // 1 second delay
    
    return () => clearTimeout(timer);
  }, []);

  // Don't render PayPal button until script is ready
  if (!isScriptReady) {
    return (
      <Card className="border-2 border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-12">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-[#f5963c] rounded-full animate-spin"></div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">Preparing PayPal...</p>
          <p className="text-center text-xs text-gray-500 mt-1">Checking script availability...</p>
        </CardContent>
      </Card>
    );
  }

  // If there's an error during script loading, show it
  if (error && error.includes("script failed to load")) {
    return (
      <Card className="border-2 border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            <p className="text-sm font-medium text-red-800">PayPal Script Loading Error</p>
          </div>
          <p className="text-sm text-red-700 mb-4">
            {error}
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              size="sm"
              className="text-red-700 border-red-300 hover:bg-red-100"
            >
              Refresh Page
            </Button>
            <Button 
              onClick={() => window.location.href = "/checkout?payment_method=stripe"} 
              variant="outline" 
              size="sm"
              className="text-red-700 border-red-300 hover:bg-red-100 ml-2"
            >
              Try Card Payment Instead
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const createOrder = async (data: any, actions: any) => {
    try {
      console.log("Creating PayPal order...");
      console.log("Order data:", { items, addressId, coupon });
      setIsLoading(true);
      setError(null);

      const orderPayload = {
        items,
        addressId,
        coupon,
      };
      
      console.log("Sending order payload:", orderPayload);

      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      console.log("PayPal create order response status:", response.status);
      console.log("PayPal create order response headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error("PayPal create order error:", errorData);
        throw new Error(errorData.error || "Failed to create PayPal order");
      }

      const result = await response.json();
      console.log("PayPal order created successfully:", result);
      return result.orderID;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create order";
      console.error("Error in createOrder:", err);
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const onApprove = async (data: any, actions: any) => {
    try {
      console.log("PayPal payment approved, capturing...");
      setIsLoading(true);
      setError(null);

      // Capture the order
      const response = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderID: data.orderID,
        }),
      });

      console.log("PayPal capture response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("PayPal capture error:", errorData);
        throw new Error(errorData.error || "Failed to capture payment");
      }

      const result = await response.json();
      console.log("PayPal payment captured successfully:", result);

      if (result.success) {
        toast.success("Payment successful!");
        onSuccess();
      } else {
        throw new Error("Payment not completed");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment failed";
      console.error("Error in onApprove:", err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onError = (err: any) => {
    console.error("PayPal error:", err);
    console.error("PayPal error details:", {
      name: err.name,
      message: err.message,
      details: err.details,
      stack: err.stack,
      // Add additional debugging information
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      // Add PayPal script status
      paypalScriptLoaded: typeof window !== 'undefined' && !!(window as any).paypal,
      paypalScriptVersion: typeof window !== 'undefined' && (window as any).paypal ? (window as any).paypal.version : 'Not loaded'
    });
    
    // Check for specific PayPal error types
    let errorMessage = "PayPal payment failed. Please try again.";
    
    if (err.name === "INVALID_CLIENT") {
      errorMessage = "PayPal configuration error. Please contact support.";
    } else if (err.name === "ORDER_ALREADY_CAPTURED") {
      errorMessage = "This order has already been processed.";
    } else if (err.name === "INVALID_REQUEST") {
      errorMessage = "Invalid payment request. Please try again.";
    } else if (err.name === "AUTHENTICATION_FAILED") {
      errorMessage = "PayPal authentication failed. Please refresh and try again.";
    } else if (err.name === "NETWORK_ERROR") {
      errorMessage = "Network error. Please check your connection and try again.";
    } else if (err.message && err.message.includes("Failed to authenticate")) {
      errorMessage = "PayPal authentication failed. Please refresh the page and try again.";
    } else if (err.message && err.message.includes("script")) {
      errorMessage = "PayPal script loading error. Please refresh the page and try again.";
    }
    
    setError(errorMessage);
    toast.error(errorMessage);
    
    // Log the error to help with debugging
    console.error("PayPal error message set:", errorMessage);
  };

  const onCancel = () => {
    console.log("PayPal payment cancelled by user");
    toast.error("Payment cancelled");
  };

  // Show loading state while PayPal script is loading
  if (isPending) {
    return (
      <Card className="border-2 border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-12">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-[#f5963c] rounded-full animate-spin"></div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">Loading PayPal...</p>
        </CardContent>
      </Card>
    );
  }

  // Show error if PayPal script failed to load
  if (isRejected) {
    return (
      <Card className="border-2 border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            <p className="text-sm font-medium text-red-800">PayPal Failed to Load</p>
          </div>
          <p className="text-sm text-red-700 mb-4">
            There was an error loading PayPal. This might be due to authentication issues or network problems.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              size="sm"
              className="text-red-700 border-red-300 hover:bg-red-100"
            >
              Refresh Page
            </Button>
            <Button 
              onClick={() => window.location.href = "/checkout?payment_method=stripe"} 
              variant="outline" 
              size="sm"
              className="text-red-700 border-red-300 hover:bg-red-100 ml-2"
            >
              Try Card Payment Instead
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircleIcon className="h-5 w-5 text-blue-800" />
            <p className="text-sm font-medium text-blue-800">
              {t("checkout.payWithPayPal")}
            </p>
          </div>
          
          <div className="paypal-button-container">
            <PayPalButtons
              style={{
                layout: "vertical",
                color: "blue",
                shape: "rect",
                label: "pay",
              }}
              createOrder={createOrder}
              onApprove={onApprove}
              onError={onError}
              onCancel={onCancel}
              forceReRender={[total, items.length]} // Force re-render when props change
              onInit={() => {
                console.log("PayPal button initialized successfully");
              }}
            />
          </div>
          
          {isLoading && (
            <div className="mt-4 text-center text-sm text-gray-600">
              {t("checkout.processing")}...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
