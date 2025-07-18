/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store/cart";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Image from "next/image";
import { CouponForm } from "./CouponForm";
import { refreshUserSession } from "@/lib/utils/session";

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

export default function CheckoutPage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const { items, getTotal } = useCartStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<
    string | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    discountPercentage: number;
    couponId: string;
    code: string;
  } | null>(null);

  const subtotal = getTotal();
  const discountAmount = appliedCoupon
    ? (subtotal * appliedCoupon.discountPercentage) / 100
    : 0;
  const total = subtotal - discountAmount;

  useEffect(() => {
    if (session?.user) {
      refreshUserSession(updateSession, session).catch(console.error);
      fetchAddresses();
    }
  }, [session?.user]);

  useEffect(() => {
    if (items.length === 0) router.push("/cart");
  }, [items.length]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/addresses");
      if (!res.ok) throw new Error("Failed to fetch addresses");
      const data = await res.json();
      setAddresses(data);
      const defaultAddr = data.find((a: Address) => a.isDefault) || data[0];
      setSelectedAddressId(defaultAddr?._id);
    } catch (err) {
      toast.error("Error loading addresses");
    }
  };

  const handleContinueToPayment = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          addressId: selectedAddressId,
          coupon: appliedCoupon
            ? {
                id: appliedCoupon.couponId,
                code: appliedCoupon.code,
                discountPercentage: appliedCoupon.discountPercentage,
                discountAmount,
              }
            : null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.checkoutUrl)
        throw new Error(data.error || "Failed to redirect to Mollie");

      window.location.href = data.checkoutUrl;
    } catch (error) {
      toast.error("Checkout failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") return <div className="p-8">Loading...</div>;
  if (status === "unauthenticated") {
    router.push("/auth/signin?callbackUrl=/checkout");
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-black">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-6 text-black border-b pb-3">
                Shipping Address
              </h2>
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className={`p-4 border rounded cursor-pointer mb-4 ${
                    selectedAddressId === addr._id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => setSelectedAddressId(addr._id)}
                >
                  <p className="font-medium text-black">{addr.fullName}</p>
                  <p className="text-sm text-black">{addr.addressLine1}</p>
                  {addr.addressLine2 && (
                    <p className="text-sm text-black">{addr.addressLine2}</p>
                  )}
                  <p className="text-sm text-black">
                    {addr.city}, {addr.state} {addr.postalCode}
                  </p>
                  <p className="text-sm text-black">{addr.country}</p>
                  <p className="text-sm text-black">{addr.phone}</p>
                </div>
              ))}

              <button
                type="button"
                onClick={handleContinueToPayment}
                disabled={!selectedAddressId || isLoading}
                className="mt-4 bg-indigo-600 text-white py-2 px-6 rounded hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {isLoading ? "Redirecting..." : "Proceed to Payment"}
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 sticky top-6">
              <h2 className="text-xl font-semibold mb-6 text-black border-b pb-3">
                Order Summary
              </h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="relative w-16 h-16 border rounded overflow-hidden">
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

              <CouponForm
                onApplyCoupon={(pct, id, code) =>
                  setAppliedCoupon({
                    discountPercentage: pct,
                    couponId: id,
                    code,
                  })
                }
                isDisabled={isLoading}
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
