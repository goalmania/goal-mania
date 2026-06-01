"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useCartStore } from "@/lib/store/cart";
import toast from "react-hot-toast";

function ScalapayConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCartStore();
  const [status, setStatus] = useState<"loading" | "success" | "cancel" | "error">("loading");

  useEffect(() => {
    const statusParam = searchParams.get("status");
    const token = searchParams.get("token") || searchParams.get("orderToken");

    if (statusParam === "cancel") {
      setStatus("cancel");
      toast.error("Pagamento Scalapay annullato");
      setTimeout(() => router.push("/checkout"), 3000);
      return;
    }

    if (statusParam === "success" && token) {
      // Capture il pagamento
      fetch("/api/scalapay/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setStatus("success");
            clearCart();
            setTimeout(() => router.push("/checkout/success?scalapay=true"), 2000);
          } else {
            setStatus("error");
          }
        })
        .catch(() => setStatus("error"));
    } else {
      setStatus("error");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 pt-[112px]">
      <div className="text-center max-w-sm">
        {status === "loading" && (
          <>
            <div className="w-12 h-12 border-2 border-[#c8f000] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-semibold">Conferma pagamento Scalapay...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-[#c8f000]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-9 h-9 text-[#c8f000]" />
            </div>
            <h1 className="text-2xl font-black text-white mb-2">Pagamento completato!</h1>
            <p className="text-white/50 text-sm">Il tuo ordine è confermato. Ti reindirizziamo...</p>
          </>
        )}
        {status === "cancel" && (
          <>
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircleIcon className="w-9 h-9 text-white/40" />
            </div>
            <h1 className="text-xl font-black text-white mb-2">Pagamento annullato</h1>
            <p className="text-white/50 text-sm">Stai tornando al checkout...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircleIcon className="w-9 h-9 text-red-400" />
            </div>
            <h1 className="text-xl font-black text-white mb-2">Errore pagamento</h1>
            <p className="text-white/50 text-sm mb-4">Qualcosa è andato storto con Scalapay.</p>
            <button
              onClick={() => router.push("/checkout")}
              className="bg-[#c8f000] text-black font-bold px-6 py-3 rounded-xl"
            >
              Riprova
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ScalapayConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#c8f000] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ScalapayConfirmContent />
    </Suspense>
  );
}
