"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { ToastProvider } from "@/components/ToastProvider";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Reset scroll to top on every page navigation
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  const isAdmin = pathname.startsWith("/admin");
  const isShop = pathname.startsWith("/shop");

  if (isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      {/* pt = announcement bar (40px) + header (72px) = 112px */}
      <main className="flex-grow pt-[112px] pb-[calc(56px+env(safe-area-inset-bottom))] md:pb-0">{children}</main>
      {!isShop && <Footer />}
      <MobileBottomNav />
      <ToastProvider />
      
    </div>
  );
}
