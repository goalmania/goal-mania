"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import { ToastProvider } from "@/components/ToastProvider";
import WhatsAppButton from "@/components/shared/WhatsAppButton";
import UrgencyFloat from "@/components/UrgencyFloat";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
      <main className="flex-grow pt-[112px]">{children}</main>
      {!isShop && <Footer />}
      <ToastProvider />
      <WhatsAppButton />
      <UrgencyFloat />
    </div>
  );
}
