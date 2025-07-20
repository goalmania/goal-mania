/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";
import { useCartStore } from "@/lib/store/cart";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
  PaymentRequestButtonElement,
} from "@stripe/react-stripe-js";
import { CouponForm } from "./CouponForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPinIcon, 
  CreditCardIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  PlusIcon,
  UserIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline";
import { refreshUserSession } from "@/lib/utils/session";
import React from "react";

// Initialize Stripe with publishable key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "",
  {
    // Adding wallet configuration
    betas: [
      "payment_element_apple_pay_beta_1",
      "payment_element_google_pay_beta_1",
    ],
  }
);

interface Address {
  _id?: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

// PaymentForm component that will be rendered inside Elements
function PaymentForm({
  clientSecret,
  onSuccess,
  isLoading,
  setIsLoading,
  total,
}: {
  clientSecret: string;
  onSuccess: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  total: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<any>(null);

  console.log("PAY: ", paymentRequest);
  const [canMakePayment, setCanMakePayment] = useState(false);

  // Set up payment request for Apple Pay/Google Pay
  useEffect(() => {
    if (stripe) {
      console.log("Setting up payment request with Stripe instance");
      const pr = stripe.paymentRequest({
        country: "IT",
        currency: "eur",
        total: {
          label: "Goal Mania Order",
          amount: Math.round(total * 100),
        },
        requestPayerName: true,
        requestPayerEmail: true,
        requestPayerPhone: false,
        requestShipping: false,
        disableWallets: [], // Ensure all wallets are enabled
      });

      // Check if the Payment Request is available
      pr.canMakePayment().then((result) => {
        console.log("Payment request canMakePayment result:", result);
        if (result) {
          setPaymentRequest(pr);
          setCanMakePayment(true);
          console.log("Digital wallet available:", result);
          console.log(
            "Available wallet methods:",
            result.applePay ? "Apple Pay" : "",
            result.googlePay ? "Google Pay" : ""
          );
        } else {
          console.log("No digital wallet available on this device/browser");
        }
      });

      // Handle payment completion
      pr.on("paymentmethod", async (e) => {
        console.log("Payment method received:", e.paymentMethod.type);
        setIsLoading(true);
        setError(null);

        try {
          const { error: confirmError, paymentIntent } =
            await stripe.confirmCardPayment(
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

          if (paymentIntent.status === "requires_action") {
            const { error } = await stripe.confirmCardPayment(clientSecret);
            if (error) {
              setError(error.message || "Payment failed");
            } else {
              toast.success("Payment successful!");
              onSuccess();
            }
          } else {
            toast.success("Payment successful!");
            onSuccess();
          }
        } catch (err) {
          console.error("Payment error:", err);
          e.complete("fail");
          setError(err instanceof Error ? err.message : "Payment failed");
        }

        setIsLoading(false);
      });
    }
  }, [stripe, total, clientSecret, onSuccess, setIsLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Remove the return_url as we want to handle success in our code
        // return_url: `${window.location.origin}/account/orders?success=true`,
      },
      redirect: "if_required",
    });

    if (submitError) {
      setError(submitError.message || "Payment failed");
      setIsLoading(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      toast.success("Payment successful!");
      onSuccess();
    } else if (paymentIntent && paymentIntent.status === "processing") {
      toast.success("Your payment is processing!");
      onSuccess();
    } else if (
      paymentIntent &&
      paymentIntent.status === "requires_payment_method"
    ) {
      setError("Your payment was not successful, please try again.");
    } else {
      setError("Something went wrong with the payment");
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {canMakePayment && paymentRequest ? (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <p className="text-sm font-medium text-green-800">
                Express Checkout Available
              </p>
            </div>
            <div className="space-y-4">
              <PaymentRequestButtonElement
                options={{
                  paymentRequest,
                  style: {
                    paymentRequestButton: {
                      theme: "dark",
                      height: "48px",
                      type: "buy",
                    },
                  },
                }}
              />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-green-50 px-2 text-gray-500">
                    Or pay with card
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCardIcon className="h-5 w-5 text-gray-600" />
              <p className="text-sm font-medium text-gray-700">
                Standard Payment Methods
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
            <Button
              type="submit"
              disabled={!stripe || isLoading}
              variant="default"
              size="lg"
              className="w-full bg-[#f5963c] hover:bg-[#e0852e] text-white"
            >
              {isLoading ? "Processing..." : `Pay €${total.toFixed(2)}`}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  // Create the ref at component level
  const hasRefreshedRef = useRef(false);
  const [sessionRefreshed, setSessionRefreshed] = useState(false);

  const [step, setStep] = useState<"address" | "payment">("address");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<
    string | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<Address, "isDefault">>({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState<{
    discountPercentage: number;
    couponId: string;
    code: string;
  } | null>(null);

  // Payment state
  const [clientSecret, setClientSecret] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Calculate totals
  const subtotal = getTotal();
  const discountAmount = appliedCoupon
    ? (subtotal * appliedCoupon.discountPercentage) / 100
    : 0;
  const total = subtotal - discountAmount;

  // Refresh session to get latest user data
  useEffect(() => {
    if (session?.user) {
      refreshUserSession(updateSession, session)
        .then((userData) => {
          // Force a re-render by updating a state variable
          setSessionRefreshed(true);
        })
        .catch((error) => {
          console.error("Error refreshing session:", error);
        });
    }
  }, [session?.user?.id, updateSession]);

  // Remove debug session info
  useEffect(() => {
    // Intentionally left empty after removing console logs
  }, [session?.user?.role, sessionRefreshed]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !paymentSuccess) {
      router.push("/cart");
    }
  }, [items.length, router, paymentSuccess]);

  // Fetch user addresses on component mount
  useEffect(() => {
    if (session?.user) {
      fetchAddresses();
    }
  }, [session]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/addresses");
      if (!response.ok) {
        throw new Error("Failed to fetch addresses");
      }
      const data = await response.json();
      setAddresses(data);

      // Set default address if available
      const defaultAddress = data.find((addr: Address) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
      } else if (data.length > 0) {
        setSelectedAddressId(data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Failed to load your addresses");
    }
  };

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...newAddress, isDefault: false }),
      });

      if (!response.ok) {
        throw new Error("Failed to add address");
      }

      const data = await response.json();
      toast.success("Address added successfully");
      setAddresses((prev) => [...prev, data]);
      setSelectedAddressId(data._id);
      setIsAddingAddress(false);
      setNewAddress({
        fullName: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        phone: "",
      });
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error("Failed to add address");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueToPayment = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address");
      return;
    }

    setIsLoading(true);

    try {
      // Create checkout session with Stripe
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          addressId: selectedAddressId,
          coupon: appliedCoupon
            ? {
                id: appliedCoupon.couponId,
                code: appliedCoupon.code,
                discountPercentage: appliedCoupon.discountPercentage,
                discountAmount: discountAmount,
              }
            : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      setClientSecret(data.clientSecret);
      setStep("payment");
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to proceed to payment");
    } finally {
      setIsLoading(false);
    }
  };

  // Create order without payment (for testing only)
  const handleTestCreateOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address");
      return;
    }

