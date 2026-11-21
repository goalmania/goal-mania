"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Shirt, History, ShoppingBag, User } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";

// Barra fissa solo su telefono: le 5 destinazioni che portano all'acquisto.
// Nascosta dove c'e gia una barra d'acquisto (scheda prodotto, carrello, checkout) e nell'admin.
const HIDDEN = ["/products/", "/cart", "/checkout", "/admin"];

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
    { href: "/account", label: "Account", Icon: User, active: pathname.startsWith("/account") },
  ];

  return (
    <nav
      aria-label="Navigazione principale"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/10 bg-[#0a0a0a] md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, Icon, active, badge }) => (
          <li key={href}>
            <Link
              href={href}
              className={`relative flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[11px] font-bold uppercase tracking-wide ${active ? "text-[#c8f000]" : "text-white/70"}`}
              style={{ fontFamily: "var(--font-display, sans-serif)" }}
            >
              <span className="relative">
                <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.5 : 2} />
                {!!badge && badge > 0 && (
                  <span className="absolute -right-2.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#c8f000] px-1 text-[10px] font-black text-[#0a0a0a]">
                    {badge}
                  </span>
                )}
              </span>
              {label}
              {active && <span className="absolute inset-x-5 top-0 h-[3px] bg-[#c8f000]" />}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
