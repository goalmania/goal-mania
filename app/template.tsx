"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Conditions for hiding header/footer
  const isAdmin = pathname.startsWith("/admin");
  const isShop = pathname.startsWith("/shop"); // hide footer on shop page

  return (
    <>
      {isAdmin ? (
        <>{children}</>
      ) : (
        <>
          <Header />
          <main className="flex-grow pt-14 sm:pt-16">{children}</main>
          {!isShop && <Footer />}
        </>
      )}
    </>
  );
}
