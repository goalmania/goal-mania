/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useCartStore } from "@/lib/store/cart";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { CouponForm } from "./CouponForm";
import { DiscountRulesForm } from "./DiscountRulesForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MapPinIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  PlusIcon,
  UserIcon,
  PhoneIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  TruckIcon,
  ArrowPathIcon,
  LockClosedIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { refreshUserSession } from "@/lib/utils/session";
import { useTranslation } from "@/lib/hooks/useTranslation";
import React from "react";
import { useTrackEvent } from "@/components/analytics/AnalyticsTracker";
import { trackFbq } from "@/lib/utils/fbq";

const PaymentStep = dynamic(() => import("./PaymentStep"), { ssr: false });

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

// ── Compact field component ──────────────────────────────────────────────────
function Field({
  label,
  required,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-xs font-semibold text-white/70 uppercase tracking-wider">
        {label}
        {required && <span className="text-[#c8f000] ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

const inputCls =
  "h-12 bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-[#c8f000] focus:ring-0 focus:bg-white/8 transition-all duration-150";

// ── Step indicator ───────────────────────────────────────────────────────────
function StepBar({ step }: { step: "address" | "payment" }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {(["address", "payment"] as const).map((s, i) => {
        const active = step === s;
        const done = step === "payment" && s === "address";
        return (
          <React.Fragment key={s}>
            {i > 0 && (
              <div
                className={`flex-1 h-px mx-3 transition-colors duration-300 ${
                  done ? "bg-[#c8f000]" : "bg-white/10"
                }`}
              />
            )}
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  done
                    ? "bg-[#c8f000] text-black"
                    : active
                    ? "bg-[#c8f000] text-black ring-4 ring-[#c8f000]/20"
                    : "bg-white/10 text-white/40"
                }`}
              >
                {done ? <CheckCircleIcon className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={`text-sm font-medium hidden sm:block ${
                  active || done ? "text-white" : "text-white/40"
                }`}
              >
                {s === "address" ? "Spedizione" : "Pagamento"}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Trust bar ────────────────────────────────────────────────────────────────
function TrustBar() {
  const items = [
    { icon: LockClosedIcon, text: "Pagamento sicuro SSL" },
    { icon: TruckIcon, text: "Spedizione gratuita" },
    { icon: ArrowPathIcon, text: "Reso gratuito 30gg" },
    { icon: ShieldCheckIcon, text: "Acquisto protetto" },
  ];
  return (
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 py-4 border-y border-white/6 mb-8">
      {items.map(({ icon: Icon, text }) => (
        <div key={text} className="flex items-center gap-1.5 text-xs text-white/50">
          <Icon className="w-3.5 h-3.5 text-[#c8f000]" />
          <span>{text}</span>
        </div>
      ))}
    </div>
  );
}

// ── Order summary (collapsible on mobile) ───────────────────────────────────
function OrderSummary({
  items,
  subtotal,
  couponDiscount,
  discountRulesAmount,
  total,
  appliedCoupon,
  appliedDiscountRules,
  cartItems,
  isLoading,
  step,
  onApplyDiscounts,
  onApplyCoupon,
}: any) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden">
      {/* Mobile toggle */}
      <button
        className="w-full flex items-center justify-between p-5 lg:hidden"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <svg className="w-4 h-4 text-[#c8f000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Riepilogo ordine ({items.length} {items.length === 1 ? "articolo" : "articoli"})
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#c8f000] font-bold text-lg">€{total.toFixed(2)}</span>
          {open ? <ChevronUpIcon className="w-4 h-4 text-white/50" /> : <ChevronDownIcon className="w-4 h-4 text-white/50" />}
        </div>
      </button>

      {/* Desktop always visible / mobile collapsible */}
      <div className={`${open ? "block" : "hidden"} lg:block`}>
        <div className="p-5 pt-0 lg:pt-5 space-y-5">
          {/* Items */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
            {items.map((item: any) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-white/5">
                  <Image
                    src={item.image || "/placeholder.png"}
                    alt={item.name}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                  {item.quantity > 1 && (
                    <div className="absolute -top-1 -right-1 bg-[#c8f000] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                      {item.quantity}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{item.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-white/40 text-xs">Qtà: {item.quantity}</span>
                    {item.customization && (
                      <span className="text-[10px] bg-[#c8f000]/15 text-[#c8f000] px-1.5 py-0.5 rounded-md font-medium">Custom</span>
                    )}
                  </div>
                </div>
                <span className="text-white font-semibold text-sm flex-shrink-0">€{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/8 pt-4 space-y-3">
            <DiscountRulesForm
              cartItems={cartItems}
              onApplyDiscounts={onApplyDiscounts}
              isDisabled={isLoading || step !== "address"}
            />
            <CouponForm
              onApplyCoupon={onApplyCoupon}
              isDisabled={isLoading || step !== "address"}
            />
          </div>

          <div className="border-t border-white/8 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Subtotale</span>
              <span className="text-white">€{subtotal.toFixed(2)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-emerald-400">Coupon {appliedCoupon?.code}</span>
                <span className="text-emerald-400 font-medium">−€{couponDiscount.toFixed(2)}</span>
              </div>
            )}
            {appliedDiscountRules?.map((rule: any) => (
              <div key={rule._id} className="flex justify-between text-sm">
                <span className="text-emerald-400">{rule.name}</span>
                <span className="text-emerald-400 font-medium">−€{rule.discountAmount.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Spedizione</span>
              <span className="text-emerald-400 font-medium">Gratuita</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-white/8">
              <span className="text-white font-bold text-base">Totale</span>
              <div className="text-right">
                <span className="text-[#c8f000] font-black text-2xl">€{total.toFixed(2)}</span>
                <p className="text-white/30 text-xs">IVA inclusa</p>
              </div>
            </div>
          </div>

          {/* Payment logos */}
          <div className="flex items-center justify-center gap-3 pt-2 opacity-50">
            <span className="text-[10px] text-white/40 uppercase tracking-widest">Accettiamo</span>
            {["VISA", "MC", "AMEX", "PP"].map((brand) => (
              <span key={brand} className="text-[10px] font-bold bg-white/8 text-white/60 px-1.5 py-0.5 rounded">{brand}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { t } = useTranslation();
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const { items, getTotal, clearCart, appliedDiscountRules, applyDiscountRules } = useCartStore();
  const trackEvent = useTrackEvent();
  const hasRefreshedRef = useRef(false);
  const [sessionRefreshed, setSessionRefreshed] = useState(false);
  const [cartMounted, setCartMounted] = useState(false);

  const cartItems = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        category: item.category,
      })),
    [items]
  );

  const [checkoutMode, setCheckoutMode] = useState<"choose" | "guest" | "account">("choose");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestAddress, setGuestAddress] = useState<Omit<Address, "isDefault">>({
    fullName: "", addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "", phone: "",
  });

  const [step, setStep] = useState<"address" | "payment">("address");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<Address, "isDefault">>({
    fullName: "", addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "", phone: "",
  });

  const [appliedCoupon, setAppliedCoupon] = useState<{
    discountPercentage: number;
    couponId: string;
    code: string;
  } | null>(null);

  const [clientSecret, setClientSecret] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const prefetchingRef = useRef(false);

  // Subtotale lordo — NON usare getTotal() che già sottrae i discount rules
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const couponDiscount = appliedCoupon ? (subtotal * appliedCoupon.discountPercentage) / 100 : 0;
  const discountRulesAmount = appliedDiscountRules.reduce((sum: number, rule: any) => sum + rule.discountAmount, 0);
  const totalDiscountAmount = couponDiscount + discountRulesAmount;
  const total = subtotal - totalDiscountAmount;

  useEffect(() => {
    if (session?.user) {
      refreshUserSession(updateSession, session)
        .then(() => setSessionRefreshed(true))
        .catch(console.error);
    }
  }, [session?.user?.id, updateSession]);

  useEffect(() => { setCartMounted(true); }, []);

  useEffect(() => {
    if (!cartMounted) return;
    if (items.length === 0 && !paymentSuccess) router.push("/cart");
  }, [cartMounted, items.length, router, paymentSuccess]);

  useEffect(() => {
    if (session?.user) fetchAddresses();
  }, [session]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/addresses");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAddresses(data);
      const def = data.find((a: Address) => a.isDefault);
      setSelectedAddressId(def ? def._id : data[0]?._id);
    } catch {
      toast.error("Impossibile caricare gli indirizzi");
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newAddress, isDefault: false }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success("Indirizzo aggiunto!");
      setAddresses((prev) => [...prev, data]);
      setSelectedAddressId(data._id);
      setIsAddingAddress(false);
      setNewAddress({ fullName: "", addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "", phone: "" });
    } catch {
      toast.error("Errore nel salvataggio dell'indirizzo");
    } finally {
      setIsLoading(false);
    }
  };

  // Precrea il PaymentIntent in background appena l'indirizzo è selezionato
  const prefetchPaymentIntent = useCallback(async (addressId: string | undefined, isGuest: boolean) => {
    if (prefetchingRef.current || clientSecret) return;
    if (!isGuest && !addressId) return;
    prefetchingRef.current = true;
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          addressId: isGuest ? null : addressId,
          guestEmail: isGuest ? guestEmail : undefined,
          guestAddress: isGuest ? guestAddress : undefined,
          coupon: appliedCoupon ? { id: appliedCoupon.couponId, code: appliedCoupon.code, discountPercentage: appliedCoupon.discountPercentage, discountAmount: couponDiscount } : null,
          discountRules: appliedDiscountRules.length > 0 ? appliedDiscountRules : null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.clientSecret) {
        setClientSecret(data.clientSecret);
      }
    } catch {
      // silenzioso — riprova al click
    } finally {
      prefetchingRef.current = false;
    }
  }, [items, guestEmail, guestAddress, appliedCoupon, couponDiscount, appliedDiscountRules, clientSecret]);

  // Prefetch appena l'indirizzo è scelto
  useEffect(() => {
    if (selectedAddressId && checkoutMode !== "guest") {
      prefetchPaymentIntent(selectedAddressId, false);
    }
  }, [selectedAddressId]);

  const handleContinueToPayment = async () => {
    const isGuest = checkoutMode === "guest";
    if (!isGuest && !selectedAddressId) {
      toast.error("Seleziona un indirizzo di spedizione");
      return;
    }
    if (isGuest && (!guestAddress.fullName || !guestAddress.addressLine1 || !guestAddress.city || !guestEmail)) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }

    // Se il clientSecret è già pronto (prefetchato), vai subito al pagamento
    if (clientSecret) {
      setStep("payment");
      trackEvent("checkout_start", { value: getTotal() });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          addressId: isGuest ? null : selectedAddressId,
          guestEmail: isGuest ? guestEmail : undefined,
          guestAddress: isGuest ? guestAddress : undefined,
          coupon: appliedCoupon ? { id: appliedCoupon.couponId, code: appliedCoupon.code, discountPercentage: appliedCoupon.discountPercentage, discountAmount: couponDiscount } : null,
          discountRules: appliedDiscountRules.length > 0 ? appliedDiscountRules : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore");
      setClientSecret(data.clientSecret);
      setStep("payment");
      trackEvent("checkout_start", { value: getTotal() });
    } catch (err) {
      toast.error("Errore durante il checkout");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestCreateOrder = async () => {
    if (!selectedAddressId) return toast.error("Seleziona un indirizzo");
    setIsLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ productId: item.id, name: item.name, price: item.price, quantity: item.quantity, customization: item.customization })),
          amount: total,
          addressId: selectedAddressId,
          shippingAddress: addresses.find((a) => a._id === selectedAddressId),
          coupon: appliedCoupon ? { code: appliedCoupon.code, discountPercentage: appliedCoupon.discountPercentage, discountAmount: couponDiscount, id: appliedCoupon.couponId } : null,
          discountRules: appliedDiscountRules.length > 0 ? appliedDiscountRules : null,
        }),
      });
      if (!res.ok) throw new Error();
      clearCart();
      router.push("/account/orders?success=true");
    } catch {
      toast.error("Errore nella creazione ordine");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    const isGuest = checkoutMode === "guest";
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({ productId: item.id, name: item.name, price: item.price, quantity: item.quantity, customization: item.customization })),
        amount: total,
        addressId: isGuest ? null : selectedAddressId,
        shippingAddress: isGuest ? guestAddress : addresses.find((a) => a._id === selectedAddressId),
        guestEmail: isGuest ? guestEmail : undefined,
        coupon: appliedCoupon ? { code: appliedCoupon.code, discountPercentage: appliedCoupon.discountPercentage, discountAmount: couponDiscount, id: appliedCoupon.couponId } : null,
      }),
    })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => {
        trackEvent("purchase", { value: total });
        trackFbq("Purchase", {
          value: total,
          currency: "EUR",
          content_ids: items.map((i) => i.id),
          num_items: items.reduce((n, i) => n + i.quantity, 0),
        });
        clearCart();
        if (appliedCoupon) {
          return fetch("/api/coupons/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ couponId: appliedCoupon.couponId }) });
        }
      })
      .then(() => {
        clearCart();
        router.push(isGuest ? "/checkout/success?guest=true" : "/account/orders?success=true");
      })
      .catch(() => {
        toast.error("Problema con l'ordine, contattaci");
        router.push(isGuest ? "/checkout/success?guest=true" : "/account/orders");
      });
  };

  const handleApplyCoupon = (discountPercentage: number, couponId: string, code: string) => {
    setAppliedCoupon({ discountPercentage, couponId, code });
    // Reset Stripe client secret — il totale è cambiato, il prefetch è stale
    setClientSecret("");
    prefetchingRef.current = false;
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#c8f000] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/50 text-sm">Caricamento...</p>
        </div>
      </div>
    );
  }

  // ── Unauthenticated "choose" screen ────────────────────────────────────────
  if (status === "unauthenticated" && checkoutMode === "choose") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 pt-[112px] pb-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[#c8f000]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LockClosedIcon className="w-7 h-7 text-[#c8f000]" />
            </div>
            <h1 className="text-2xl font-black text-white mb-1">Checkout Sicuro</h1>
            <p className="text-white/50 text-sm">Come vuoi procedere?</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push("/auth/signin?callbackUrl=/checkout")}
              className="w-full flex items-center gap-4 p-4 bg-[#c8f000] rounded-2xl hover:bg-[#d4f520] active:scale-[0.97] transition-all duration-150 text-left group"
            >
              <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <UserIcon className="h-5 w-5 text-black" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-black text-sm">Accedi al tuo account</p>
                <p className="text-black/60 text-xs">Indirizzi salvati e storico ordini</p>
              </div>
              <svg className="w-4 h-4 text-black/40 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={() => setCheckoutMode("guest")}
              className="w-full flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 hover:bg-white/8 active:scale-[0.97] transition-all duration-150 text-left group"
            >
              <div className="w-10 h-10 bg-white/8 rounded-xl flex items-center justify-center flex-shrink-0">
                <GlobeAltIcon className="h-5 w-5 text-white/60" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">Continua come ospite</p>
                <p className="text-white/40 text-xs">Senza registrazione</p>
              </div>
              <svg className="w-4 h-4 text-white/20 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 mt-6">
            {["SSL", "Stripe", "PayPal"].map((b) => (
              <span key={b} className="text-[10px] font-bold text-white/20 border border-white/10 px-2 py-1 rounded">{b}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Main checkout ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-[112px] pb-16">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Checkout</h1>
        </div>

        <TrustBar />
        <StepBar step={step} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">

          {/* ── LEFT: form ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-5">

            {step === "address" ? (
              <div className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden">
                {/* Section header */}
                <div className="px-6 py-5 border-b border-white/8 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#c8f000]/10 flex items-center justify-center">
                    <MapPinIcon className="w-5 h-5 text-[#c8f000]" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-base">Indirizzo di spedizione</h2>
                    <p className="text-white/40 text-xs">Dove vuoi ricevere il tuo ordine?</p>
                  </div>
                </div>

                <div className="p-6">
                  {checkoutMode === "guest" ? (
                    // ── GUEST FORM ──────────────────────────────────────────
                    <form onSubmit={(e) => { e.preventDefault(); handleContinueToPayment(); }} className="space-y-4">
                      <Field label="Email" required>
                        <Input
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          required
                          placeholder="mario@example.com"
                          className={inputCls}
                        />
                      </Field>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Nome completo" required>
                          <Input
                            value={guestAddress.fullName}
                            onChange={(e) => setGuestAddress((p) => ({ ...p, fullName: e.target.value }))}
                            required
                            placeholder="Mario Rossi"
                            className={inputCls}
                          />
                        </Field>
                        <Field label="Telefono" required>
                          <Input
                            type="tel"
                            value={guestAddress.phone}
                            onChange={(e) => setGuestAddress((p) => ({ ...p, phone: e.target.value }))}
                            required
                            placeholder="+39 333 000 0000"
                            className={inputCls}
                          />
                        </Field>
                      </div>

                      <Field label="Indirizzo" required>
                        <Input
                          value={guestAddress.addressLine1}
                          onChange={(e) => setGuestAddress((p) => ({ ...p, addressLine1: e.target.value }))}
                          required
                          placeholder="Via Roma 1"
                          className={inputCls}
                        />
                      </Field>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <Field label="Città" required>
                          <Input
                            value={guestAddress.city}
                            onChange={(e) => setGuestAddress((p) => ({ ...p, city: e.target.value }))}
                            required
                            placeholder="Milano"
                            className={inputCls}
                          />
                        </Field>
                        <Field label="CAP" required>
                          <Input
                            value={guestAddress.postalCode}
                            onChange={(e) => setGuestAddress((p) => ({ ...p, postalCode: e.target.value }))}
                            required
                            placeholder="20100"
                            className={inputCls}
                          />
                        </Field>
                        <Field label="Provincia" className="col-span-2 sm:col-span-1">
                          <Input
                            value={guestAddress.state}
                            onChange={(e) => setGuestAddress((p) => ({ ...p, state: e.target.value }))}
                            placeholder="MI"
                            className={inputCls}
                          />
                        </Field>
                      </div>

                      <Field label="Paese" required>
                        <Select value={guestAddress.country} onValueChange={(v) => setGuestAddress((p) => ({ ...p, country: v }))}>
                          <SelectTrigger className={inputCls}>
                            <SelectValue placeholder="Seleziona paese" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                            {[["Italy","Italia"],["France","Francia"],["Germany","Germania"],["Spain","Spagna"],["United Kingdom","Regno Unito"]].map(([v, l]) => (
                              <SelectItem key={v} value={v} className="focus:bg-[#c8f000]/10">{l}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>

                      <div className="flex items-center justify-between pt-4">
                        <button
                          type="button"
                          onClick={() => setCheckoutMode("choose")}
                          className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
                        >
                          <ArrowLeftIcon className="w-4 h-4" />
                          Indietro
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex items-center gap-2 bg-[#c8f000] hover:bg-[#d4f520] text-black font-bold px-6 py-3 rounded-xl active:scale-[0.97] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Caricamento...</>
                          ) : (
                            <><CreditCardIcon className="w-4 h-4" />Vai al pagamento</>
                          )}
                        </button>
                      </div>
                    </form>

                  ) : addresses.length > 0 && !isAddingAddress ? (
                    // ── SAVED ADDRESSES ─────────────────────────────────────
                    <div className="space-y-5">
                      <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId} className="space-y-3">
                        {addresses.map((address) => (
                          <div
                            key={address._id}
                            onClick={() => setSelectedAddressId(address._id)}
                            className={`relative border rounded-xl p-4 cursor-pointer transition-all duration-150 ${
                              selectedAddressId === address._id
                                ? "border-[#c8f000] bg-[#c8f000]/5"
                                : "border-white/10 hover:border-white/20 bg-white/3"
                            }`}
                          >
                            {selectedAddressId === address._id && (
                              <div className="absolute top-3 right-3 w-5 h-5 bg-[#c8f000] rounded-full flex items-center justify-center">
                                <CheckCircleIcon className="w-3.5 h-3.5 text-black" />
                              </div>
                            )}
                            <div className="flex items-start gap-3 pr-6">
                              <RadioGroupItem value={address._id || ""} id={address._id} className="mt-0.5 sr-only" />
                              <div className="w-8 h-8 bg-white/6 rounded-lg flex items-center justify-center flex-shrink-0">
                                <UserIcon className="w-4 h-4 text-white/50" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-white font-semibold text-sm">{address.fullName}</p>
                                  {address.isDefault && (
                                    <span className="text-[10px] bg-[#c8f000]/15 text-[#c8f000] px-1.5 py-0.5 rounded font-medium">Predefinito</span>
                                  )}
                                </div>
                                <p className="text-white/50 text-sm">{address.addressLine1}</p>
                                <p className="text-white/40 text-xs">{address.city} {address.postalCode} · {address.country}</p>
                                <p className="text-white/40 text-xs mt-0.5">{address.phone}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingAddress(true)}
                          className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
                        >
                          <PlusIcon className="w-4 h-4" />
                          Nuovo indirizzo
                        </button>
                        <div className="flex items-center gap-3">
                          {process.env.NODE_ENV === "development" && (
                            <button
                              type="button"
                              onClick={handleTestCreateOrder}
                              disabled={!selectedAddressId || isLoading}
                              className="text-xs bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700"
                            >
                              Test Order
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleContinueToPayment}
                            disabled={!selectedAddressId || isLoading}
                            className="flex items-center gap-2 bg-[#c8f000] hover:bg-[#d4f520] text-black font-bold px-6 py-3 rounded-xl active:scale-[0.97] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? (
                              <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Caricamento...</>
                            ) : (
                              <><CreditCardIcon className="w-4 h-4" />Vai al pagamento</>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                  ) : (
                    // ── NEW ADDRESS FORM ────────────────────────────────────
                    <form onSubmit={handleAddressSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Nome completo" required>
                          <Input type="text" name="fullName" value={newAddress.fullName} onChange={handleAddressChange} required placeholder="Mario Rossi" className={inputCls} />
                        </Field>
                        <Field label="Telefono" required>
                          <Input type="tel" name="phone" value={newAddress.phone} onChange={handleAddressChange} required placeholder="+39 333 000 0000" className={inputCls} />
                        </Field>
                      </div>
                      <Field label="Indirizzo" required>
                        <Input type="text" name="addressLine1" value={newAddress.addressLine1} onChange={handleAddressChange} required placeholder="Via Roma 1" className={inputCls} />
                      </Field>
                      <Field label="Appartamento / Interno">
                        <Input type="text" name="addressLine2" value={newAddress.addressLine2 || ""} onChange={handleAddressChange} placeholder="Scala A, int. 5" className={inputCls} />
                      </Field>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <Field label="Città" required>
                          <Input type="text" name="city" value={newAddress.city} onChange={handleAddressChange} required placeholder="Milano" className={inputCls} />
                        </Field>
                        <Field label="CAP" required>
                          <Input type="text" name="postalCode" value={newAddress.postalCode} onChange={handleAddressChange} required placeholder="20100" className={inputCls} />
                        </Field>
                        <Field label="Provincia" className="col-span-2 sm:col-span-1">
                          <Input type="text" name="state" value={newAddress.state} onChange={handleAddressChange} placeholder="MI" className={inputCls} />
                        </Field>
                      </div>
                      <Field label="Paese" required>
                        <Select value={newAddress.country} onValueChange={(v) => setNewAddress((p) => ({ ...p, country: v }))}>
                          <SelectTrigger className={inputCls}>
                            <SelectValue placeholder="Seleziona paese" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                            {[["Italy","Italia"],["France","Francia"],["Germany","Germania"],["Spain","Spagna"],["United Kingdom","Regno Unito"],["United States","Stati Uniti"]].map(([v, l]) => (
                              <SelectItem key={v} value={v} className="focus:bg-[#c8f000]/10">{l}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <div className="flex items-center justify-between pt-4">
                        {addresses.length > 0 && (
                          <button type="button" onClick={() => setIsAddingAddress(false)} className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors">
                            <ArrowLeftIcon className="w-4 h-4" />
                            Annulla
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="ml-auto flex items-center gap-2 bg-[#c8f000] hover:bg-[#d4f520] text-black font-bold px-6 py-3 rounded-xl active:scale-[0.97] transition-all duration-150 disabled:opacity-50"
                        >
                          {isLoading ? (
                            <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Salvataggio...</>
                          ) : (
                            <><CheckCircleIcon className="w-4 h-4" />Salva e continua</>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

            ) : (
              // ── PAYMENT STEP ────────────────────────────────────────────────
              <div className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-white/8 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#c8f000]/10 flex items-center justify-center">
                    <CreditCardIcon className="w-5 h-5 text-[#c8f000]" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-base">Pagamento</h2>
                    <p className="text-white/40 text-xs">Transazione crittografata SSL</p>
                  </div>
                </div>
                <div className="p-6">
                  <PaymentStep
                    clientSecret={clientSecret}
                    total={total}
                    onSuccess={handlePaymentSuccess}
                    items={items}
                    addressId={selectedAddressId || ""}
                    coupon={appliedCoupon}
                    discountRules={appliedDiscountRules}
                    guestEmail={checkoutMode === "guest" ? guestEmail : undefined}
                    shippingAddress={checkoutMode === "guest" ? guestAddress : addresses.find(a => a._id === selectedAddressId)}
                  />
                  <button
                    type="button"
                    onClick={() => setStep("address")}
                    disabled={isLoading}
                    className="mt-5 flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Modifica spedizione
                  </button>
                </div>
              </div>
            )}

            {/* Bottom trust */}
            <div className="flex items-center justify-center gap-2 text-white/25 text-xs py-2">
              <LockClosedIcon className="w-3 h-3" />
              <span>Pagamento sicuro · I tuoi dati sono protetti</span>
            </div>
          </div>

          {/* ── RIGHT: order summary ────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-28">
              <OrderSummary
                items={items}
                subtotal={subtotal}
                couponDiscount={couponDiscount}
                discountRulesAmount={discountRulesAmount}
                total={total}
                appliedCoupon={appliedCoupon}
                appliedDiscountRules={appliedDiscountRules}
                cartItems={cartItems}
                isLoading={isLoading}
                step={step}
                onApplyDiscounts={(rules: any[]) => {
                  applyDiscountRules(rules);
                  setClientSecret("");
                  prefetchingRef.current = false;
                }}
                onApplyCoupon={handleApplyCoupon}
              />

              {/* Reassurance block */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { icon: TruckIcon, title: "Spedizione rapida", sub: "2–5 giorni lav." },
                  { icon: ArrowPathIcon, title: "Reso gratuito", sub: "Entro 30 giorni" },
                  { icon: ShieldCheckIcon, title: "100% sicuro", sub: "Dati protetti" },
                ].map(({ icon: Icon, title, sub }) => (
                  <div key={title} className="bg-white/3 border border-white/6 rounded-xl p-3 text-center">
                    <Icon className="w-5 h-5 text-[#c8f000] mx-auto mb-1.5" />
                    <p className="text-white text-[11px] font-semibold leading-tight">{title}</p>
                    <p className="text-white/40 text-[10px] mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
