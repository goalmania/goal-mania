"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ClockIcon,
  CogIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { detectCourier } from "@/lib/utils/tracking";

interface Order {
  _id: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  trackingCode?: string;
  trackingUrl?: string;
  createdAt: string;
  amount: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  shippingAddress?: {
    fullName?: string;
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
}

const steps = [
  { key: "pending", label: "Ordine ricevuto", icon: ClockIcon, description: "Il tuo ordine è stato ricevuto e confermato." },
  { key: "processing", label: "In lavorazione", icon: CogIcon, description: "Il tuo ordine è in preparazione." },
  { key: "shipped", label: "Spedito", icon: TruckIcon, description: "Il pacco è stato affidato al corriere." },
  { key: "delivered", label: "Consegnato", icon: CheckCircleIcon, description: "Il pacco è stato consegnato." },
];

const stepOrder = ["pending", "processing", "shipped", "delivered"];

function getStepIndex(status: string) {
  return stepOrder.indexOf(status);
}

export default function TrackingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated" && orderId) {
      fetchOrder();
    }
  }, [status, orderId]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) {
        router.push("/account/orders");
        return;
      }
      const data = await res.json();
      setOrder(data.order);
    } catch {
      router.push("/account/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!order?.trackingCode) return;
    await navigator.clipboard.writeText(order.trackingCode);
    setCopied(true);
    toast.success("Codice copiato!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c8f000]" />
      </div>
    );
  }

  if (!order) return null;

  const currentStepIndex = order.status === "cancelled" ? -1 : getStepIndex(order.status);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Back */}
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Torna ai tuoi ordini
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Traccia spedizione</h1>
          <p className="text-white/50 text-sm">
            Ordine #{order._id.slice(-8).toUpperCase()} &bull;{" "}
            {new Date(order.createdAt).toLocaleDateString("it-IT", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Cancelled state */}
        {order.status === "cancelled" ? (
          <div className="rounded-2xl border border-red-900/40 bg-red-950/20 p-6 flex items-center gap-4 mb-8">
            <XCircleIcon className="h-8 w-8 text-red-400 shrink-0" />
            <div>
              <p className="font-semibold text-red-300">Ordine annullato</p>
              <p className="text-sm text-red-400/70 mt-0.5">Questo ordine è stato annullato.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Timeline */}
            <div className="relative mb-10">
              {steps.map((step, i) => {
                const Icon = step.icon;
                const isCompleted = i < currentStepIndex;
                const isActive = i === currentStepIndex;
                const isFuture = i > currentStepIndex;

                return (
                  <div key={step.key} className="flex gap-4 relative">
                    {/* Line */}
                    {i < steps.length - 1 && (
                      <div
                        className={`absolute left-5 top-10 w-0.5 h-full -translate-x-0.5 ${
                          isCompleted ? "bg-[#c8f000]" : "bg-white/10"
                        }`}
                      />
                    )}

                    {/* Icon */}
                    <div
                      className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full shrink-0 border-2 transition-all ${
                        isActive
                          ? "border-[#c8f000] bg-[#c8f000]/10"
                          : isCompleted
                          ? "border-[#c8f000] bg-[#c8f000]"
                          : "border-white/20 bg-white/5"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          isCompleted
                            ? "text-black"
                            : isActive
                            ? "text-[#c8f000]"
                            : "text-white/30"
                        }`}
                      />
                    </div>

                    {/* Text */}
                    <div className="pb-8">
                      <p
                        className={`font-semibold text-sm ${
                          isActive
                            ? "text-[#c8f000]"
                            : isCompleted
                            ? "text-white"
                            : "text-white/30"
                        }`}
                      >
                        {step.label}
                        {isActive && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#c8f000]/20 text-[#c8f000]">
                            Stato attuale
                          </span>
                        )}
                      </p>
                      <p
                        className={`text-sm mt-0.5 ${
                          isFuture ? "text-white/20" : "text-white/50"
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Tracking code card */}
        {order.trackingCode && (() => {
          const courier = detectCourier(order.trackingCode);
          const trackingLink = order.trackingUrl || courier?.url;
          const courierName = courier?.name;

          return (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <TruckIcon className="h-5 w-5 text-[#c8f000]" />
                <h2 className="font-semibold">Informazioni di spedizione</h2>
                {courierName && (
                  <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-[#c8f000]/10 text-[#c8f000] border border-[#c8f000]/20">
                    {courierName}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wide mb-1">Codice tracking</p>
                  <div className="flex items-center gap-3">
                    <code className="font-mono text-lg font-bold text-white bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                      {order.trackingCode}
                    </code>
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-lg border border-white/10 hover:border-white/30 text-white/50 hover:text-white transition-all"
                      title="Copia codice"
                    >
                      {copied ? (
                        <ClipboardDocumentCheckIcon className="h-4 w-4 text-[#c8f000]" />
                      ) : (
                        <ClipboardDocumentIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {trackingLink ? (
                  <a
                    href={trackingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#c8f000] text-black font-semibold text-sm hover:bg-[#d4f700] transition-colors"
                  >
                    <TruckIcon className="h-4 w-4" />
                    Traccia il pacco{courierName ? ` su ${courierName}` : " sul sito del corriere"}
                  </a>
                ) : (
                  <p className="text-sm text-white/40">
                    Usa il codice qui sopra per tracciare il pacco sul sito del corriere.
                  </p>
                )}
              </div>
            </div>
          );
        })()}

        {!order.trackingCode && order.status !== "cancelled" && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6 text-center">
            <TruckIcon className="h-8 w-8 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 text-sm">
              Il codice di tracking sarà disponibile non appena il tuo ordine verrà spedito.
            </p>
          </div>
        )}

        {/* Order summary */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="font-semibold mb-4">Riepilogo ordine</h2>
          <div className="space-y-2 mb-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-white/70">
                  {item.name} <span className="text-white/40">×{item.quantity}</span>
                </span>
                <span>€{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-3 flex justify-between font-semibold">
            <span>Totale</span>
            <span>€{order.amount.toFixed(2)}</span>
          </div>
          {order.shippingAddress && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-white/40 uppercase tracking-wide mb-1">Indirizzo di consegna</p>
              <p className="text-sm text-white/70">
                {order.shippingAddress.fullName && <>{order.shippingAddress.fullName}<br /></>}
                {order.shippingAddress.street}<br />
                {order.shippingAddress.postalCode} {order.shippingAddress.city}<br />
                {order.shippingAddress.country}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
