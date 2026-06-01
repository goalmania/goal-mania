"use client";

import { useState, useEffect } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";

interface PayPalButtonProps {
  total: number;
  items: any[];
  addressId: string;
  coupon: any;
  onSuccess: () => void;
  guestEmail?: string;
  guestAddress?: any;
}

export default function PayPalButton({ total, items, addressId, coupon, onSuccess, guestEmail, guestAddress }: PayPalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [{ isPending, isRejected }] = usePayPalScriptReducer();
  const [isScriptReady, setIsScriptReady] = useState(false);

  useEffect(() => {
    // Controlla immediatamente, poi ogni 200ms max 5 volte
    let attempts = 0;
    const check = () => {
      if (typeof window !== "undefined" && (window as any).paypal) {
        setIsScriptReady(true);
      } else if (attempts < 5) {
        attempts++;
        setTimeout(check, 200);
      } else {
        setError("PayPal non disponibile. Aggiorna la pagina o usa la carta.");
      }
    };
    check();
  }, []);

  const Spinner = () => (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="w-6 h-6 border-2 border-white/10 border-t-[#c8f000] rounded-full animate-spin" />
      <p className="text-sm text-white/40">Caricamento PayPal...</p>
    </div>
  );

  const ErrorBlock = ({ msg }: { msg: string }) => (
    <div className="flex items-start gap-3 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
      <ExclamationTriangleIcon className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm text-red-400">{msg}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-xs text-white/40 hover:text-white/70 mt-1 underline"
        >
          Aggiorna la pagina
        </button>
      </div>
    </div>
  );

  if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
    return <ErrorBlock msg="PayPal non configurato. Usa il pagamento con carta." />;
  }
  if (isPending || !isScriptReady) return <Spinner />;
  if (isRejected) return <ErrorBlock msg="PayPal non è riuscito a caricarsi. Prova con la carta." />;
  if (error && error.includes("non disponibile")) return <ErrorBlock msg={error} />;

  const createOrder = async (_data: any, _actions: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, addressId, coupon, guestEmail, guestAddress }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Errore nella creazione ordine PayPal");
      }
      const result = await res.json();
      return result.orderID;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Errore PayPal";
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const onApprove = async (data: any, _actions: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderID: data.orderID }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Errore nel completamento pagamento");
      }
      const result = await res.json();
      if (result.success) {
        toast.success("Pagamento completato!");
        onSuccess();
      } else {
        throw new Error("Pagamento non completato");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Pagamento fallito";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const onError = (err: any) => {
    const msg = "Pagamento PayPal fallito. Riprova o usa la carta.";
    setError(msg);
    toast.error(msg);
  };

  const onCancel = () => {
    toast.error("Pagamento annullato");
  };

  return (
    <div className="space-y-4">
      {error && <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{error}</div>}

      <div className="paypal-button-container rounded-xl overflow-hidden">
        <PayPalButtons
          style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay", height: 48 }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onError}
          onCancel={onCancel}
          forceReRender={[total, items.length]}
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-sm text-white/40 py-2">
          <div className="w-4 h-4 border-2 border-white/10 border-t-[#c8f000] rounded-full animate-spin" />
          Elaborazione pagamento...
        </div>
      )}
    </div>
  );
}