    setIsLoading(true);

    try {
      // Prepare request body
      const requestBody = {
        items: items.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          customization: item.customization,
        })),
        amount: total,
        addressId: selectedAddressId,
        shippingAddress: addresses.find(
          (addr) => addr._id === selectedAddressId
        ),
        coupon: appliedCoupon
          ? {
              code: appliedCoupon.code,
              discountPercentage: appliedCoupon.discountPercentage,
              discountAmount: discountAmount,
              id: appliedCoupon.couponId,
            }
          : null,
      };

      console.log("Sending order request:", JSON.stringify(requestBody));

      // Create order
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Order response status:", response.status);
      const data = await response.json();
      console.log("Order response data:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      toast.success("Order created successfully!");

      // Clear cart
      clearCart();

      // Redirect to orders page
      router.push("/account/orders?success=true");
    } catch (error) {
      console.error("Order error:", error);
      toast.error(
        `Failed to create order: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);

    // Create order directly instead of relying on webhook
    if (selectedAddressId) {
      fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            customization: item.customization,
          })),
          amount: total,
          addressId: selectedAddressId,
          shippingAddress: addresses.find(
            (addr) => addr._id === selectedAddressId
          ),
          coupon: appliedCoupon
            ? {
                code: appliedCoupon.code,
                discountPercentage: appliedCoupon.discountPercentage,
                discountAmount: discountAmount,
                id: appliedCoupon.couponId,
              }
            : null,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to create order");
          }
          return response.json();
        })
        .then((data) => {
          console.log("Order created successfully:", data.orderId);

          // Clear cart
          clearCart();

          // If a coupon was applied, record its usage
          if (appliedCoupon) {
            return fetch("/api/coupons/apply", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ couponId: appliedCoupon.couponId }),
            });
          }
        })
        .then(() => {
          // Redirect to orders page
          router.push("/account/orders?success=true");
        })
        .catch((error) => {
          console.error("Error creating order:", error);
          toast.error("There was an issue creating your order");
          // Still redirect to orders page, but without success parameter
          router.push("/account/orders");
        });
    } else {
      // If no address is selected, show error and don't proceed
      toast.error("No shipping address selected");
      setIsLoading(false);
    }
  };

  const handleApplyCoupon = (
    discountPercentage: number,
    couponId: string,
    code: string
  ) => {
    setAppliedCoupon({
      discountPercentage,
      couponId,
      code,
    });
  };

  // Debugging component to show session status
  const SessionDebug = () => (
    <Card className="bg-yellow-50 border-yellow-200">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-2">
          <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
          <p className="text-xs font-medium text-yellow-800">Debug Info</p>
        </div>
        <p className="text-xs text-yellow-700">Session Status: {status}</p>
        <p className="text-xs text-yellow-700">User Role: {session?.user?.role || "none"}</p>
        <Button
          onClick={() => refreshUserSession(updateSession, session)}
          variant="outline"
          size="sm"
          className="mt-2 text-xs h-6"
        >
          Force Refresh
        </Button>
      </CardContent>
    </Card>
  );

  if (status === "loading") {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin?callbackUrl=/checkout");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-[112px]">
      <div className="container mx-auto p-4 md:p-6">
        {/* Debug component */}
        {/* <SessionDebug /> */}

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0e1924] mb-2">
            Checkout
          </h1>
          <p className="text-gray-600">
            Complete your order with secure payment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {step === "address" ? (
              <Card className="border-2 border-gray-100 shadow-lg overflow-hidden pt-0">
                <CardHeader className="bg-gradient-to-r from-[#0e1924] to-[#1a2a3a] text-white p-6">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <MapPinIcon className="h-5 w-5 text-[#f5963c]" />
                    Shipping Address
                  </CardTitle>
                  <CardDescription className="text-gray-200">
                    Select your delivery address or add a new one
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {addresses.length > 0 && !isAddingAddress ? (
                    <>
                      <RadioGroup
                        value={selectedAddressId}
                        onValueChange={setSelectedAddressId}
                        className="space-y-3"
                      >
                        {addresses.map((address) => (
                          <div
                            key={address._id}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                              selectedAddressId === address._id
                                ? "border-[#f5963c] bg-gradient-to-r from-orange-50 to-yellow-50 shadow-md"
                                : "border-gray-200 hover:border-[#f5963c]/30 bg-white"
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <RadioGroupItem
                                value={address._id || ""}
                                id={address._id}
                                className="mt-1 data-[state=checked]:border-[#f5963c] data-[state=checked]:bg-[#f5963c]"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="p-1.5 bg-[#0e1924] rounded-full">
                                    <UserIcon className="h-3 w-3 text-white" />
                                  </div>
                                  <p className="font-semibold text-[#0e1924]">
                                    {address.fullName}
                                  </p>
                                  {address.isDefault && (
                                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                                      Default
                                    </Badge>
                                  )}
                                </div>
                                <div className="space-y-2 text-sm text-gray-600">
                                  <div className="flex items-start gap-2">
                                    <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="font-medium text-[#0e1924]">{address.addressLine1}</p>
                                      {address.addressLine2 && (
                                        <p className="text-gray-500">{address.addressLine2}</p>
                                      )}
                                      <p className="text-gray-600">
                                        {address.city}, {address.state} {address.postalCode}
                                      </p>
                                      <p className="text-gray-600">{address.country}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                                    <span>{address.phone}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>

                      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddingAddress(true)}
                          className="flex items-center gap-2 border-2 border-gray-200 hover:border-[#f5963c] hover:bg-orange-50 transition-all duration-200"
                        >
                          <PlusIcon className="h-4 w-4" />
                          Add New Address
                        </Button>
                        <div className="flex gap-3">
                          {/* Test button - only visible in development */}
                          {process.env.NODE_ENV === "development" && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleTestCreateOrder}
                              disabled={!selectedAddressId || isLoading}
                              className="bg-green-600 text-white hover:bg-green-700 border-green-600"
                            >
                              {isLoading ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Processing...
                                </div>
                              ) : (
                                "Create Order (No Payment)"
                              )}
                            </Button>
                          )}
                          <Button
                            type="button"
                            onClick={handleContinueToPayment}
                            disabled={!selectedAddressId || isLoading}
                            className="bg-gradient-to-r from-[#f5963c] to-orange-500 hover:from-[#e0852e] hover:to-orange-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                          >
                            {isLoading ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Processing...
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <CreditCardIcon className="h-4 w-4" />
                                Continue to Payment
                              </div>
                            )}
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleAddressSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="fullName" className="flex items-center gap-2 text-sm font-semibold text-[#0e1924]">
                            <div className="p-1 bg-[#f5963c] rounded-full">
                              <UserIcon className="h-3 w-3 text-white" />
                            </div>
                            Full Name *
                          </Label>
                          <Input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={newAddress.fullName}
                            onChange={handleAddressChange}
                            required
                            placeholder="Enter your full name"
                            className="h-11 border-2 border-gray-200 focus:border-[#f5963c] focus:ring-[#f5963c]/20 transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold text-[#0e1924]">
                            <div className="p-1 bg-[#f5963c] rounded-full">
                              <PhoneIcon className="h-3 w-3 text-white" />
                            </div>
                            Phone Number *
                          </Label>
                          <Input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={newAddress.phone}
                            onChange={handleAddressChange}
                            required
                            placeholder="Enter your phone number"
                            className="h-11 border-2 border-gray-200 focus:border-[#f5963c] focus:ring-[#f5963c]/20 transition-all duration-200"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="addressLine1" className="flex items-center gap-2 text-sm font-semibold text-[#0e1924]">
                          <div className="p-1 bg-[#f5963c] rounded-full">
                            <MapPinIcon className="h-3 w-3 text-white" />
                          </div>
                          Address Line 1 *
                        </Label>
                        <Input
                          type="text"
                          id="addressLine1"
                          name="addressLine1"
                          value={newAddress.addressLine1}
                          onChange={handleAddressChange}
                          required
                          placeholder="Street address, P.O. box, company name"
                          className="h-11 border-2 border-gray-200 focus:border-[#f5963c] focus:ring-[#f5963c]/20 transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="addressLine2" className="flex items-center gap-2 text-sm font-semibold text-[#0e1924]">
                          <div className="p-1 bg-gray-400 rounded-full">
                            <BuildingOfficeIcon className="h-3 w-3 text-white" />
                          </div>
                          Address Line 2 (Optional)
                        </Label>
                        <Input
                          type="text"
                          id="addressLine2"
                          name="addressLine2"
                          value={newAddress.addressLine2 || ""}
                          onChange={handleAddressChange}
                          placeholder="Apartment, suite, unit, building, floor, etc."
                          className="h-11 border-2 border-gray-200 focus:border-[#f5963c] focus:ring-[#f5963c]/20 transition-all duration-200"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="city" className="flex items-center gap-2 text-sm font-semibold text-[#0e1924]">
                            <div className="p-1 bg-[#f5963c] rounded-full">
                              <BuildingOfficeIcon className="h-3 w-3 text-white" />
                            </div>
                            City *
                          </Label>
                          <Input
                            type="text"
                            id="city"
                            name="city"
                            value={newAddress.city}
                            onChange={handleAddressChange}
                            required
                            placeholder="Enter city"
                            className="h-11 border-2 border-gray-200 focus:border-[#f5963c] focus:ring-[#f5963c]/20 transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="state" className="flex items-center gap-2 text-sm font-semibold text-[#0e1924]">
                            <div className="p-1 bg-[#f5963c] rounded-full">
                              <MapPinIcon className="h-3 w-3 text-white" />
                            </div>
                            State / Province *
                          </Label>
                          <Input
                            type="text"
                            id="state"
                            name="state"
                            value={newAddress.state}
                            onChange={handleAddressChange}
                            required
                            placeholder="Enter state or province"
                            className="h-11 border-2 border-gray-200 focus:border-[#f5963c] focus:ring-[#f5963c]/20 transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="postalCode" className="flex items-center gap-2 text-sm font-semibold text-[#0e1924]">
                            <div className="p-1 bg-[#f5963c] rounded-full">
                              <MapPinIcon className="h-3 w-3 text-white" />
                            </div>
                            Postal Code *
                          </Label>
                          <Input
                            type="text"
                            id="postalCode"
                            name="postalCode"
                            value={newAddress.postalCode}
                            onChange={handleAddressChange}
                            required
                            placeholder="Enter postal code"
                            className="h-11 border-2 border-gray-200 focus:border-[#f5963c] focus:ring-[#f5963c]/20 transition-all duration-200"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="country" className="flex items-center gap-2 text-sm font-semibold text-[#0e1924]">
                          <div className="p-1 bg-[#f5963c] rounded-full">
                            <GlobeAltIcon className="h-3 w-3 text-white" />
                          </div>
                          Country *
                        </Label>
                        <Select
                          value={newAddress.country}
                          onValueChange={(value) =>
                            setNewAddress((prev) => ({ ...prev, country: value }))
                          }
                        >
                          <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-[#f5963c] focus:ring-[#f5963c]/20 transition-all duration-200">
                            <SelectValue placeholder="Select your country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Italy">Italy</SelectItem>
                            <SelectItem value="France">France</SelectItem>
                            <SelectItem value="Germany">Germany</SelectItem>
                            <SelectItem value="Spain">Spain</SelectItem>
                            <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                            <SelectItem value="United States">United States</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                        {addresses.length > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsAddingAddress(false)}
                            className="border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
                          >
                            Cancel
                          </Button>
                        )}
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="bg-gradient-to-r from-[#f5963c] to-orange-500 hover:from-[#e0852e] hover:to-orange-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          {isLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Saving...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <CheckCircleIcon className="h-4 w-4" />
                              Save Address
                            </div>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-gray-100 shadow-lg overflow-hidden pt-0">
                <CardHeader className="bg-gradient-to-r from-[#0e1924] to-[#1a2a3a] text-white p-6">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <CreditCardIcon className="h-5 w-5 text-[#f5963c]" />
                    Payment Information
                  </CardTitle>
                  <CardDescription className="text-gray-200">
                    Complete your purchase with secure payment
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {clientSecret && (
                    <Elements
                      stripe={stripePromise}
                      options={{ clientSecret, appearance: { theme: "stripe" } }}
                    >
                      <PaymentForm
                        clientSecret={clientSecret}
                        onSuccess={handlePaymentSuccess}
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                        total={total}
                      />
                    </Elements>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("address")}
                    disabled={isLoading}
                    className="mt-6 flex items-center gap-2"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back to Shipping
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 border-2 border-gray-100 shadow-lg overflow-hidden pt-0">
              <CardHeader className="bg-gradient-to-r from-[#0e1924] to-[#1a2a3a] text-white p-6">
                <CardTitle className="flex items-center gap-2 text-white">
                  <svg
                    className="h-5 w-5 text-[#f5963c]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                  Order Summary
                </CardTitle>
                <CardDescription className="text-gray-200">
                  Review your items and total
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {/* Items List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#0e1924] uppercase tracking-wide">
                      Items ({items.length})
                    </h3>
                    <Badge variant="secondary" className="bg-[#f5963c] text-white">
                      {items.reduce((acc, item) => acc + item.quantity, 0)} items
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 hover:border-[#f5963c]/20 transition-colors">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0">
                          <Image
                            src={item.image || "/placeholder.png"}
                            alt={item.name}
                            fill
                            style={{ objectFit: "cover" }}
                            className="hover:scale-105 transition-transform duration-200"
                          />
                          {item.quantity > 1 && (
                            <div className="absolute -top-1 -right-1 bg-[#f5963c] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                              {item.quantity}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#0e1924] truncate text-sm leading-tight">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              Qty: {item.quantity}
                            </Badge>
                            {item.customization && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                Custom
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-[#0e1924] text-sm">
                            €{(item.price * item.quantity).toFixed(2)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-gray-500">
                              €{item.price.toFixed(2)} each
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-gray-200 my-6" />

                {/* Coupon Form */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#0e1924] uppercase tracking-wide">
                      Discounts
                    </h3>
                    {appliedCoupon && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Applied
                      </Badge>
                    )}
                  </div>
                  
                  <CouponForm
                    onApplyCoupon={handleApplyCoupon}
                    isDisabled={isLoading || step !== "address"}
                  />
                </div>

                <Separator className="bg-gray-200 my-6" />

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-[#0e1924] uppercase tracking-wide">
                    Price Breakdown
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm text-gray-600">Subtotal</span>
                      <span className="font-medium text-[#0e1924]">€{subtotal.toFixed(2)}</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between items-center py-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-green-600">Discount</span>
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            {appliedCoupon.code}
                          </Badge>
                        </div>
                        <span className="font-medium text-green-600">-€{discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm text-gray-600">Shipping</span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>
                  </div>

                  <Separator className="bg-gray-300 my-4" />

                  {/* Total */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-lg font-bold text-[#0e1924]">Total</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-[#0e1924]">€{total.toFixed(2)}</span>
                      <p className="text-xs text-gray-500">Includes VAT</p>
                    </div>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="pt-6 mt-6 border-t border-gray-100">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-1">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600">Secure</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-1">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600">Fast</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mb-1">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600">Quality</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
