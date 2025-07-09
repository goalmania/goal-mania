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
    <div>
      {canMakePayment && paymentRequest ? (
        <div className="mb-6">
          <p className="mb-4 text-sm font-medium text-gray-700">
            Express Checkout
          </p>
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
                <span className="bg-gray-50 px-2 text-gray-500">
                  Or pay with card
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 text-sm text-gray-600">
          <p>Standard payment methods available below</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <PaymentElement className="mb-6" />
        {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}
        <button
          type="submit"
          disabled={!stripe || isLoading}
          className="w-full bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isLoading ? "Processing..." : `Pay €${total.toFixed(2)}`}
        </button>
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
    <div className="bg-yellow-100 p-2 mb-4 text-xs rounded">
      <p>Session Status: {status}</p>
      <p>User Role: {session?.user?.role || "none"}</p>
      <button
        onClick={() => refreshUserSession(updateSession, session)}
        className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
      >
        Force Refresh
      </button>
    </div>
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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-4 md:p-6">
        {/* Debug component */}
        <SessionDebug />

        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-black">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {step === "address" ? (
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                <h2 className="text-xl font-semibold mb-6 text-black border-b pb-3">
                  Shipping Address
                </h2>

                {addresses.length > 0 && !isAddingAddress ? (
                  <div className="mb-6">
                    <div className="grid grid-cols-1 gap-4">
                      {addresses.map((address) => (
                        <div
                          key={address._id}
                          className={`border rounded-md p-4 cursor-pointer transition-all ${
                            selectedAddressId === address._id
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedAddressId(address._id)}
                        >
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="address"
                              checked={selectedAddressId === address._id}
                              onChange={() => setSelectedAddressId(address._id)}
                              className="mr-3 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div>
                              <p className="font-medium text-black">
                                {address.fullName}
                              </p>
                              <p className="text-sm text-black">
                                {address.addressLine1}
                              </p>
                              {address.addressLine2 && (
                                <p className="text-sm text-black">
                                  {address.addressLine2}
                                </p>
                              )}
                              <p className="text-sm text-black">
                                {address.city}, {address.state}{" "}
                                {address.postalCode}
                              </p>
                              <p className="text-sm text-black">
                                {address.country}
                              </p>
                              <p className="text-sm text-black">
                                {address.phone}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex justify-between">
                      <button
                        type="button"
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                        onClick={() => setIsAddingAddress(true)}
                      >
                        Add New Address
                      </button>
                      <div className="flex gap-2">
                        {/* Test button - only visible in development */}
                        {process.env.NODE_ENV === "development" && (
                          <button
                            type="button"
                            className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                            onClick={handleTestCreateOrder}
                            disabled={!selectedAddressId || isLoading}
                          >
                            {isLoading
                              ? "Processing..."
                              : "Create Order (No Payment)"}
                          </button>
                        )}
                        <button
                          type="button"
                          className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
                          onClick={handleContinueToPayment}
                          disabled={!selectedAddressId || isLoading}
                        >
                          {isLoading ? "Processing..." : "Continue to Payment"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-sm font-medium text-black"
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={newAddress.fullName}
                        onChange={handleAddressChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black h-10"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="addressLine1"
                        className="block text-sm font-medium text-black"
                      >
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        id="addressLine1"
                        name="addressLine1"
                        value={newAddress.addressLine1}
                        onChange={handleAddressChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black h-10"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="addressLine2"
                        className="block text-sm font-medium text-black"
                      >
                        Address Line 2 (Optional)
                      </label>
                      <input
                        type="text"
                        id="addressLine2"
                        name="addressLine2"
                        value={newAddress.addressLine2 || ""}
                        onChange={handleAddressChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black h-10"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="city"
                          className="block text-sm font-medium text-black"
                        >
                          City
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={newAddress.city}
                          onChange={handleAddressChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black h-10"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="state"
                          className="block text-sm font-medium text-black"
                        >
                          State / Province
                        </label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          value={newAddress.state}
                          onChange={handleAddressChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black h-10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="postalCode"
                          className="block text-sm font-medium text-black"
                        >
                          Postal Code
                        </label>
                        <input
                          type="text"
                          id="postalCode"
                          name="postalCode"
                          value={newAddress.postalCode}
                          onChange={handleAddressChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black h-10"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="country"
                          className="block text-sm font-medium text-black"
                        >
                          Country
                        </label>
                        <select
                          id="country"
                          name="country"
                          value={newAddress.country}
                          onChange={handleAddressChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black h-10"
                        >
                          <option value="">Select Country</option>
                          <option value="Italy">Italy</option>
                          <option value="France">France</option>
                          <option value="Germany">Germany</option>
                          <option value="Spain">Spain</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="United States">United States</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-black"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={newAddress.phone}
                        onChange={handleAddressChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black h-10"
                      />
                    </div>

                    <div className="flex justify-between pt-4">
                      {addresses.length > 0 && (
                        <button
                          type="button"
                          className="text-gray-600 hover:text-gray-800 font-medium"
                          onClick={() => setIsAddingAddress(false)}
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
                        disabled={isLoading}
                      >
                        {isLoading ? "Saving..." : "Save Address"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                <h2 className="text-xl font-semibold mb-6 text-black border-b pb-3">
                  Payment
                </h2>
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
                <button
                  type="button"
                  className="mt-6 text-indigo-600 hover:text-indigo-800 font-medium"
                  onClick={() => setStep("address")}
                  disabled={isLoading}
                >
                  Back to Shipping
                </button>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 sticky top-6">
              <h2 className="text-xl font-semibold mb-6 text-black border-b pb-3">
                Order Summary
              </h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                      <Image
                        src={item.image || "/placeholder.png"}
                        alt={item.name}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-black">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-black">
                      €{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Always render the coupon form, it will be hidden by the component if user is not premium */}
              <CouponForm
                onApplyCoupon={handleApplyCoupon}
                isDisabled={isLoading || step !== "address"}
              />

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between mb-2">
                  <p className="text-black">Subtotal</p>
                  <p className="text-black">€{subtotal.toFixed(2)}</p>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between mb-2 text-green-600">
                    <p>Discount ({appliedCoupon.discountPercentage}%)</p>
                    <p>-€{discountAmount.toFixed(2)}</p>
                  </div>
                )}

                <div className="flex justify-between font-semibold text-lg mt-2 pt-2 border-t">
                  <p className="text-black">Total</p>
                  <p className="text-black">€{total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
