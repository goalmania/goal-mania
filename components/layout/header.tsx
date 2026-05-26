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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Zap,
  Star,
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

// ─────────────────────────────────────────────
// MEGA MENU DATA
// ─────────────────────────────────────────────
const SHOP_MEGA = {
  columns: [
    {
      title: "Serie A",
      href: "/shop/serieA",
      items: [
        { name: "Inter",    href: "/shop/serieA/inter" },
        { name: "Milan",    href: "/shop/serieA/milan" },
        { name: "Juventus", href: "/shop/serieA/juventus" },
        { name: "Napoli",   href: "/shop/serieA/napoli" },
        { name: "Roma",     href: "/shop/serieA/roma" },
        { name: "Vedi tutti →", href: "/shop/serieA" },
      ],
    },
    {
      title: "Premier League",
      href: "/shop/premier-league",
      items: [
        { name: "Liverpool",   href: "/shop/premier-league/liverpool" },
        { name: "Arsenal",     href: "/shop/premier-league/arsenal" },
        { name: "Man City",    href: "/shop/premier-league/manchester-city" },
        { name: "Chelsea",     href: "/shop/premier-league/chelsea" },
        { name: "Man United",  href: "/shop/premier-league/manchester-united" },
        { name: "Vedi tutti →", href: "/shop/premier-league" },
      ],
    },
    {
      title: "Resto del Mondo",
      href: "/shop/rest-of-world",
      items: [
        { name: "Real Madrid", href: "/shop/rest-of-world" },
        { name: "Barcelona",   href: "/shop/rest-of-world" },
        { name: "Bayern",      href: "/shop/rest-of-world" },
        { name: "PSG",         href: "/shop/rest-of-world" },
        { name: "Dortmund",    href: "/shop/rest-of-world" },
        { name: "Vedi tutti →", href: "/shop/rest-of-world" },
      ],
    },
    {
      title: "Mondiali 2026",
      href: "/shop/worldcup",
      items: [
        { name: "Brasile",    href: "/shop/worldcup/brazil" },
        { name: "Argentina",  href: "/shop/worldcup/argentina" },
        { name: "Francia",    href: "/shop/worldcup/france" },
        { name: "Italia",     href: "/shop/worldcup/italy" },
        { name: "Portogallo", href: "/shop/worldcup/portugal" },
        { name: "Vedi tutti →", href: "/shop/worldcup" },
      ],
    },
  ],
  featured: {
    label: "⚡ Nuovi Arrivi",
    title: "Maglie 2026/27",
    subtitle: "Le ultime uscite della stagione",
    href: "/shop",
    badge: "NEW",
  },
};

