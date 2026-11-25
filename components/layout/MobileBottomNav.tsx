"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Shirt, History, ShoppingBag, User, LogOut, X } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/lib/store/cart";

// Barra fissa solo su telefono. Nascosta dove c'e gia una barra d'acquisto
// (scheda prodotto, carrello, checkout) e nell'admin.
const HIDDEN = ["/products/", "/cart", "/checkout", "/admin", "/auth"];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const cart = useCartStore();
  const [count, setCount] = useState(0);
  const { data: session } = useSession();
  const [menu, setMenu] = useState(false);
  useEffect(() => setMenu(false), [pathname]);

  useEffect(() => {
    setCount(cart.getItemCount());
  }, [cart]);

  if (HIDDEN.some((h) => pathname.startsWith(h))) return null;

  const items = [
    { href: "/", label: "Home", Icon: Home, active: pathname === "/" },
    { href: "/shop", label: "Maglie", Icon: Shirt, active: pathname.startsWith("/shop") && !pathname.startsWith("/shop/retro") },
    { href: "/archivio", label: "Retro", Icon: History, active: pathname.startsWith("/archivio") || pathname.startsWith("/shop/retro") },
    { href: "/cart", label: "Carrello", Icon: ShoppingBag, active: false, badge: count },
    { href: session ? "#account" : "/auth/signin", label: session ? "Account" : "Accedi", Icon: User, active: pathname.startsWith("/account") || pathname.startsWith("/profile") },
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
            {href === "#account" ? (
              <button type="button" onClick={() => setMenu((m) => !m)} aria-expanded={menu} className={`relative flex h-[58px] w-full flex-col items-center justify-center gap-0.5 font-[family-name:var(--font-display)] text-[13px] italic uppercase tracking-[0.03em] active:bg-white/5 ${active || menu ? "text-[var(--lime)]" : "text-white/75"}`}>
                <User className="h-[22px] w-[22px]" strokeWidth={active || menu ? 2.5 : 2} />
                {label}
              </button>
            ) : (
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
            )}
          </li>
        ))}
      </ul>
      {menu && session && (
        <div className="absolute inset-x-0 bottom-full border-t-2 border-[var(--line)] bg-[var(--wall)] p-4 shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.8)]" role="dialog" aria-label="Il tuo account">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[18px] font-bold text-white">{session.user?.name || "Il tuo account"}</p>
              <p className="truncate text-[14px] text-[var(--text-3)]">{session.user?.email}</p>
            </div>
            <button type="button" onClick={() => setMenu(false)} aria-label="Chiudi" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--wall-2)] text-white"><X className="h-5 w-5" /></button>
          </div>
          <ul className="grid gap-2">
            <li><Link href="/account/orders" className="flex h-12 items-center rounded-2xl bg-[var(--wall-2)] px-4 text-[17px] font-semibold text-white">I miei ordini</Link></li>
            <li><Link href="/profile" className="flex h-12 items-center rounded-2xl bg-[var(--wall-2)] px-4 text-[17px] font-semibold text-white">Profilo</Link></li>
            {(session.user as any)?.role === "admin" && <li><Link href="/admin" className="flex h-12 items-center rounded-2xl bg-[var(--lime)] px-4 text-[17px] font-bold text-[#0a0a0a]">Pannello admin</Link></li>}
            <li><button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="flex h-12 w-full items-center gap-2 rounded-2xl bg-[#3a1515] px-4 text-[17px] font-semibold text-[#ff8a8a]"><LogOut className="h-5 w-5" /> Esci</button></li>
          </ul>
        </div>
      )}
    </nav>
  );
}
