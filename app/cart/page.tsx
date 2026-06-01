"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { TrashIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ShieldCheck, Truck, RotateCcw, BadgeCheck, Zap, Star, ArrowRight, Package } from "lucide-react";
import { useTrackEvent } from "@/components/analytics/AnalyticsTracker";

const FREE_SHIPPING_THRESHOLD = 0; // spedizione sempre gratuita

function ShippingProgressBar({ total }: { total: number }) {
  return (
    <div className="rounded-2xl p-4 mb-6 flex items-center gap-3" style={{ background: "rgba(200,240,0,0.08)", border: "1px solid rgba(200,240,0,0.2)" }}>
      <Truck size={16} className="text-[#c8f000] flex-shrink-0" />
      <span className="text-xs font-black uppercase tracking-widest text-[#c8f000]" style={{ fontFamily: "var(--font-display, sans-serif)" }}>
        Spedizione Gratuita su tutti gli ordini!
      </span>
      <BadgeCheck size={16} className="text-[#c8f000] ml-auto flex-shrink-0" />
    </div>
  );
}

interface UpsellProduct {
  _id: string;
  title: string;
  basePrice: number;
  images: string[];
  slug: string;
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const { t } = useTranslation();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [upsellProducts, setUpsellProducts] = useState<UpsellProduct[]>([]);
  const router = useRouter();
  const trackEvent = useTrackEvent();

