"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

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
      <div className="min-h-screen bg-white py-8 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              {t("cart.empty.title")}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-500">
              {t("cart.empty.description")}
            </p>
            <div className="mt-6">
              <Link
                href="/shop"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {t("cart.empty.cta")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-16 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
          {t("cart.title")}
        </h1>

        <div className="mt-8 sm:mt-12">
          <div className="flow-root">
            <ul role="list" className="-my-6 divide-y divide-gray-200">
              {items.map((item) => (
                <li key={item.id} className="flex flex-col sm:flex-row py-6">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mx-auto sm:mx-0">
                    <Image
                      src={item.image || "/images/image.png"}
                      alt={item.name || "Product image"}
                      className="h-full w-full object-cover object-center"
                      width={180}
                      height={180}
                    />
                  </div>

                  <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-1 flex-col text-center sm:text-left">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:justify-between text-base font-medium text-gray-900">
                        <h3 className="mb-1 sm:mb-0">
                          <Link href={`/products/${item.id}`}>{item.name}</Link>
                        </h3>
                        <p className="ml-0 sm:ml-4">
                          €{(Number(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-1 items-center justify-between mt-4 sm:mt-0 text-sm">
                      <div className="flex items-center space-x-3 mx-auto sm:mx-0">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          className="rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-200"
                        >
                          -
                        </button>
                        <span className="text-gray-500">{item.quantity}</span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          className="rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-200"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-indigo-600 hover:text-indigo-500 mt-4 sm:mt-0"
                        aria-label="Remove item"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 sm:mt-10 border-t border-gray-200 pt-6 sm:pt-10">
          <div className="flex justify-between text-base font-medium text-gray-900">
            <p>{t("cart.subtotal")}</p>
            <p>€{getTotal().toFixed(2)}</p>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">{t("cart.shipping")}</p>

          <div className="mt-6">
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {isCheckingOut
                ? t("cart.processing")
                : t("cart.proceedToCheckout")}
            </button>
          </div>

          <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
            <p>
              {t("cart.or")}{" "}
              <Link
                href="/shop"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                {t("cart.continueShopping")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
