"use client";

import { Suspense, useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  { label: "26/27", href: "#stagione-2627" },
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

const HERO_FADE_MS = 350;
const HERO_ROTATE_MS = 6000;

function ShopHero({ featuredProducts: products }: { featuredProducts: Product[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible]           = useState(true);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef     = useRef(0);
  const lenRef       = useRef(products.length);
  lenRef.current     = products.length;

  const goTo = (idx: number) => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    setVisible(false);
    fadeTimerRef.current = setTimeout(() => {
      indexRef.current = idx;
      setCurrentIndex(idx);
      setVisible(true);
    }, HERO_FADE_MS);
  };

  useEffect(() => {
    if (lenRef.current <= 1) return;
    const id = setInterval(() => {
      const next = (indexRef.current + 1) % lenRef.current;
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      setVisible(false);
      fadeTimerRef.current = setTimeout(() => {
        indexRef.current = next;
        setCurrentIndex(next);
        setVisible(true);
      }, HERO_FADE_MS);
    }, HERO_ROTATE_MS);
    return () => {
      clearInterval(id);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []); // intentionally empty — uses refs

  const current = products[currentIndex] ?? null;

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
              { num: "3.200+", label: "Maglie",      icon: <Trophy size={14} /> },
              { num: "50+",    label: "Squadre",     icon: <Globe size={14} /> },
              { num: "24h",    label: "Spedizione",  icon: <Zap size={14} /> },
            ].map(({ num, label, icon }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(200,240,0,0.08)", color: "#c8f000" }}>
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
              style={{ background: "#c8f000", color: "#0a0a0a", fontFamily: "var(--font-display, sans-serif)", letterSpacing: "2px", boxShadow: "0 8px 32px rgba(200,240,0,0.25)" }}
            >
              Esplora Ora
            </a>
            <a
              href="#bestseller"
              className="px-7 py-3.5 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:border-white/30"
              style={{ background: "transparent", color: "rgba(255,255,255,0.65)", border: "1.5px solid rgba(255,255,255,0.12)", fontFamily: "var(--font-display, sans-serif)", letterSpacing: "2px" }}
            >
              Bestseller
            </a>
          </div>
        </div>

        {/* Right: Rotating featured product card */}
        {current ? (
          <div className="flex-shrink-0 w-full max-w-[300px] lg:max-w-[340px]">
            {/* Card fades on product change */}
            <div style={{ opacity: visible ? 1 : 0, transition: `opacity ${HERO_FADE_MS}ms cubic-bezier(0.4,0,0.2,1)` }}>
              <Link
                href={`/products/${current.id}`}
                className="group block relative rounded-3xl overflow-hidden"
                style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
                  <Image
                    src={current.image}
                    alt={current.name}
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
                    {current.team}
                  </p>
                  <p className="font-black text-sm text-white leading-tight mb-3" style={{ fontFamily: "var(--font-display, sans-serif)" }}>
                    {current.name}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xl text-white" style={{ fontFamily: "var(--font-display, sans-serif)" }}>
                      €{current.price.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest transition-colors group-hover:text-[#c8f000]" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-mono, monospace)" }}>
                      Vedi →
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Dot indicators */}
            {products.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-4">
                {products.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Maglia ${i + 1}`}
                    onClick={() => goTo(i)}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width:  i === currentIndex ? "20px" : "6px",
                      height: "6px",
                      background: i === currentIndex ? "#c8f000" : "rgba(200,240,0,0.25)",
                      border: "none",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
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
// ─────────────────────────────────────────────────────────────
// Generic product carousel (auto-scroll + drag, reused in both sections)
// ─────────────────────────────────────────────────────────────

const CAROUSEL_DURATION_S = 42;

function ProductCarousel({ products, badge }: { products: Product[]; badge?: string }) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef    = useRef<number>(0);
  const posRef    = useRef(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollAtDragStart = useRef(0);
  const lastTs    = useRef(0);
  const isPaused  = useRef(false);
  const dragMoved = useRef(0);

  const doubled = [...products, ...products];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => { el.scrollLeft = 0; posRef.current = 0; });

    function tick(ts: number) {
      const el = scrollRef.current;
      if (!el) { rafRef.current = requestAnimationFrame(tick); return; }
      if (!isDragging.current && !isPaused.current) {
        if (lastTs.current === 0) lastTs.current = ts;
        const dt = Math.min(ts - lastTs.current, 64);
        lastTs.current = ts;
        const halfWidth = el.scrollWidth / 2;
        if (halfWidth === 0) { rafRef.current = requestAnimationFrame(tick); return; }
        posRef.current += (halfWidth / CAROUSEL_DURATION_S) * (dt / 1000);
        if (posRef.current >= halfWidth) posRef.current -= halfWidth;
        el.scrollLeft = posRef.current;
      } else { lastTs.current = ts; }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    const onMove = (e: PointerEvent) => {
      if (!isDragging.current || !scrollRef.current) return;
      const delta = dragStartX.current - e.clientX;
      dragMoved.current = Math.abs(delta);
      const half = scrollRef.current.scrollWidth / 2;
      let np = scrollAtDragStart.current + delta;
      if (np < 0) np += half;
      if (np >= half * 2) np -= half;
      scrollRef.current.scrollLeft = np;
      posRef.current = np;
    };
    const onUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      if (scrollRef.current) scrollRef.current.style.cursor = "grab";
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup",   onUp);
    document.addEventListener("pointercancel", onUp);
    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup",   onUp);
      document.removeEventListener("pointercancel", onUp);
    };
  }, []);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (dragMoved.current >= 8) return;
    const card = (e.target as HTMLElement).closest("[data-href]") as HTMLElement | null;
    if (card?.dataset?.href) router.push(card.dataset.href);
  }

  return (
    <div
      ref={scrollRef}
      className="overflow-x-scroll"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none", cursor: "grab", userSelect: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      onMouseEnter={() => { isPaused.current = true;  lastTs.current = 0; }}
      onMouseLeave={() => { isPaused.current = false; }}
      onPointerDown={(e) => {
        isDragging.current = true;
        dragMoved.current  = 0;
        dragStartX.current = e.clientX;
        scrollAtDragStart.current = scrollRef.current?.scrollLeft ?? 0;
        e.currentTarget.style.cursor = "grabbing";
      }}
      onClick={handleClick}
    >
      <div className="flex py-3" style={{ width: "max-content" }}>
        {doubled.map((p, i) => (
          <div
            key={`${p.id}-${i}`}
            data-href={`/products/${p.id}`}
            className="carousel-card group flex-shrink-0 mx-2 rounded-2xl overflow-hidden"
            style={{ width: "190px", background: "#111", border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer" }}
            draggable={false}
          >
            <div className="relative overflow-hidden" style={{ aspectRatio: "3/4", pointerEvents: "none" }}>
              <Image src={p.image} alt={p.name} fill className="object-cover" style={{ transition: "transform 500ms cubic-bezier(0.23,1,0.32,1)", pointerEvents: "none" }} sizes="190px" draggable={false} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)", pointerEvents: "none" }} />
              {badge && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest" style={{ background: "rgba(10,10,10,0.9)", color: "#c8f000", fontFamily: "var(--font-mono, monospace)", border: "1px solid rgba(200,240,0,0.22)", pointerEvents: "none" }}>
                  {badge}
                </div>
              )}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center" style={{ pointerEvents: "none" }}>
                <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest opacity-0 translate-y-1" style={{ background: "#c8f000", color: "#0a0a0a", fontFamily: "var(--font-mono, monospace)", transition: "opacity 250ms, transform 250ms" }}>Vedi →</span>
              </div>
            </div>
            <div className="p-2.5" style={{ pointerEvents: "none" }}>
              <p className="font-black text-xs text-white leading-tight truncate" style={{ fontFamily: "var(--font-display, sans-serif)" }}>
                {p.name.replace(/^Maglia\s+/i, "")}
              </p>
              <div className="flex items-center justify-between mt-1">
                <p className="font-black text-sm" style={{ fontFamily: "var(--font-display, sans-serif)", color: "#c8f000" }}>€{p.price.toFixed(2)}</p>
                <div className="flex items-center gap-px">{[1,2,3,4,5].map((s) => <Star key={s} size={7} fill="#c8f000" stroke="none" />)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`div::-webkit-scrollbar{display:none}.carousel-card:hover img{transform:scale(1.06)}.carousel-card:hover span{opacity:1!important;transform:translateY(0)!important}`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Bestseller section — carousel
// ─────────────────────────────────────────────────────────────

function BestsellerSection({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section id="bestseller" className="py-14 md:py-16 relative overflow-hidden" style={{ background: "#0a0a0a" }}>
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-12 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, #0a0a0a, transparent)" }} />
      <div className="absolute inset-y-0 right-0 w-12 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, #0a0a0a, transparent)" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 relative z-0">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-4 h-[1.5px] rounded-full inline-block" style={{ background: "#c8f000" }} />
              <span className="text-[9px] uppercase tracking-[3px] font-bold" style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.6)" }}>
                // Scelti da Goal Mania
              </span>
            </div>
            <h2 className="font-black uppercase text-white" style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", letterSpacing: "-0.5px" }}>
              I Più Venduti
            </h2>
          </div>
          <Link href="#nuovi-arrivi" className="text-xs font-bold uppercase tracking-widest transition-colors hover:text-white flex items-center gap-1.5" style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.35)" }}>
            Vedi tutto <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      <ProductCarousel products={products} badge="🏆 Top" />

      <p className="text-center mt-3 text-[9px] uppercase tracking-[2px] relative z-20" style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.15)" }}>
        ← trascina per scorrere • clicca per vedere la maglia →
      </p>
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

// (ProductCarousel defined above — reused here)

function NuoviArrivi({ products }: { products: Product[] }) {
  const [activeSort, setActiveSort] = useState<SortOption>("newest");

  const sorted = useMemo(() => {
    switch (activeSort) {
      case "price_asc":  return [...products].sort((a, b) => a.price - b.price);
      case "price_desc": return [...products].sort((a, b) => b.price - a.price);
      default: return products;
    }
  }, [products, activeSort]);

  return (
    <section
      id="nuovi-arrivi"
      className="py-14 md:py-16 relative overflow-hidden"
      style={{ background: "#080808", borderTop: "0.5px solid rgba(255,255,255,0.05)" }}
    >
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-12 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, #080808, transparent)" }} />
      <div className="absolute inset-y-0 right-0 w-12 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, #080808, transparent)" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-0">
        {/* Header + sort */}
        <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-4 h-[1.5px] rounded-full inline-block" style={{ background: "#c8f000" }} />
              <span className="text-[9px] uppercase tracking-[3px] font-bold" style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.6)" }}>
                // Le Migliori Maglie
              </span>
            </div>
            <h2
              className="font-black uppercase text-white"
              style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", letterSpacing: "-0.5px" }}
            >
              Selezione Top
            </h2>
          </div>
          <SortBar total={sorted.length} shown={sorted.length} activeSort={activeSort} onSortChange={setActiveSort} />
        </div>
      </div>

      {/* Full-width carousel (intentionally overflows the container) */}
      {sorted.length > 0 ? (
        <ProductCarousel products={sorted} />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center py-20 rounded-2xl" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-white/40 text-sm">Torna presto, nuovi arrivi ogni settimana!</p>
          </div>
        </div>
      )}

      <p className="text-center mt-3 text-[9px] uppercase tracking-[2px] relative z-20"
        style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.15)" }}>
        ← trascina per scorrere • clicca per vedere la maglia →
      </p>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Stagione 2026/27 section
// ─────────────────────────────────────────────────────────────

function Section2627({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section
      id="stagione-2627"
      className="py-14 md:py-16 relative overflow-hidden"
      style={{ background: "#0a0a0a", borderTop: "0.5px solid rgba(255,255,255,0.05)" }}
    >
      {/* Edge fades */}
      <div className="absolute inset-y-0 left-0 w-12 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, #0a0a0a, transparent)" }} />
      <div className="absolute inset-y-0 right-0 w-12 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, #0a0a0a, transparent)" }} />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 relative z-0">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-4 h-[1.5px] rounded-full inline-block" style={{ background: "#c8f000" }} />
              <span className="text-[9px] uppercase tracking-[3px] font-bold" style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.6)" }}>
                // Stagione in corso
              </span>
            </div>
            <h2
              className="font-black uppercase text-white"
              style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", letterSpacing: "-0.5px" }}
            >
              Maglie 2026/27
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {/* NEW badge */}
            <span
              className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
              style={{ background: "rgba(200,240,0,0.1)", color: "#c8f000", border: "1px solid rgba(200,240,0,0.2)", fontFamily: "var(--font-mono, monospace)" }}
            >
              ✦ Nuova Stagione
            </span>
            <Link
              href="/shop/2026/27"
              className="text-xs font-bold uppercase tracking-widest transition-colors hover:text-white flex items-center gap-1.5"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.35)" }}
            >
              Vedi tutto <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      <ProductCarousel products={products} badge="✦ 26/27" />

      <p className="text-center mt-3 text-[9px] uppercase tracking-[2px] relative z-20" style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.15)" }}>
        ← trascina per scorrere • clicca per vedere la maglia →
      </p>
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
  products2627 = [],
}: {
  latestProducts: Product[];
  bestSellingProducts: Product[];
  featuredProducts: Product[];
  mysteryBoxProducts: Product[];
  videoProducts?: Product[];
  worldCupTeams?: any[];
  products2627?: Product[];
}) {
  // Use feature-flagged products for hero; fall back to latest if none
  const heroProducts = (featuredProducts.length > 0 ? featuredProducts : latestProducts).slice(0, 8);
  // Bestseller carousel: hardcoded bestsellers first, then fill with latestProducts (deduplicated)
  const bsIds = new Set(bestSellingProducts.map((p) => p.id));
  const bestsellers = [
    ...bestSellingProducts,
    ...latestProducts.filter((p) => !bsIds.has(p.id)),
  ].slice(0, 20);

  return (
    <div style={{ background: "#0a0a0a" }}>
      {/* Search */}
      <ShopSearchBar />

      {/* Sticky league nav */}
      <LeagueNav />

      {/* Hero */}
      <ShopHero featuredProducts={heroProducts} />

      {/* Trust strip */}
      <TrustStrip />

      {/* Bestsellers */}
      <BestsellerSection products={bestsellers} />

      {/* Nuovi Arrivi */}
      <NuoviArrivi products={latestProducts} />

      {/* Stagione 2026/27 */}
      <Section2627 products={products2627} />

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
