"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Shirt, History, ShoppingBag, User } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";

// Capsula di vetro flottante, solo su telefono (come la barra delle schede di iOS).
// Nascosta dove c'e gia una barra d'acquisto (scheda prodotto, carrello, checkout) e nell'admin.
const HIDDEN = ["/products/", "/cart", "/checkout", "/admin", "/auth"];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const cart = useCartStore();
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(cart.getItemCount());
  }, [cart]);

  if (HIDDEN.some((h) => pathname.startsWith(h))) return null;

  const items = [
    { href: "/", label: "Home", Icon: Home, active: pathname === "/" },
    { href: "/shop", label: "Maglie", Icon: Shirt, active: pathname.startsWith("/shop") && !pathname.startsWith("/shop/retro") },
    { href: "/shop/retro", label: "Retro", Icon: History, active: pathname.startsWith("/shop/retro") },
    { href: "/cart", label: "Carrello", Icon: ShoppingBag, active: false, badge: count },
    { href: "/account/orders", label: "Account", Icon: User, active: pathname.startsWith("/account") || pathname.startsWith("/profile") },
  ];

  return (
    <nav
      aria-label="Navigazione mobile"
      className="glass-strong fixed inset-x-3 z-[60] rounded-[30px] p-1.5 md:hidden"
      style={{ bottom: "calc(10px + env(safe-area-inset-bottom))" }}
    >
      <ul className="grid grid-cols-5 gap-1">
        {items.map(({ href, label, Icon, active, badge }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={`relative flex h-[54px] flex-col items-center justify-center gap-0.5 rounded-[24px] text-[11px] font-medium transition-colors duration-200 active:scale-95 ${active ? "bg-white/14 text-white" : "text-white/65"}`}
            >
              <span className="relative">
                <Icon className={`h-[22px] w-[22px] ${active ? "text-[#c8f000]" : ""}`} strokeWidth={active ? 2.4 : 1.9} />
                {!!badge && badge > 0 && (
                  <span className="absolute -right-3 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#c8f000] px-1 text-[11px] font-bold text-[#0a0a0a]">
                    {badge}
                  </span>
                )}
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