const NEWS_MEGA = {
  latest: [
    { name: "Tutte le Notizie", href: "/news" },
    { name: "Calciomercato", href: "/news?category=calciomercato" },
    { name: "Serie A", href: "/news?category=serie-a" },
    { name: "Champions League", href: "/news?category=champions-league" },
    { name: "Premier League", href: "/news?category=premier-league" },
  ],
  categories: [
    { name: "Mondiali 2026", href: "/news?category=mondiali" },
    { name: "Interviste", href: "/news?category=interviste" },
    { name: "Analisi Tattica", href: "/news?category=analisi" },
    { name: "Youth Football", href: "/news?category=youth" },
  ],
  featured: {
    label: "// In Evidenza",
    title: "Ultime Notizie dal Campo",
    subtitle: "Aggiornamenti in tempo reale",
    href: "/news",
  },
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
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const megaTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const openMega = (key: string) => {
    if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current);
    setActiveMega(key);
  };

  const closeMega = () => {
    megaTimeoutRef.current = setTimeout(() => setActiveMega(null), 120);
  };

  const keepMega = () => {
    if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current);
  };

  if (!mounted) return null;

  const ANNOUNCEMENT_HEIGHT = 40; // px — must match AnnouncementBar height

  return (
    <>
      <header
        className="fixed left-0 right-0 z-50 transition-all duration-300"
        style={{
          top: 0,
          background: scrolled ? "rgba(10,10,10,0.98)" : "rgba(10,10,10,0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: "0.5px solid rgba(200,240,0,0.12)",
          boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.4)" : "none",
        }}
      >
        {/* Main nav row */}
        <nav
          className="container mx-auto flex items-center justify-between px-4 max-w-7xl transition-all duration-300"
          style={{ height: scrolled ? "60px" : "72px" }}
        >
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
                  src="/images/recentUpdate/gm-shield-v2.png"
                  alt="Goal Mania"
                  width={44}
                  height={44}
                  className="w-10 h-10 object-contain transition-all duration-500 group-hover:drop-shadow-[0_0_12px_rgba(200,240,0,0.6)]"
                  style={{ filter: "brightness(1.05)" }}
                />
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
                  style={{ fontFamily: "var(--font-mono, monospace)", color: "#666" }}
                >
                  // football universe
                </span>
              </div>
            </Link>
          </div>

          {/* ── Center: Desktop Navigation ── */}
          <div className="hidden md:flex items-center gap-0.5">
            {/* SHOP with mega */}
            <div
              className="relative"
              onMouseEnter={() => openMega("shop")}
              onMouseLeave={closeMega}
            >
              <Link
                href="/shop"
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-[0.78rem] font-semibold uppercase tracking-wider transition-all duration-200 ${
                  pathname.startsWith("/shop") || activeMega === "shop"
                    ? "text-[#c8f000]"
                    : "text-white/70 hover:text-white"
                }`}
                style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "1.5px" }}
              >
                Shop
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${activeMega === "shop" ? "rotate-180" : ""}`}
                />
              </Link>
            </div>

            {/* ULTIME NOTIZIE with mega */}
            <div
              className="relative"
              onMouseEnter={() => openMega("news")}
              onMouseLeave={closeMega}
            >
              <Link
                href="/news"
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-[0.78rem] font-semibold uppercase tracking-wider transition-all duration-200 ${
                  pathname.startsWith("/news") || activeMega === "news"
                    ? "text-[#c8f000]"
                    : "text-white/70 hover:text-white"
                }`}
                style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "1.5px" }}
              >
                Notizie
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${activeMega === "news" ? "rotate-180" : ""}`}
                />
              </Link>
            </div>

            {/* Static links */}
            {[
              { name: "World Cup 2026", href: "/shop/worldcup", isSpecial: true },
              { name: "2026/27", href: "/shop/2026/27", isNew: true },
              { name: "Maglie Retro", href: "/shop/retro", isRetro: true },
            ].map((item: any) => (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-[0.78rem] font-semibold uppercase tracking-wider transition-all duration-200 group ${
                  pathname === item.href
                    ? "text-[#c8f000]"
                    : item.isSpecial
                    ? "text-[#c8f000] hover:text-[#c8f000]/80"
                    : "text-white/70 hover:text-white"
                }`}
                style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "1.5px" }}
              >
                {item.isSpecial && <Trophy size={11} className="animate-pulse" />}
                {item.name}
                {item.isNew && (
                  <span className="text-[7px] font-black uppercase px-1 py-0.5 rounded ml-0.5 leading-none"
                    style={{ background: "#c8f000", color: "#000" }}>NEW</span>
                )}
                {item.isRetro && (
                  <span className="text-[7px] font-black uppercase px-1 py-0.5 rounded ml-0.5 leading-none"
                    style={{ background: "rgba(200,240,0,0.15)", color: "#c8f000", border: "1px solid rgba(200,240,0,0.3)" }}>RETRO</span>
                )}
                {pathname === item.href && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#c8f000] rounded-full" />
                )}
                {pathname !== item.href && !item.isSpecial && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#c8f000]/40 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                )}
              </Link>
            ))}
          </div>

          {/* ── Right: Icons + Auth ── */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center justify-center w-9 h-9 rounded-xl text-white/70 hover:text-[#c8f000] hover:bg-[#c8f000]/8 transition-all duration-200"
              aria-label="Cerca"
            >
              <Search className="h-4 w-4" />
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
                <Heart className="h-4 w-4" />
                {session && wishlistItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 bg-[#c8f000] text-[#0a0a0a] text-[9px] font-black rounded-full">
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
                <ShoppingBag className="h-4 w-4" />
                {session && cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 bg-[#c8f000] text-[#0a0a0a] text-[9px] font-black rounded-full">
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
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-[#0a0a0a] font-black text-[0.75rem] uppercase tracking-wider transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                  style={{
                    background: "#c8f000",
                    fontFamily: "var(--font-display, sans-serif)",
                    letterSpacing: "1.5px",
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

        {/* ── MEGA MENUS ── */}
        {/* Shop Mega */}
        {activeMega === "shop" && (
          <div
            className="absolute left-0 right-0 shadow-2xl border-t transition-all duration-200"
            style={{
              top: "100%",
              background: "rgba(10,10,10,0.98)",
              backdropFilter: "blur(24px)",
              borderColor: "rgba(200,240,0,0.1)",
              borderBottom: "0.5px solid rgba(200,240,0,0.12)",
            }}
            onMouseEnter={keepMega}
            onMouseLeave={closeMega}
          >
            <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-5 gap-8">
              {/* 4 league columns */}
              {SHOP_MEGA.columns.map((col) => (
                <div key={col.title}>
                  <Link
                    href={col.href}
                    className="text-[10px] uppercase tracking-[3px] mb-3 block hover:text-[#c8f000] transition-colors"
                    style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.7)" }}
                  >
                    // {col.title}
                  </Link>
                  <ul className="space-y-2">
                    {col.items.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="text-sm text-white/60 hover:text-white transition-colors block py-0.5"
                          style={{ fontFamily: "var(--font-body, sans-serif)" }}
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {/* Featured promo */}
              <div
                className="rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(200,240,0,0.1) 0%, rgba(200,240,0,0.04) 100%)",
                  border: "1.5px solid rgba(200,240,0,0.2)",
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: "linear-gradient(90deg, transparent, #c8f000, transparent)" }}
                />
                <div>
                  <div
                    className="text-[9px] uppercase tracking-[3px] mb-2"
                    style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.6)" }}
                  >
                    {SHOP_MEGA.featured.label}
                  </div>
                  <h3
                    className="font-black uppercase text-white text-lg leading-tight mb-1"
                    style={{ fontFamily: "var(--font-display, sans-serif)" }}
                  >
                    {SHOP_MEGA.featured.title}
                  </h3>
                  <p
                    className="text-xs text-white/40 mb-4"
                    style={{ fontFamily: "var(--font-body, sans-serif)" }}
                  >
                    {SHOP_MEGA.featured.subtitle}
                  </p>
                </div>
                <Link
                  href={SHOP_MEGA.featured.href}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-black text-xs uppercase tracking-wider transition-all hover:opacity-90"
                  style={{ background: "#c8f000", color: "#0a0a0a", fontFamily: "var(--font-display, sans-serif)" }}
                >
                  <Zap size={12} />
                  Scopri Ora
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* News Mega */}
        {activeMega === "news" && (
          <div
            className="absolute left-0 right-0 shadow-2xl border-t transition-all duration-200"
            style={{
              top: "100%",
              background: "rgba(10,10,10,0.98)",
              backdropFilter: "blur(24px)",
              borderColor: "rgba(200,240,0,0.1)",
              borderBottom: "0.5px solid rgba(200,240,0,0.12)",
            }}
            onMouseEnter={keepMega}
            onMouseLeave={closeMega}
          >
            <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-3 gap-10">
              {/* Latest news */}
              <div>
                <div
                  className="text-[10px] uppercase tracking-[3px] mb-4"
                  style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.7)" }}
                >
                  // Ultime Notizie
                </div>
                <ul className="space-y-2.5">
                  {NEWS_MEGA.latest.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-2 group"
                        style={{ fontFamily: "var(--font-body, sans-serif)" }}
                      >
                        <span
                          className="w-1 h-1 rounded-full flex-shrink-0 group-hover:bg-[#c8f000] transition-colors"
                          style={{ background: "rgba(255,255,255,0.2)" }}
                        />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Categories */}
              <div>
                <div
                  className="text-[10px] uppercase tracking-[3px] mb-4"
                  style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.7)" }}
                >
                  // Categorie
                </div>
                <ul className="space-y-2.5">
                  {NEWS_MEGA.categories.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-2 group"
                        style={{ fontFamily: "var(--font-body, sans-serif)" }}
                      >
                        <span
                          className="w-1 h-1 rounded-full flex-shrink-0 group-hover:bg-[#c8f000] transition-colors"
                          style={{ background: "rgba(255,255,255,0.2)" }}
                        />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Featured promo */}
              <div
                className="rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(200,240,0,0.08) 0%, rgba(200,240,0,0.02) 100%)",
                  border: "1.5px solid rgba(200,240,0,0.18)",
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: "linear-gradient(90deg, transparent, #c8f000, transparent)" }}
                />
                <div>
                  <div
                    className="text-[9px] uppercase tracking-[3px] mb-2"
                    style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.6)" }}
                  >
                    {NEWS_MEGA.featured.label}
                  </div>
                  <h3
                    className="font-black uppercase text-white text-lg leading-tight mb-1"
                    style={{ fontFamily: "var(--font-display, sans-serif)" }}
                  >
                    {NEWS_MEGA.featured.title}
                  </h3>
                  <p
                    className="text-xs text-white/40 mb-4"
                    style={{ fontFamily: "var(--font-body, sans-serif)" }}
                  >
                    {NEWS_MEGA.featured.subtitle}
                  </p>
                  {/* Fake rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={10} fill="#c8f000" color="#c8f000" />
                    ))}
                    <span
                      className="text-[9px] ml-1.5"
                      style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.6)" }}
                    >
                      Aggiornate ogni ora
                    </span>
                  </div>
                </div>
                <Link
                  href={NEWS_MEGA.featured.href}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-black text-xs uppercase tracking-wider transition-all hover:opacity-90"
                  style={{ background: "#c8f000", color: "#0a0a0a", fontFamily: "var(--font-display, sans-serif)" }}
                >
                  Leggi le Notizie →
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Search Overlay ── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[200] flex flex-col"
          style={{ background: "rgba(10,10,10,0.97)", backdropFilter: "blur(24px)" }}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
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
              className="text-white/10 text-[80px] font-black uppercase leading-none mb-8 select-none"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl font-black text-[#0a0a0a] text-sm uppercase tracking-wide transition-all hover:opacity-90"
                  style={{ background: "#c8f000", fontFamily: "var(--font-display, sans-serif)", letterSpacing: "2px" }}
                >
                  Cerca
                </button>
              </div>
            </form>

            {/* Search suggestions */}
            <div className="flex flex-wrap items-center gap-2 mt-6 justify-center">
              {["Inter", "Real Madrid", "Champions 2025", "Mondiali 2026", "Retro"].map((s) => (
                <button
                  key={s}
                  onClick={() => { setSearchQuery(s); }}
                  className="px-4 py-1.5 rounded-full text-xs uppercase tracking-wider transition-all hover:text-[#c8f000] hover:border-[#c8f000]/40"
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    color: "rgba(255,255,255,0.4)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
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
                  src="/images/recentUpdate/gm-shield-v2.png"
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
                  className="px-4 py-2.5 rounded-xl text-[#0a0a0a] font-bold transition-all hover:opacity-90"
                  style={{ background: "#c8f000" }}
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
              {[
                { name: "Shop", href: "/shop" },
                { name: "News", href: "/news" },
                { name: "World Cup 2026", href: "/shop/worldcup", isSpecial: true },
                { name: "Serie A", href: "/international/serieA" },
                { name: "Premier League", href: "/international/premierLeague" },
                { name: "La Liga", href: "/international/laliga" },
                { name: "Bundesliga", href: "/international/bundesliga" },
                { name: "About", href: "/about" },
                { name: "Contatti", href: "/contact" },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpenMenu(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                    pathname === item.href
                      ? "text-[#c8f000] bg-[#c8f000]/8"
                      : item.isSpecial
                      ? "text-[#c8f000]"
                      : "text-white/70 hover:text-white hover:bg-white/3"
                  }`}
                  style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "2px" }}
                >
                  {item.isSpecial && <Trophy size={14} />}
                  {item.name}
                </Link>
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
                    className="flex-1 text-center py-2.5 rounded-xl text-[#0a0a0a] text-sm font-bold uppercase tracking-wider transition-all hover:opacity-90"
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