  // Carica prodotti correlati (escludi quelli già nel carrello)
  useEffect(() => {
    const cartIds = items.map(i => i.id);
    fetch(`/api/products/upsell?exclude=${cartIds.join(",")}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setUpsellProducts(data.slice(0, 2)))
      .catch(() => {});
  }, [items.length]);

  const total = getTotal();

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
      trackEvent("checkout_start", { value: getTotal() });
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
      <div className="min-h-screen bg-[#0a0a0a] pt-[112px]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-[#111] rounded-full flex items-center justify-center mb-6 border border-white/8">
              <ShoppingBagIcon className="w-12 h-12 text-white/20" />
            </div>
            <h1
              className="text-3xl font-black uppercase text-white mb-3"
              style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "2px" }}
            >
              {t("cart.empty.title")}
            </h1>
            <p className="text-white/40 mb-8 max-w-sm mx-auto">
              {t("cart.empty.description")}
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-black text-black uppercase tracking-wider transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{ background: "#c8f000", fontFamily: "var(--font-display, sans-serif)", letterSpacing: "2px", boxShadow: "0 8px 32px rgba(200,240,0,0.25)" }}
            >
              {t("cart.empty.cta")} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-[90px]">
      {/* Page header */}
      <div className="border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <span className="w-5 h-[2px] rounded-full inline-block" style={{ background: "#c8f000" }} />
            <span className="text-[10px] uppercase tracking-[4px]" style={{ fontFamily: "var(--font-mono, monospace)", color: "#c8f000" }}>
              // Carrello
            </span>
          </div>
          <h1
            className="font-black uppercase text-white mt-2 leading-tight"
            style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", letterSpacing: "1px" }}
          >
            Il Tuo Carrello
            <span className="text-[#c8f000] ml-3">({items.length})</span>
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Cart Items ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Shipping progress */}
            <ShippingProgressBar total={total} />

            {/* Items list */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.06)", background: "#111" }}
            >
              <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2">
                  <Package size={14} className="text-[#c8f000]" />
                  <span
                    className="text-xs uppercase tracking-widest font-black text-white"
                    style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "2px" }}
                  >
                    {items.length} {items.length === 1 ? "Articolo" : "Articoli"}
                  </span>
                </div>
                <Link href="/shop" className="text-[10px] uppercase tracking-widest text-white/30 hover:text-[#c8f000] transition-colors" style={{ fontFamily: "var(--font-mono, monospace)" }}>
                  Continua a comprare →
                </Link>
              </div>

              <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {items.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 p-5 hover:bg-white/[0.02] transition-colors">
                    {/* Image */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#1a1a1a]">
                      <Image
                        src={item.image || "/images/image.png"}
                        alt={item.name || "Product image"}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3
                            className="font-bold text-white text-sm leading-tight mb-1 hover:text-[#c8f000] transition-colors"
                            style={{ fontFamily: "var(--font-display, sans-serif)" }}
                          >
                            <Link href={`/products/${item.id}`}>{item.name}</Link>
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {item.customization?.size && (
                              <span
                                className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                                style={{ background: "rgba(200,240,0,0.12)", color: "#c8f000", fontFamily: "var(--font-mono, monospace)" }}
                              >
                                Taglia: {item.customization.size}
                              </span>
                            )}
                            {item.customization?.hasCustomization && (
                              <span
                                className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-mono, monospace)" }}
                              >
                                Personalizzata
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/30" style={{ fontFamily: "var(--font-mono, monospace)" }}>
                            €{Number(item.price).toFixed(2)} cad.
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-white text-base" style={{ fontFamily: "var(--font-display, sans-serif)" }}>
                            €{(Number(item.price) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Quantity + Remove */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center bg-[#0a0a0a] rounded-xl p-1 gap-1">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-[#1a1a1a] transition-all text-sm font-bold"
                          >
                            −
                          </button>
                          <span
                            className="text-sm font-black text-white w-8 text-center"
                            style={{ fontFamily: "var(--font-display, sans-serif)" }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-[#1a1a1a] transition-all text-sm font-bold"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-red-400/60 hover:text-red-400 transition-colors"
                          style={{ fontFamily: "var(--font-mono, monospace)" }}
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                          Rimuovi
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upsell suggestions */}
            <div
              className="rounded-2xl p-5"
              style={{ border: "1px solid rgba(200,240,0,0.12)", background: "rgba(200,240,0,0.03)" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Zap size={12} className="text-[#c8f000]" />
                <span
                  className="text-[10px] uppercase tracking-widest text-[#c8f000] font-black"
                  style={{ fontFamily: "var(--font-mono, monospace)" }}
                >
                  // Completa il Look
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {upsellProducts.length > 0 ? upsellProducts.map((item) => (
                  <Link
                    key={item._id}
                    href={`/products/${item.slug}`}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all hover:border-[#c8f000]/30"
                    style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="relative w-10 h-10 rounded-lg flex-shrink-0 bg-[#1a1a1a] overflow-hidden">
                      {item.images?.[0] ? (
                        <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">👕</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white line-clamp-1 leading-tight">{item.title}</p>
                      <p className="text-xs text-[#c8f000] font-black mt-0.5">€{item.basePrice?.toFixed(2)}</p>
                    </div>
                    <ArrowRight size={12} className="text-white/30 flex-shrink-0" />
                  </Link>
                )) : (
                  // Fallback skeleton mentre carica
                  [0,1].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse"
                      style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-2.5 bg-white/5 rounded w-3/4" />
                        <div className="h-2 bg-white/5 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── Order Summary Sidebar ── */}
          <div className="lg:col-span-1">
            <div
              className="rounded-2xl overflow-hidden sticky top-24"
              style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {/* Header */}
              <div className="px-6 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(200,240,0,0.04)" }}>
                <span
                  className="text-[10px] uppercase tracking-[4px] text-[#c8f000]"
                  style={{ fontFamily: "var(--font-mono, monospace)" }}
                >
                  // Riepilogo Ordine
                </span>
              </div>

              <div className="p-6 space-y-5">
                {/* Price breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/50">Subtotale</span>
                    <span className="font-bold text-white">€{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/50">Spedizione</span>
                    <span className="font-bold text-[#c8f000]">Gratuita</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/50">IVA inclusa</span>
                    <span className="text-xs text-white/30" style={{ fontFamily: "var(--font-mono, monospace)" }}>✓</span>
                  </div>
                </div>

                <div className="h-[1px]" style={{ background: "rgba(255,255,255,0.06)" }} />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span
                    className="text-sm font-black uppercase tracking-widest text-white"
                    style={{ fontFamily: "var(--font-display, sans-serif)" }}
                  >
                    Totale
                  </span>
                  <span
                    className="text-2xl font-black text-white"
                    style={{ fontFamily: "var(--font-display, sans-serif)" }}
                  >
                    €{total.toFixed(2)}
                  </span>
                </div>

                {/* CTA */}
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-black transition-all hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{
                    background: "#c8f000",
                    fontFamily: "var(--font-display, sans-serif)",
                    letterSpacing: "2px",
                    boxShadow: "0 8px 32px rgba(200,240,0,0.25)",
                    fontSize: "0.85rem",
                  }}
                >
                  {isCheckingOut ? "Caricamento..." : (
                    <>Procedi al Checkout <ArrowRight size={16} /></>
                  )}
                </button>

                {/* Trust badges */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: ShieldCheck, label: "Pag. Sicuro" },
                    { icon: Truck, label: "Sped. Veloce" },
                    { icon: RotateCcw, label: "Reso 30gg" },
                    { icon: BadgeCheck, label: "Originale" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex flex-col items-center gap-1.5 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <Icon size={16} className="text-[#c8f000]" />
                      <span className="text-[9px] uppercase tracking-widest text-white/40 text-center" style={{ fontFamily: "var(--font-mono, monospace)" }}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Payment methods */}
                <div className="pt-2">
                  <p className="text-[9px] uppercase tracking-widest text-white/20 text-center mb-2" style={{ fontFamily: "var(--font-mono, monospace)" }}>
                    Metodi di Pagamento Accettati
                  </p>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {["VISA", "MC", "PayPal", "Apple Pay"].map((method) => (
                      <span
                        key={method}
                        className="text-[8px] font-black px-2 py-1 rounded tracking-widest"
                        style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono, monospace)", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        {method}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stars social proof */}
                <div className="flex items-center justify-center gap-2 py-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={10} fill="#c8f000" color="#c8f000" />
                    ))}
                  </div>
                  <span className="text-[9px] text-white/30" style={{ fontFamily: "var(--font-mono, monospace)" }}>
                    10.000+ clienti soddisfatti
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
