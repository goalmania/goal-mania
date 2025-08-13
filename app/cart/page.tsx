"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { TrashIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const { t } = useTranslation();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const router = useRouter();

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      // Redirect to checkout page
      router.push("/checkout");
    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error("Failed to proceed to checkout");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-[112px]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingBagIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0e1924]">
              {t("cart.empty.title")}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-600">
              {t("cart.empty.description")}
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="bg-[#f5963c] hover:bg-[#e0852e] text-white">
                <Link href="/shop">
                  {t("cart.empty.cta")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-[112px]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0e1924] mb-2">
            {t("cart.title")}
          </h1>
          <p className="text-gray-600">
            Review your items and proceed to checkout
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-gray-100 shadow-lg overflow-hidden pt-0">
              <CardHeader className="bg-gradient-to-r from-[#0e1924] to-[#1a2a3a] text-white p-6 pt-6">
                <CardTitle className="flex items-center gap-2 text-white">
                  <ShoppingBagIcon className="h-5 w-5 text-[#f5963c]" />
                  Shopping Cart
                </CardTitle>
                <CardDescription className="text-gray-200">
                  {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start space-x-4 p-4 rounded-lg border border-gray-100 hover:border-[#f5963c]/20 transition-colors">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0">
                        <Image
                          src={item.image || "/images/image.png"}
                          alt={item.name || "Product image"}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-200"
                        />
                        {item.quantity > 1 && (
                          <div className="absolute -top-1 -right-1 bg-[#f5963c] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {item.quantity}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-[#0e1924] text-sm leading-tight mb-1">
                              <Link href={`/products/${item.id}`} className="hover:text-[#f5963c] transition-colors">
                                {item.name}
                              </Link>
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                Qty: {item.quantity}
                              </Badge>
                              {item.customization && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  Custom
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              €{Number(item.price).toFixed(2)} each
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-semibold text-[#0e1924] text-sm">
                              €{(Number(item.price) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="w-8 h-8 p-0"
                            >
                              -
                            </Button>
                            <span className="text-sm font-medium text-[#0e1924] min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="w-8 h-8 p-0"
                            >
                              +
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
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
                {/* Items Count */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#0e1924] uppercase tracking-wide">
                    Items ({items.length})
                  </h3>
                  <Badge variant="secondary" className="bg-[#f5963c] text-white">
                    {items.reduce((acc, item) => acc + item.quantity, 0)} items
                  </Badge>
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
                      <span className="font-medium text-[#0e1924]">€{getTotal().toFixed(2)}</span>
                    </div>

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
                      <span className="text-2xl font-bold text-[#0e1924]">€{getTotal().toFixed(2)}</span>
                      <p className="text-xs text-gray-500">Includes VAT</p>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  size="lg"
                  className="w-full bg-[#f5963c] hover:bg-[#e0852e] text-white font-semibold mt-6"
                >
                  {isCheckingOut ? t("cart.processing") : t("cart.proceedToCheckout")}
                </Button>

                {/* Continue Shopping */}
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-500">
                    {t("cart.or")}{" "}
                    <Link
                      href="/shop"
                      className="font-medium text-[#f5963c] hover:text-[#e0852e] transition-colors"
                    >
                      {t("cart.continueShopping")}
                    </Link>
                  </p>
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
