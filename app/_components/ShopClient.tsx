"use client";

import { Suspense, useState, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Truck,
  RotateCcw,
  ShieldCheck,
  BadgeCheck,
  Star,
  TrendingUp,
  Clock,
  ArrowUp,
  ArrowDown,
  Percent,
  ChevronDown,
  X,
  Zap,
  Trophy,
  Globe,
} from "lucide-react";
import ProductGridWrapper from "@/app/_components/ProductGridWrapper";
import FAQ from "@/app/_components/FAQ";
import ShopSearchBar from "./ShopSearchBar";
import SerieATeamsClient from "@/app/_components/SerieATeamsClient";
import PremierLeagueClient from "@/app/_components/PremierLeagueClient";
import VideoComp from "@/components/home/VideoComp";
import Testimonies from "@/components/shop/testimonies";
import FeaturesCardStats from "@/components/shop/FeaturesCardStats";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  team: string;
  availablePatches?: string[];
  videos?: string[];
}

// ─────────────────────────────────────────────────────────────
// Sticky league nav
// ─────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Tutto", href: "#top" },
  { label: "Nuovi Arrivi", href: "#nuovi-arrivi" },
  { label: "Bestseller", href: "#bestseller" },
  { label: "Serie A", href: "#serie-a-section" },
  { label: "Premier League", href: "#premier-section" },
  { label: "Nazionali", href: "#nazionali-section" },
  { label: "Retro", href: "/shop/retro" },
];

