"use client";

import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useCartStore } from "@/lib/store/cart";

// I carrelli si salvano nel browser: chi tornava con una maglia a 80€ la rivedeva a 80€ anche dopo
// il nuovo listino. All'apertura del sito allineiamo i prezzi del carrello a quelli veri.
export default function CartSync() {
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    const start = () => {
      const items = useCartStore.getState().items;
      if (!items.length) return;
      done.current = true;
      fetch("/api/cart/reprice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((i) => ({ id: i.id, name: i.name, customization: i.customization })) }),
      })
        .then((r) => r.json())
        .then(({ prices }: { prices: Record<string, number | null> }) => {
          let changed = false;
          useCartStore.setState((s) => ({
            items: s.items.map((i) => {
              const p = prices?.[i.id];
              if (typeof p === "number" && p > 0 && Math.abs(p - i.price) > 0.005) {
                changed = true;
                return { ...i, price: p };
              }
              return i;
            }),
          }));
          if (changed) toast.success("Abbiamo aggiornato i prezzi del carrello");
        })
        .catch(() => {});
    };
    // aspetta che lo store persistente sia reidratato
    const t = setTimeout(start, 600);
    return () => clearTimeout(t);
  }, []);

  return null;
}
