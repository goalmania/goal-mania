"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Heart, Search, ShoppingBag, User as UserIcon, X, LogOut } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  role?: string;
}

const NAV = [
  { href: "/shop", label: "Maglie", match: (p: string) => p === "/shop" || (p.startsWith("/shop/") && !p.startsWith("/shop/retro") && !p.startsWith("/shop/worldcup") && !p.startsWith("/shop/2026")) },
  { href: "/shop/2026/27", label: "26/27", match: (p: string) => p.startsWith("/shop/2026") },
  { href: "/shop/retro", label: "Retro", match: (p: string) => p.startsWith("/shop/retro") },
  { href: "/shop/worldcup", label: "Mondiali", match: (p: string) => p.startsWith("/shop/worldcup") },
  { href: "/news", label: "Notizie", match: (p: string) => p.startsWith("/news") },
];

const QUICK = [
  { href: "/shop/serieA", label: "Serie A" },
  { href: "/shop/premier-league", label: "Premier League" },
  { href: "/shop/2026/27", label: "Stagione 26/27" },
  { href: "/shop/retro", label: "Retro" },
  { href: "/shop/worldcup", label: "Mondiali 2026" },
];

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [wishCount, setWishCount] = useState(0);
  const cart = useCartStore();
  const wishlist = useWishlistStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Il contatore vale per tutti: l'acquisto da ospite e il caso comune
  useEffect(() => {
    setCartCount(cart.getItemCount());
    setWishCount(wishlist.items.length);
  }, [cart, wishlist]);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    setSearchOpen(false);
  }, [pathname]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setQuery("");
  };

  const iconBtn =
    "relative flex h-11 w-11 items-center justify-center text-white transition-colors hover:text-[#c8f000] active:text-[#c8f000]";

  return (
    <>
      <header
        className="fixed inset-x-0 z-50 border-b border-white/10 bg-[#0a0a0a]"
        style={{ top: "var(--bar-h)", height: "var(--head-h)" }}
      >
        <nav className="mx-auto flex h-full max-w-[1280px] items-center gap-2 px-2 md:gap-6 md:px-8" aria-label="Principale">
          <Link href="/" className="flex h-11 items-center px-2" aria-label="Goal Mania, home">
            <Image
              src="/images/recentUpdate/goalmania-wordmark.png"
              alt="Goal Mania"
              width={392}
              height={201}
              priority
              className="h-9 w-auto object-contain md:h-10"
            />
          </Link>

          <ul className="hidden items-stretch md:flex">
            {NAV.map((n) => {
              const active = n.match(pathname);
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex h-[var(--head-h)] items-center px-4 text-[17px] font-extrabold uppercase tracking-[0.04em] transition-colors ${active ? "text-[#c8f000]" : "text-white hover:text-[#c8f000]"}`}
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {n.label}
                    {active && <span className="absolute inset-x-4 bottom-0 h-[3px] bg-[#c8f000]" />}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="ml-auto flex items-center">
            <button className={iconBtn} aria-label="Cerca" onClick={() => setSearchOpen(true)}>
              <Search className="h-[22px] w-[22px]" />
            </button>
            <Link href="/wishlist" className={`${iconBtn} hidden sm:flex`} aria-label="Preferiti">
              <Heart className="h-[22px] w-[22px]" />
              {wishCount > 0 && (
                <span className="absolute right-1 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center bg-[#c8f000] px-1 text-[11px] font-black text-[#0a0a0a]">{wishCount}</span>
              )}
            </Link>

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`${iconBtn} hidden md:flex`} aria-label="Account">
                    <UserIcon className="h-[22px] w-[22px]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-none border border-white/15 bg-[#121211] text-white">
                  <DropdownMenuLabel>
                    <p className="text-sm font-semibold">{session.user?.name}</p>
                    <p className="text-xs text-white/60">{session.user?.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild><Link href="/profile">Profilo</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/account/orders">I miei ordini</Link></DropdownMenuItem>
                  {(session.user as any)?.role === "admin" && (
                    <DropdownMenuItem asChild><Link href="/admin">Pannello admin</Link></DropdownMenuItem>
                  )}
                  {(session.user as any)?.role === "journalist" && (
                    <DropdownMenuItem asChild><Link href="/admin/articles">Pannello autore</Link></DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-[#ff6b6b]">
                    <LogOut className="mr-2 h-4 w-4" /> Esci
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/signin" className={`${iconBtn} hidden w-auto px-3 text-[15px] font-bold uppercase md:flex`} style={{ fontFamily: "var(--font-display)" }}>
                Accedi
              </Link>
            )}

            <Link
              href="/cart"
              aria-label={`Carrello, ${cartCount} articoli`}
              className="cut cut-sm relative ml-1 flex h-11 min-w-[44px] items-center justify-center gap-2 bg-[#c8f000] px-3 text-[#0a0a0a] transition-colors hover:bg-[#d8ff1a] active:bg-[#b5d800]"
            >
              <ShoppingBag className="h-[20px] w-[20px]" strokeWidth={2.4} />
              <span className="num text-[20px]" suppressHydrationWarning>{cartCount}</span>
            </Link>
          </div>
        </nav>
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-[80] bg-[#0a0a0a]/96 backdrop-blur-sm" role="dialog" aria-label="Cerca">
          <form onSubmit={submit} className="mx-auto mt-[calc(var(--bar-h)+8px)] flex max-w-[720px] items-center gap-2 px-3">
            <div className="flex h-14 flex-1 items-center gap-3 border-b-2 border-[#c8f000] px-1">
              <Search className="h-6 w-6 shrink-0 text-[#c8f000]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Squadra, giocatore, stagione"
                className="h-full w-full bg-transparent text-[20px] font-semibold text-white outline-none placeholder:text-white/50"
                enterKeyHint="search"
                autoComplete="off"
              />
            </div>
            <button type="button" onClick={() => setSearchOpen(false)} className="flex h-14 w-14 items-center justify-center text-white" aria-label="Chiudi ricerca">
              <X className="h-6 w-6" />
            </button>
          </form>
          <div className="mx-auto mt-6 max-w-[720px] px-4">
            <p className="mb-3 text-[14px] font-bold uppercase tracking-wider text-white/60" style={{ fontFamily: "var(--font-display)" }}>Vai direttamente a</p>
            <div className="flex flex-wrap gap-2">
              {QUICK.map((q) => (
                <Link key={q.href} href={q.href} className="cut cut-sm bg-white/10 px-4 py-3 text-[16px] font-bold text-white transition-colors hover:bg-[#c8f000] hover:text-[#0a0a0a]">
                  {q.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
