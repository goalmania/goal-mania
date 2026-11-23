"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Shirt, History, ShoppingBag, User } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";

// Barra fissa solo su telefono. Nascosta dove c'e gia una barra d'acquisto
// (scheda prodotto, carrello, checkout) e nell'admin.
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
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/12 bg-[#0a0a0a] md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, Icon, active, badge }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={`relative flex h-[58px] flex-col items-center justify-center gap-0.5 text-[12px] font-extrabold uppercase tracking-wide active:bg-white/5 ${active ? "text-[#c8f000]" : "text-white/75"}`}
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="relative">
                <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.6 : 2} />
                {!!badge && badge > 0 && (
                  <span className="absolute -right-3 -top-2 flex h-[18px] min-w-[18px] items-center justify-center bg-[#c8f000] px-1 text-[11px] font-black text-[#0a0a0a]">
                    {badge}
                  </span>
                )}
              </span>
              {label}
              {active && <span className="absolute inset-x-6 top-0 h-[3px] bg-[#c8f000]" />}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
