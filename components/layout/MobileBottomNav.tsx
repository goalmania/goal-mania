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
    { href: "/archivio", label: "Retro", Icon: History, active: pathname.startsWith("/archivio") || pathname.startsWith("/shop/retro") },
    { href: "/cart", label: "Carrello", Icon: ShoppingBag, active: false, badge: count },
    { href: "/account/orders", label: "Account", Icon: User, active: pathname.startsWith("/account") || pathname.startsWith("/profile") },
  ];

  return (
    <nav
      aria-label="Navigazione mobile"
      className="fixed inset-x-0 bottom-0 z-[60] border-t-2 border-[var(--line)] bg-[var(--asphalt)] md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)", transform: "translateZ(0)" }}
    >
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, Icon, active, badge }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={`relative flex h-[58px] flex-col items-center justify-center gap-0.5 font-[family-name:var(--font-display)] text-[13px] italic uppercase tracking-[0.03em] active:bg-white/5 ${active ? "text-[var(--lime)]" : "text-white/75"}`}
            >
              {active && <span className="absolute inset-x-5 top-[-2px] h-[4px] -skew-x-12 bg-[var(--lime)]" />}
              <span className="relative">
                <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.5 : 2} />
                {!!badge && badge > 0 && (
                  <span className="num absolute -right-3 -top-2 flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-[var(--lime)] px-1 text-[13px] text-[#0a0a0a]">{badge}</span>
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
