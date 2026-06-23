"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/lib/store/cart";
import { Suspense } from "react";

function RecoverCartInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { addItem } = useCartStore();

  useEffect(() => {
    const token = params.get("token");
    if (!token) { router.push("/"); return; }

    fetch(`/api/cart-recovery/restore?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.items?.length) {
          data.items.forEach((item: any) => addItem(item));
        }
        router.push("/checkout");
      })
      .catch(() => router.push("/"));
  }, [params, router, addItem]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#c8f000] border-t-transparent rounded-full animate-spin" />
        <p className="text-white/50 text-sm">Recupero carrello...</p>
      </div>
    </div>
  );
}

export default function RecoverCartPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#c8f000] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RecoverCartInner />
    </Suspense>
  );
}
