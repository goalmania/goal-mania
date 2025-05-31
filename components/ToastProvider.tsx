"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamic import with no SSR (allowed in client components)
const PromoToast = dynamic(() => import("@/components/PromoToast"), {
  ssr: false,
});

export function ToastProvider() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <PromoToast />
    </>
  );
}
