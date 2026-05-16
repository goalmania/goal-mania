"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronDownIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useLanguage } from "@/lib/utils/language";
import { useI18n } from "@/lib/hooks/useI18n";
import { usePathname, useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Globe,
  Heart,
  MenuIcon,
  ShoppingBag,
  X,
  Search,
  Trophy,
  ChevronDown,
} from "lucide-react";

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  role?: string;
}

const getUserImage = (user: any): string => {
  return user?.image || "/images/default-avatar.png";
};

export function Header() {
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const cart = useCartStore();
  const wishlist = useWishlistStore();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [wishlistItemCount, setWishlistItemCount] = useState(0);
  const { language, toggleLanguage } = useLanguage();
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && session) {
      setCartItemCount(cart.getItemCount());
      setWishlistItemCount(wishlist.items.length);
    } else {
      setCartItemCount(0);
      setWishlistItemCount(0);
    }
  }, [cart, wishlist, session]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
  }, [searchOpen]);

  const languageNames: Record<string, string> = { en: "EN", it: "IT" };

  const staticSubItems = [
    { name: t("nav.laliga"), href: "/international/laliga" },
    { name: t("nav.premierLeague"), href: "/international/premierLeague" },
    { name: t("nav.bundesliga"), href: "/international/bundesliga" },
    { name: t("nav.ligue1"), href: "/international/ligue1" },
    { name: t("nav.serieA"), href: "/international/serieA" },
    { name: t("nav.leaguesOverview"), href: "/leagues-overview" },
    { name: t("nav.otherLeagues"), href: "/international/other" },
  ];

  const navigation = [
    { name: t("nav.home"), href: "/" },
    {
      name: "World Cup 2026",
      href: "/shop/worldcup",
      isSpecial: true,
    },
    { name: t("nav.articles"), href: "/news" },
    { name: t("nav.shop"), href: "/shop" },
    {
      name: t("nav.category"),
      href: "/category",
      hasDropdown: true,
      subItems: staticSubItems,
    },
    { name: t("nav.about"), href: "/about" },
    { name: t("nav.contact"), href: "/contact" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  if (!mounted) return null;

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? "rgba(10, 10, 10, 0.95)"
            : "rgba(10, 10, 10, 0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "0.5px solid rgba(200, 240, 0, 0.12)",
          height: "72px",
          boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.4)" : "none",
        }}
      >
        <nav className="container mx-auto flex items-center justify-between px-4 h-full max-w-7xl">
          {/* ── Left: Hamburger + Logo ── */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-white/10 text-white hover:border-[#c8f000]/40 hover:text-[#c8f000] transition-all duration-200"
              onClick={() => setOpenMenu(true)}
              aria-label="Menu"
            >
              <MenuIcon className="h-5 w-5" />
            </button>

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <Image
                  src="/images/recentUpdate/desktop-logo.png"
                  alt="Goal Mania"
                  width={44}
                  height={44}
                  className="w-11 h-11 object-contain transition-all duration-500 group-hover:drop-shadow-[0_0_12px_rgba(200,240,0,0.6)]"
                  style={{ filter: "brightness(1.05)" }}
                />
                {/* Pulsing ring on hover */}
                <span className="absolute inset-0 rounded-full border border-[#c8f000]/0 group-hover:border-[#c8f000]/30 transition-all duration-500 scale-110" />
              </div>
              <div className="hidden sm:flex flex-col leading-none">
                <span
                  className="text-white font-black uppercase tracking-wider text-[15px]"
                  style={{ fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)", letterSpacing: "3px" }}
                >
                  GOAL<span style={{ color: "#c8f000" }}>MANIA</span>
                </span>
                <span
                  className="text-[9px] tracking-[3px] uppercase"
                  style={{ fontFamily: "var(--font-mono, monospace)", color: "#888" }}
                >
                  // football universe
                </span>
              </div>
            </Link>
          </div>

          {/* ── Center: Desktop Navigation ── */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) =>
              item.hasDropdown ? (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold tracking-wide uppercase transition-all duration-200 ${
                        pathname.startsWith(item.href)
                          ? "text-[#c8f000]"
                          : "text-white/70 hover:text-white"
                      }`}
                      style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "1.5px", fontSize: "0.78rem" }}
                    >
                      {item.name}
                      <ChevronDown className="w-3 h-3 opacity-60" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="rounded-xl border shadow-2xl p-1"
                    style={{ background: "#111", borderColor: "rgba(200,240,0,0.15)", minWidth: "180px" }}
                  >
                    {item.subItems?.map((sub) => (
                      <DropdownMenuItem
                        key={sub.href}
                        asChild
                        className="rounded-lg focus:bg-[#c8f000]/10 focus:text-[#c8f000]"
                      >
                        <Link
                          href={sub.href}
                          className="text-white/80 hover:text-[#c8f000] transition-colors px-3 py-2 text-sm"
                          style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "1px", textTransform: "uppercase", fontSize: "0.75rem" }}
                        >
                          {sub.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold uppercase transition-all duration-200 group ${
                    pathname === item.href
                      ? "text-[#c8f000]"
                      : item.isSpecial
                      ? "text-[#c8f000] hover:text-white"
                      : "text-white/70 hover:text-white"
                  }`}
                  style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "1.5px", fontSize: "0.78rem" }}
                >
                  {item.isSpecial && (
                    <Trophy
                      size={12}
                      className="animate-[pulse_2s_ease-in-out_infinite]"
                    />
                  )}
                  {item.name}
                  {/* Active underline */}
                  {pathname === item.href && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#c8f000] rounded-full" />
                  )}
                  {/* Hover underline */}
                  {pathname !== item.href && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#c8f000]/40 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                  )}
                </Link>
              )
            )}
          </div>

          {/* ── Right: Icons + Auth ── */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center justify-center w-9 h-9 rounded-xl text-white/70 hover:text-[#c8f000] hover:bg-[#c8f000]/8 transition-all duration-200"
              aria-label="Cerca"
            >
              <Search className="h-4.5 w-4.5" />
            </button>

            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-[#c8f000]/30 text-white/70 hover:text-[#c8f000] transition-all duration-200 text-xs font-bold"
              style={{ fontFamily: "var(--font-mono, monospace)", letterSpacing: "1px" }}
            >
              <Globe className="w-3 h-3" />
              {languageNames[language] || language}
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" className="relative">
              <button
                className="flex items-center justify-center w-9 h-9 rounded-xl text-white/70 hover:text-[#c8f000] hover:bg-[#c8f000]/8 transition-all duration-200"
                aria-label="Wishlist"
              >
                <Heart className="h-4.5 w-4.5" />
                {session && wishlistItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 bg-[#c8f000] text-white text-[9px] font-black rounded-full">
                    {wishlistItemCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative">
              <button
                className="flex items-center justify-center w-9 h-9 rounded-xl text-white/70 hover:text-[#c8f000] hover:bg-[#c8f000]/8 transition-all duration-200"
                aria-label="Carrello"
              >
                <ShoppingBag className="h-4.5 w-4.5" />
                {session && cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 bg-[#c8f000] text-white text-[9px] font-black rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </Link>

            {/* User / Auth */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative h-8 w-8 rounded-full ring-2 ring-transparent hover:ring-[#c8f000]/40 transition-all duration-200">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getUserImage(session.user)} alt="Profile" />
                      <AvatarFallback className="bg-[#1a1a1a] text-[#c8f000]">
                        <UserIcon className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 rounded-xl border"
                  style={{ background: "#111", borderColor: "rgba(200,240,0,0.15)" }}
                >
                  <DropdownMenuLabel className="text-white">
                    <p className="text-sm font-semibold">{session.user.name}</p>
                    <p className="text-xs text-white/40">{session.user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator style={{ background: "rgba(255,255,255,0.06)" }} />
                  <DropdownMenuItem asChild className="focus:bg-[#c8f000]/10 focus:text-[#c8f000] rounded-lg">
                    <Link href="/profile" className="text-white/80 hover:text-[#c8f000]">{t("profile")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-[#c8f000]/10 focus:text-[#c8f000] rounded-lg">
                    <Link href="/account/orders" className="text-white/80 hover:text-[#c8f000]">{t("auth.myOrders")}</Link>
                  </DropdownMenuItem>
                  {session.user.role === "admin" && (
                    <DropdownMenuItem asChild className="focus:bg-[#c8f000]/10 focus:text-[#c8f000] rounded-lg">
                      <Link href="/admin" className="text-white/80 hover:text-[#c8f000]">{t("adminPanel")}</Link>
                    </DropdownMenuItem>
                  )}
                  {session.user.role === "journalist" && (
                    <DropdownMenuItem asChild className="focus:bg-[#c8f000]/10 focus:text-[#c8f000] rounded-lg">
                      <Link href="/admin/articles" className="text-white/80 hover:text-[#c8f000]">{t("authorPanel")}</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator style={{ background: "rgba(255,255,255,0.06)" }} />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="text-red-400 focus:bg-red-500/10 focus:text-red-400 rounded-lg cursor-pointer"
                  >
                    <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
                    {t("signOut")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center">
                <Link
                  href="/auth/signin"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-white font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                  style={{
                    background: "#c8f000",
                    fontFamily: "var(--font-display, sans-serif)",
                    letterSpacing: "1.5px",
                    fontSize: "0.75rem",
                    boxShadow: "0 4px 16px rgba(200,240,0,0.25)",
                  }}
                >
                  Login
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* ── Search Overlay ── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[200] flex flex-col"
          style={{ background: "rgba(10,10,10,0.97)", backdropFilter: "blur(24px)" }}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/06">
            <div
              className="text-[#c8f000] text-xs uppercase tracking-[3px]"
              style={{ fontFamily: "var(--font-mono, monospace)" }}
            >
              // Cerca
            </div>
            <button
              onClick={() => setSearchOpen(false)}
              className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-16">
            <h2
              className="text-white/20 text-[80px] font-black uppercase leading-none mb-8 select-none"
              style={{ fontFamily: "var(--font-display, sans-serif)" }}
            >
              SEARCH
            </h2>
            <form onSubmit={handleSearch} className="w-full max-w-2xl">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#c8f000]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cerca prodotti, squadre, articoli..."
                  className="w-full pl-14 pr-32 py-5 rounded-2xl text-white text-lg outline-none transition-all"
                  style={{
                    background: "#1a1a1a",
                    border: "1.5px solid rgba(200,240,0,0.3)",
                    fontFamily: "var(--font-body, sans-serif)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#c8f000")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(200,240,0,0.3)")}
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl font-bold text-white text-sm uppercase tracking-wide transition-all hover:opacity-90"
                  style={{ background: "#c8f000", fontFamily: "var(--font-display, sans-serif)", letterSpacing: "2px" }}
                >
                  Cerca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Mobile Menu ── */}
      {openMenu && (
        <div className="fixed inset-0 z-[150] md:hidden">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            onClick={() => setOpenMenu(false)}
          />
          <div
            className="absolute top-0 left-0 w-80 max-w-[85vw] h-full flex flex-col"
            style={{ background: "#0a0a0a", borderRight: "0.5px solid rgba(200,240,0,0.15)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "rgba(200,240,0,0.1)" }}>
              <Link href="/" onClick={() => setOpenMenu(false)} className="flex items-center gap-2.5">
                <Image
                  src="/images/recentUpdate/desktop-logo.png"
                  alt="Goal Mania"
                  width={38}
                  height={38}
                  className="w-10 h-10 object-contain"
                />
                <span
                  className="text-white font-black uppercase text-base"
                  style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "3px" }}
                >
                  GOAL<span style={{ color: "#c8f000" }}>MANIA</span>
                </span>
              </Link>
              <button
                onClick={() => setOpenMenu(false)}
                className="w-8 h-8 rounded-xl border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <form
                onSubmit={(e) => { handleSearch(e); setOpenMenu(false); }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cerca..."
                  className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm outline-none"
                  style={{ background: "#1a1a1a", border: "1px solid rgba(200,240,0,0.15)", fontFamily: "var(--font-body, sans-serif)" }}
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl text-white font-bold transition-all hover:opacity-90"
                  style={{ background: "#c8f000" }}
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
              {navigation.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setOpenMenu(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                      pathname === item.href
                        ? "text-[#c8f000] bg-[#c8f000]/8"
                        : item.isSpecial
                        ? "text-[#c8f000]"
                        : "text-white/70 hover:text-white hover:bg-[#0a0a0a]/5"
                    }`}
                    style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "2px" }}
                  >
                    {item.isSpecial && <Trophy size={14} />}
                    {item.name}
                  </Link>
                  {item.hasDropdown && (
                    <div className="ml-4 mt-1 flex flex-col gap-0.5">
                      {item.subItems?.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          onClick={() => setOpenMenu(false)}
                          className={`px-4 py-2 rounded-lg text-xs uppercase tracking-widest transition-colors ${
                            pathname === sub.href
                              ? "text-[#c8f000]"
                              : "text-white/40 hover:text-white/80"
                          }`}
                          style={{ fontFamily: "var(--font-mono, monospace)" }}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Bottom: Auth + Language */}
            <div className="p-4 border-t flex flex-col gap-3" style={{ borderColor: "rgba(200,240,0,0.1)" }}>
              <button
                onClick={toggleLanguage}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border text-white/60 text-xs font-bold uppercase tracking-wider transition-all hover:border-[#c8f000]/30 hover:text-[#c8f000]"
                style={{ borderColor: "rgba(255,255,255,0.1)", fontFamily: "var(--font-mono, monospace)" }}
              >
                <Globe className="w-3.5 h-3.5" />
                {language === "it" ? "Italiano" : "English"}
              </button>
              {!session && (
                <div className="flex gap-2">
                  <Link
                    href="/auth/signin"
                    onClick={() => setOpenMenu(false)}
                    className="flex-1 text-center py-2.5 rounded-xl border border-white/10 text-white text-sm font-bold uppercase tracking-wider transition-all hover:border-[#c8f000]/30"
                    style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "2px" }}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setOpenMenu(false)}
                    className="flex-1 text-center py-2.5 rounded-xl text-white text-sm font-bold uppercase tracking-wider transition-all hover:opacity-90"
                    style={{ background: "#c8f000", fontFamily: "var(--font-display, sans-serif)", letterSpacing: "2px" }}
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