function LeagueNav() {
  return (
    <div
      className="sticky top-0 z-30 border-b"
      style={{ background: "rgba(10,10,10,0.92)", backdropFilter: "blur(16px)", borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div
          className="flex gap-1 overflow-x-auto py-3"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all hover:text-white hover:bg-white/5"
              style={{
                fontFamily: "var(--font-mono, monospace)",
                color: "rgba(255,255,255,0.4)",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </a>
          ))}
          <a
            href="/shop/worldcup"
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all"
            style={{
              fontFamily: "var(--font-mono, monospace)",
              background: "rgba(200,240,0,0.1)",
              color: "#c8f000",
              border: "1px solid rgba(200,240,0,0.2)",
              whiteSpace: "nowrap",
            }}
          >
            🏆 Mondiali 2026
          </a>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Shop Hero
// ─────────────────────────────────────────────────────────────

function ShopHero({ featuredProduct }: { featuredProduct: Product | null }) {
  return (
    <section
      id="top"
      className="relative overflow-hidden"
      style={{ background: "#0a0a0a" }}
    >
      {/* Grid dot background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(200,240,0,0.035) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Lime glow */}
      <div
        className="absolute top-0 right-1/4 w-[600px] h-[400px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(200,240,0,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        {/* Left: Copy */}
        <div className="flex-1 min-w-0">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 mb-7 px-3 py-1.5 rounded-full" style={{ background: "rgba(200,240,0,0.07)", border: "1px solid rgba(200,240,0,0.15)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#c8f000] animate-pulse" />
            <span className="text-[10px] uppercase tracking-[3px] font-bold" style={{ fontFamily: "var(--font-mono, monospace)", color: "#c8f000" }}>
              // Stagione 2025/26 Live
            </span>
          </div>

          <h1
            className="font-black uppercase text-white mb-6 leading-[0.9]"
            style={{
              fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
              fontSize: "clamp(3rem, 8vw, 6rem)",
              letterSpacing: "-1px",
            }}
          >
            Le Migliori<br />
            <span style={{ color: "#c8f000" }}>Maglie</span><br />
            da Calcio
          </h1>

          <p className="text-sm mb-10 max-w-md" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-body, sans-serif)", lineHeight: "1.75" }}>
            Serie A, Premier League, Champions League, Nazionali —<br />
            tutta la passione del calcio in un unico posto.
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-8 mb-10 flex-wrap">
            {[
              { num: "3.200+", label: "Maglie", icon: <Trophy size={14} /> },
              { num: "50+",    label: "Squadre", icon: <Globe size={14} /> },
              { num: "24h",    label: "Spedizione", icon: <Zap size={14} /> },
            ].map(({ num, label, icon }) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(200,240,0,0.08)", color: "#c8f000" }}
                >
                  {icon}
                </div>
                <div>
                  <p className="font-black text-lg text-white leading-none" style={{ fontFamily: "var(--font-display, sans-serif)" }}>{num}</p>
                  <p className="text-[10px] uppercase tracking-[2px] mt-0.5" style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.55)" }}>{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex gap-3 flex-wrap">
            <a
              href="#nuovi-arrivi"
              className="px-7 py-3.5 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:opacity-90 active:scale-[0.97]"
              style={{
                background: "#c8f000",
                color: "#0a0a0a",
                fontFamily: "var(--font-display, sans-serif)",
                letterSpacing: "2px",
                boxShadow: "0 8px 32px rgba(200,240,0,0.25)",
              }}
            >
              Esplora Ora
            </a>
            <a
              href="#bestseller"
              className="px-7 py-3.5 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:border-white/30"
              style={{
                background: "transparent",
                color: "rgba(255,255,255,0.65)",
                border: "1.5px solid rgba(255,255,255,0.12)",
                fontFamily: "var(--font-display, sans-serif)",
                letterSpacing: "2px",
              }}
            >
              Bestseller
            </a>
          </div>
        </div>

        {/* Right: Featured product card */}
        {featuredProduct ? (
          <div className="flex-shrink-0 w-full max-w-[300px] lg:max-w-[340px]">
            <Link
              href={`/products/${featuredProduct.id}`}
              className="group block relative rounded-3xl overflow-hidden"
              style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
                <Image
                  src={featuredProduct.image}
                  alt={featuredProduct.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 340px"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)" }} />
                <div
                  className="absolute top-4 left-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
                  style={{ background: "#c8f000", color: "#0a0a0a", fontFamily: "var(--font-mono, monospace)" }}
                >
                  ⭐ In Evidenza
                </div>
              </div>
              <div className="p-5">
                <p className="text-[9px] uppercase tracking-[2px] mb-1" style={{ color: "rgba(200,240,0,0.6)", fontFamily: "var(--font-mono, monospace)" }}>
                  {featuredProduct.team}
                </p>
                <p className="font-black text-sm text-white leading-tight mb-3" style={{ fontFamily: "var(--font-display, sans-serif)" }}>
                  {featuredProduct.name}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-black text-xl text-white" style={{ fontFamily: "var(--font-display, sans-serif)" }}>
                    €{featuredProduct.price.toFixed(2)}
                  </span>
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest transition-colors group-hover:text-[#c8f000]"
                    style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-mono, monospace)" }}
                  >
                    Vedi →
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ) : (
          /* Fallback decorative element when no featured product */
          <div
            className="hidden lg:flex flex-shrink-0 w-[340px] h-[440px] rounded-3xl items-center justify-center"
            style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span className="text-6xl opacity-20">⚽</span>
          </div>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Trust Strip
// ─────────────────────────────────────────────────────────────

const TRUST = [
  { icon: Truck,       label: "Spedizione Gratuita", sub: "Sopra €89" },
  { icon: RotateCcw,   label: "Reso Gratuito",        sub: "30 giorni" },
  { icon: ShieldCheck, label: "Pagamento Sicuro",      sub: "SSL 256-bit" },
  { icon: BadgeCheck,  label: "Qualità Garantita",     sub: "100% verificato" },
];

function TrustStrip() {
  return (
    <div
      className="border-y"
      style={{ borderColor: "rgba(255,255,255,0.05)", background: "#0d0d0d" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRUST.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(200,240,0,0.07)", border: "1px solid rgba(200,240,0,0.12)" }}
              >
                <Icon size={16} style={{ color: "#c8f000" }} />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-white leading-tight" style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "0.3px" }}>{label}</p>
                <p className="text-[10px] mt-0.5" style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.45)" }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Bestseller product card
// ─────────────────────────────────────────────────────────────

function BestsellerCard({ product, size = "md" }: { product: Product; size?: "lg" | "md" }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group relative block rounded-2xl overflow-hidden"
      style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: size === "lg" ? "3/4" : "4/5" }}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes={size === "lg" ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 55%)" }}
        />

        {/* Bestseller badge */}
        <div
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
          style={{ background: "rgba(10,10,10,0.85)", color: "#c8f000", fontFamily: "var(--font-mono, monospace)", border: "1px solid rgba(200,240,0,0.25)", backdropFilter: "blur(8px)" }}
        >
          🏆 Bestseller
        </div>

        {/* Hover CTA overlay */}
        <div
          className="absolute inset-x-4 bottom-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-center transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
          style={{ background: "#c8f000", color: "#0a0a0a", fontFamily: "var(--font-display, sans-serif)", letterSpacing: "2px" }}
        >
          Vedi Maglia →
        </div>
      </div>

      <div className="p-4">
        <p className="text-[9px] uppercase tracking-[2px] mb-1" style={{ color: "rgba(200,240,0,0.55)", fontFamily: "var(--font-mono, monospace)" }}>
          {product.team}
        </p>
        <p
          className="font-black leading-tight mb-2"
          style={{
            fontFamily: "var(--font-display, sans-serif)",
            fontSize: size === "lg" ? "1rem" : "0.8rem",
            color: "rgba(255,255,255,0.9)",
          }}
        >
          {product.name}
        </p>
        <div className="flex items-center gap-2">
          <span
            className="font-black"
            style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: size === "lg" ? "1.25rem" : "1rem", color: "#fff" }}
          >
            €{product.price.toFixed(2)}
          </span>
          {/* Stars */}
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} size={9} fill="#c8f000" stroke="none" />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────
// Bestseller section
// ─────────────────────────────────────────────────────────────

function BestsellerSection({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  const [main, ...rest] = products.slice(0, 5);

  return (
    <section id="bestseller" className="py-16 md:py-20" style={{ background: "#0a0a0a" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-4 h-[1.5px] rounded-full inline-block" style={{ background: "#c8f000" }} />
              <span className="text-[9px] uppercase tracking-[3px] font-bold" style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.6)" }}>
                // Scelti da Goal Mania
              </span>
            </div>
            <h2
              className="font-black uppercase text-white"
              style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: "-0.5px" }}
            >
              I Più Venduti
            </h2>
          </div>
          <Link
            href="#nuovi-arrivi"
            className="text-xs font-bold uppercase tracking-widest transition-colors hover:text-white flex items-center gap-1.5"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.35)" }}
          >
            Vedi tutto <ArrowRight size={12} />
          </Link>
        </div>

        {/* Asymmetric grid: 1 large left + up to 4 right */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Large featured card */}
          <div className="md:row-span-2">
            <div className="h-full">
              <BestsellerCard product={main} size="lg" />
            </div>
          </div>

          {/* Smaller cards */}
          {rest.map((p) => (
            <BestsellerCard key={p.id} product={p} size="md" />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Sort / filter bar
// ─────────────────────────────────────────────────────────────

type SortOption = "bestseller" | "newest" | "price_asc" | "price_desc" | "discount";

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: "bestseller", label: "Più Venduti",  icon: <TrendingUp size={11} /> },
  { value: "newest",     label: "Novità",        icon: <Clock size={11} /> },
  { value: "price_asc",  label: "Prezzo ↑",      icon: <ArrowUp size={11} /> },
  { value: "price_desc", label: "Prezzo ↓",      icon: <ArrowDown size={11} /> },
  { value: "discount",   label: "Scontati",      icon: <Percent size={11} /> },
];

function SortBar({
  total, shown, activeSort, onSortChange,
}: {
  total: number;
  shown: number;
  activeSort: SortOption;
  onSortChange: (s: SortOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = SORT_OPTIONS.find((s) => s.value === activeSort)!;

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
      <p className="text-[11px]" style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.35)" }}>
        Mostrando{" "}
        <span className="text-white font-black">{shown}</span>{" "}
        di{" "}
        <span className="text-white font-black">{total}</span>{" "}
        maglie
      </p>

      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all"
          style={{
            background: "#111",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.65)",
            fontFamily: "var(--font-mono, monospace)",
          }}
        >
          {current.icon}
          {current.label}
          <ChevronDown size={10} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div
            className="absolute right-0 top-full mt-2 z-20 rounded-xl overflow-hidden min-w-[160px]"
            style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }}
          >
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onSortChange(opt.value); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-bold text-left transition-all hover:bg-white/5"
                style={{
                  color: activeSort === opt.value ? "#c8f000" : "rgba(255,255,255,0.5)",
                  fontFamily: "var(--font-mono, monospace)",
                  background: activeSort === opt.value ? "rgba(200,240,0,0.06)" : "transparent",
                }}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Nuovi Arrivi section
// ─────────────────────────────────────────────────────────────

function NuoviArrivi({ products }: { products: Product[] }) {
  const [activeSort, setActiveSort] = useState<SortOption>("newest");
  const [visible, setVisible] = useState(12);

  const sorted = useMemo(() => {
    switch (activeSort) {
      case "price_asc":  return [...products].sort((a, b) => a.price - b.price);
      case "price_desc": return [...products].sort((a, b) => b.price - a.price);
      default: return products;
    }
  }, [products, activeSort]);

  const shownProducts = sorted.slice(0, visible);

  return (
    <section
      id="nuovi-arrivi"
      className="py-16 md:py-20"
      style={{ background: "#080808", borderTop: "0.5px solid rgba(255,255,255,0.05)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-4 h-[1.5px] rounded-full inline-block" style={{ background: "#c8f000" }} />
            <span className="text-[9px] uppercase tracking-[3px] font-bold" style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.6)" }}>
              // Nuovi Arrivi
            </span>
          </div>
          <h2
            className="font-black uppercase text-white"
            style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: "-0.5px" }}
          >
            Ultimi Prodotti
          </h2>
          <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-body, sans-serif)" }}>
            Le maglie più recenti, fresche di stagione.
          </p>
        </div>

        <SortBar
          total={sorted.length}
          shown={shownProducts.length}
          activeSort={activeSort}
          onSortChange={setActiveSort}
        />

        {sorted.length === 0 ? (
          <div
            className="text-center py-20 rounded-2xl"
            style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-black text-white mb-2" style={{ fontFamily: "var(--font-display, sans-serif)" }}>
              Nessun prodotto trovato
            </h3>
            <p className="text-white/40 text-sm">Torna presto, nuovi arrivi ogni settimana!</p>
          </div>
        ) : (
          <>
            <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-[#111]" />}>
              <ProductGridWrapper products={shownProducts} />
            </Suspense>

            {visible < sorted.length && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => setVisible((v) => v + 12)}
                  className="group flex items-center gap-3 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:border-[#c8f000]/40 hover:text-[#c8f000]"
                  style={{
                    background: "transparent",
                    color: "rgba(255,255,255,0.5)",
                    border: "1.5px solid rgba(255,255,255,0.1)",
                    fontFamily: "var(--font-display, sans-serif)",
                    letterSpacing: "2px",
                  }}
                >
                  Carica altri
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px]"
                    style={{ background: "rgba(200,240,0,0.1)", color: "#c8f000", fontFamily: "var(--font-mono, monospace)" }}
                  >
                    {sorted.length - visible}
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Nazionali section (local logos, same card style as homepage)
// ─────────────────────────────────────────────────────────────

const LN = (slug: string) => `/team-logos/${slug}.png`;

const NAZIONALI = [
  { name: "Italia",      slug: "italia",      logo: LN("italia"),      href: "/shop/worldcup/italy" },
  { name: "Francia",     slug: "francia",     logo: LN("francia"),     href: "/shop/worldcup/france" },
  { name: "Germania",    slug: "germania",    logo: LN("germania"),    href: "/shop/worldcup/germany" },
  { name: "Spagna",      slug: "spagna",      logo: LN("spagna"),      href: "/shop/worldcup/spain" },
  { name: "Brasile",     slug: "brasile",     logo: LN("brasile"),     href: "/shop/worldcup/brazil" },
  { name: "Argentina",   slug: "argentina",   logo: LN("argentina"),   href: "/shop/worldcup/argentina" },
  { name: "Portogallo",  slug: "portogallo",  logo: LN("portogallo"),  href: "/shop/worldcup/portugal" },
  { name: "Inghilterra", slug: "inghilterra", logo: LN("inghilterra"), href: "/shop/worldcup/england" },
  { name: "Olanda",      slug: "olanda",      logo: LN("olanda"),      href: "/shop/worldcup/netherlands" },
  { name: "Belgio",      slug: "belgio",      logo: LN("belgio"),      href: "/shop/worldcup/belgium" },
  { name: "Croazia",     slug: "croazia",     logo: LN("croazia"),     href: "/shop/worldcup/croatia" },
  { name: "Marocco",     slug: "marocco",     logo: LN("marocco"),     href: "/shop/worldcup/morocco" },
  { name: "USA",         slug: "usa",         logo: LN("usa"),         href: "/shop/worldcup/usa" },
  { name: "Messico",     slug: "messico",     logo: LN("messico"),     href: "/shop/worldcup/mexico" },
  { name: "Senegal",     slug: "senegal",     logo: LN("senegal"),     href: "/shop/worldcup/senegal" },
  { name: "Giappone",    slug: "giappone",    logo: LN("giappone"),    href: "/shop/worldcup/japan" },
];

function NazionaliLogoCard({ name, logo, href }: { name: string; logo: string; href: string }) {
  return (
    <Link
      href={href}
      className="naz-logo-card group flex flex-col items-center gap-2"
      style={{ width: "88px", flexShrink: 0 }}
    >
      <div
        className="w-full flex items-center justify-center rounded-2xl overflow-hidden"
        style={{
          height: "96px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          transition: "transform 200ms cubic-bezier(0.23,1,0.32,1), box-shadow 200ms, border-color 200ms",
        }}
      >
        <Image
          src={logo}
          alt={name}
          width={52}
          height={52}
          className="object-contain drop-shadow-lg"
          style={{ maxWidth: "52px", maxHeight: "52px" }}
          draggable={false}
        />
      </div>
      <span
        className="text-center leading-tight"
        style={{
          fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "1.2px",
          color: "rgba(255,255,255,0.5)",
          textTransform: "uppercase",
          transition: "color 200ms",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "88px",
        }}
      >
        {name}
      </span>
      <style jsx>{`
        @media (hover: hover) and (pointer: fine) {
          .naz-logo-card:hover > div:first-child {
            transform: translateY(-4px);
            box-shadow: 0 12px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(200,240,0,0.3);
            border-color: rgba(200,240,0,0.3) !important;
          }
          .naz-logo-card:hover span { color: rgba(200,240,0,0.9) !important; }
        }
        .naz-logo-card:active > div:first-child { transform: scale(0.97); }
      `}</style>
    </Link>
  );
}

function NazionaliSection() {
  return (
    <section className="pb-12 px-4 sm:px-6" style={{ background: "#0a0a0a" }}>
      <div className="max-w-7xl mx-auto">
        <div
          className="grid gap-x-4 gap-y-6"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))" }}
        >
          {NAZIONALI.map((n) => (
            <div key={n.slug} className="flex justify-center">
              <NazionaliLogoCard name={n.name} logo={n.logo} href={n.href} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// League Divider
// ─────────────────────────────────────────────────────────────

function LeagueDivider({ id, label, sublabel, href }: { id: string; label: string; sublabel: string; href: string }) {
  return (
    <div
      id={id}
      className="flex items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto pt-12 pb-4"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-[1.5px] rounded-full inline-block" style={{ background: "#c8f000" }} />
          <span className="text-[9px] uppercase tracking-[3px] font-bold" style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.6)" }}>
            // {sublabel}
          </span>
        </div>
        <h2
          className="font-black uppercase text-white"
          style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)", letterSpacing: "-0.3px" }}
        >
          {label}
        </h2>
      </div>
      <Link
        href={href}
        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition-colors hover:text-[#c8f000]"
        style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.3)" }}
      >
        Vedi tutto <ArrowRight size={12} />
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Social proof band
// ─────────────────────────────────────────────────────────────

function SocialProofBand() {
  const stats = [
    { value: "4.9/5", label: "Rating medio clienti" },
    { value: "1.200+", label: "Ordini completati" },
    { value: "98%", label: "Clienti soddisfatti" },
    { value: "50+", label: "Squadre disponibili" },
  ];

  return (
    <div
      className="py-10 border-y"
      style={{ background: "#0d0d0d", borderColor: "rgba(255,255,255,0.04)" }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <p
                className="font-black text-2xl text-white mb-1"
                style={{ fontFamily: "var(--font-display, sans-serif)", color: "#c8f000" }}
              >
                {value}
              </p>
              <p className="text-[10px] uppercase tracking-[2px]" style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.3)" }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────

export default function ShopClient({
  latestProducts = [],
  bestSellingProducts = [],
  featuredProducts = [],
  mysteryBoxProducts = [],
  videoProducts = [],
  worldCupTeams = [],
}: {
  latestProducts: Product[];
  bestSellingProducts: Product[];
  featuredProducts: Product[];
  mysteryBoxProducts: Product[];
  videoProducts?: Product[];
  worldCupTeams?: any[]; // kept for API compatibility, not used
}) {
  const featuredProduct = featuredProducts[0] ?? latestProducts[0] ?? null;
  const bestsellers = bestSellingProducts.length > 0 ? bestSellingProducts : latestProducts.slice(0, 5);

  return (
    <div style={{ background: "#0a0a0a" }}>
      {/* Search */}
      <ShopSearchBar />

      {/* Sticky league nav */}
      <LeagueNav />

      {/* Hero */}
      <ShopHero featuredProduct={featuredProduct} />

      {/* Trust strip */}
      <TrustStrip />

      {/* Bestsellers */}
      <BestsellerSection products={bestsellers} />

      {/* Nuovi Arrivi */}
      <NuoviArrivi products={latestProducts} />

      {/* Social proof numbers */}
      <SocialProofBand />

      {/* ── League sections ── */}
      <div style={{ background: "#0a0a0a" }}>
        <LeagueDivider id="serie-a-section" label="Serie A" sublabel="Campionato Italiano" href="/shop/serieA" />
        <SerieATeamsClient />
      </div>

      <div style={{ background: "#080808", borderTop: "0.5px solid rgba(255,255,255,0.04)" }}>
        <LeagueDivider id="premier-section" label="Premier League" sublabel="Campionato Inglese" href="/shop/premier-league" />
        <PremierLeagueClient />
      </div>

      <div style={{ background: "#0a0a0a", borderTop: "0.5px solid rgba(255,255,255,0.04)" }}>
        <LeagueDivider id="nazionali-section" label="Nazionali" sublabel="Mondiali 2026" href="/shop/worldcup" />
        <NazionaliSection />
      </div>

      {/* Video products */}
      {videoProducts && videoProducts.length > 0 && (
        <VideoComp products={videoProducts} />
      )}

      {/* Testimonials */}
      <div style={{ background: "#080808", borderTop: "0.5px solid rgba(255,255,255,0.04)" }}>
        <Testimonies />
      </div>

      {/* Stats */}
      <FeaturesCardStats />

      {/* FAQ */}
      <FAQ />
    </div>
  );
}
