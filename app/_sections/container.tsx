"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function Container({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isShopPage =
    pathname?.includes("/shop") ||
    pathname?.includes("/products") ||
    pathname?.includes("/cart") ||
    pathname?.includes("/checkout");

  return (
    <main
      className={`w-full h-full ${
        isShopPage
          ? "pt-[72px] md:pt-[104px] sm:pt-[88px] lg:pt-[120px]"
          : "pt-[40px] sm:pt-[56px] md:pt-[64px] lg:pt-[80px]"
      }`}
    >
      {children}
    </main>
  );
}
