"use client";

import { useState, useEffect, useRef } from "react";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useCartStore } from "@/lib/store/cart";
import ProductGrid from "@/app/_components/ProductGrid";
import { Suspense } from "react";
import { Product } from "@/lib/types/product";
import Link from "next/link";
import Image from "next/image";

// ── Club identity palette ─────────────────────────────────────
interface ClubIdentity {
  accent: string;
  dim: string;
  label: string;
  motto: string;
  logoSlug: string;
}

const CLUB_IDENTITY: Record<string, ClubIdentity> = {
  inter:      { accent: "#0068A8", dim: "rgba(0,104,168,0.18)",  label: "F.C. Internazionale", motto: "Fratelli nell'azzurro e nel nero", logoSlug: "inter" },
  milan:      { accent: "#FB090B", dim: "rgba(251,9,11,0.18)",   label: "A.C. Milan",           motto: "La Casa del Diavolo Rossonero",  logoSlug: "milan" },
  juventus:   { accent: "#E8E8E8", dim: "rgba(220,220,220,0.12)",label: "Juventus F.C.",         motto: "Fino alla fine",                 logoSlug: "juventus" },
  napoli:     { accent: "#12A0D7", dim: "rgba(18,160,215,0.18)", label: "S.S.C. Napoli",        motto: "Il Cielo di Napoli nel cuore",   logoSlug: "napoli" },
  roma:       { accent: "#C5282D", dim: "rgba(197,40,45,0.18)",  label: "A.S. Roma",            motto: "La Lupa dell'Eterna Città",      logoSlug: "roma" },
  lazio:      { accent: "#87CEEB", dim: "rgba(135,206,235,0.15)",label: "S.S. Lazio",           motto: "Biancoceleste per sempre",       logoSlug: "lazio" },
  atalanta:   { accent: "#1C3B7A", dim: "rgba(28,59,122,0.22)",  label: "Atalanta B.C.",        motto: "La Dea di Bergamo",              logoSlug: "atalanta" },
  fiorentina: { accent: "#7B2D8B", dim: "rgba(123,45,139,0.18)", label: "ACF Fiorentina",       motto: "Viola per sempre, viola per fede",logoSlug: "fiorentina" },
  como:       { accent: "#0054A4", dim: "rgba(0,84,164,0.18)",   label: "Como 1907",            motto: "Sul lago, con il cuore",         logoSlug: "como" },
  torino:     { accent: "#8B0000", dim: "rgba(139,0,0,0.18)",    label: "Torino F.C.",          motto: "Il Grande Torino vive",          logoSlug: "torino" },
  bologna:    { accent: "#B22222", dim: "rgba(178,34,34,0.18)",  label: "Bologna F.C. 1909",    motto: "Rossoblu di cuore",              logoSlug: "bologna" },
};

const DEFAULT_IDENTITY: ClubIdentity = {
  accent: "#c8f000", dim: "rgba(200,240,0,0.12)", label: "Serie A", motto: "Il meglio del calcio italiano", logoSlug: "",
};

// ── Category filter logic ────────────────────────────────────
type Category = "tutte" | "attuali" | "retro" | "tute" | "combo";

const CATEGORY_LABELS: Record<Category, string> = {
  tutte:   "Tutte",
  attuali: "Maglie Attuali",
  retro:   "Retro",
  tute:    "Tute & Felpe",
  combo:   "Combo & Kit",
};

function classifyProduct(p: Product): Category[] {
  const name = (p.name ?? "").toLowerCase();
  const cat  = (p.category ?? "").toLowerCase();
  const cats: Category[] = ["tutte"];

  // Retro
  if (cat.includes("retro") || /\b(199[0-9]|200[0-9]|201[0-9])\b/.test(name)) {
    cats.push("retro");
  }
  // Tute & Felpe
  if (/tuta|tute|felpa|giacca|tracksuit|hoodie|sweat/.test(name)) {
    cats.push("tute");
  }
  // Combo & Kit
  if (/combo|kit|pack|set\b|bundle/.test(name)) {
    cats.push("combo");
  }
  // Attuali: current-season jerseys (not retro, not accessories)
  if (
    !cats.includes("retro") &&
    !cats.includes("tute") &&
    !cats.includes("combo") &&
    (cat.includes("2025") || cat.includes("2026") || cat.includes("2027") || cat.includes("world cup"))
  ) {
    cats.push("attuali");
  }
  // If none of the sub-categories matched (just "tutte"), also show in attuali
  if (cats.length === 1) cats.push("attuali");

  return cats;
}

// ── Grain texture SVG ────────────────────────────────────────
const GrainSVG = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.045 }}>
    <filter id="grain-sac">
      <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#grain-sac)" />
  </svg>
);

// ── Component ────────────────────────────────────────────────
interface SerieAClientProps {
  products: Product[];
  teamSlug?: string;
}

export default function SerieAClient({ products, teamSlug }: SerieAClientProps) {
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Category>("tutte");

  useEffect(() => { setMounted(true); }, []);

  const slug = teamSlug?.toLowerCase() ?? "";
  const identity = CLUB_IDENTITY[slug] ?? DEFAULT_IDENTITY;

  const teamDisplayName = identity.label || (
    slug.length > 0
      ? slug.charAt(0).toUpperCase() + slug.slice(1)
      : "Serie A"
  );

  // Count products per category
  const categoryCounts = (["tutte", "attuali", "retro", "tute", "combo"] as Category[]).reduce<Record<Category, number>>(
    (acc, cat) => {
      acc[cat] = cat === "tutte"
        ? products.length
        : products.filter((p) => classifyProduct(p).includes(cat)).length;
      return acc;
    },
    { tutte: 0, attuali: 0, retro: 0, tute: 0, combo: 0 }
  );

  // Filtered products for current tab
  const visibleProducts = activeTab === "tutte"
    ? products
    : products.filter((p) => classifyProduct(p).includes(activeTab));

  const logoPath = identity.logoSlug ? `/team-logos/${identity.logoSlug}.png` : null;
  const [logoError, setLogoError] = useState(false);

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh" }}>

      {/* ── Heritage Hero ─────────────────────────────────── */}
      <div
        className="relative overflow-hidden select-none"
        style={{ minHeight: "280px", paddingBottom: "0" }}
      >
        {/* Background layers */}
        <div className="absolute inset-0" style={{ background: "#0d0d0d" }} />
        {/* Accent glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 70% 60% at 80% 50%, ${identity.dim}, transparent 70%)`,
          }}
        />
        {/* Horizontal rule at top */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: identity.accent, opacity: 0.9 }}
        />
        <GrainSVG />

        {/* Logo watermark */}
        {logoPath && !logoError && (
          <div
            className="absolute right-0 top-0 bottom-0 flex items-center pointer-events-none"
            style={{ width: "42%", opacity: 0.06, paddingRight: "5%" }}
          >
            <Image
              src={logoPath}
              alt=""
              fill
              className="object-contain"
              sizes="42vw"
              onError={() => setLogoError(true)}
            />
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 px-5 sm:px-8 lg:px-12 pt-10 pb-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-7" style={{ fontSize: "10px", letterSpacing: "2px", color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono, monospace)", textTransform: "uppercase" }}>
            <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-white/60 transition-colors">Shop</Link>
            <span>/</span>
            <Link href="/shop/serieA" className="hover:text-white/60 transition-colors">Serie A</Link>
            {teamSlug && (
              <>
                <span>/</span>
                <span style={{ color: identity.accent }}>{teamDisplayName}</span>
              </>
            )}
          </nav>

          {/* Badge */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="h-[2px] w-8 rounded-full"
              style={{ background: identity.accent }}
            />
            <span
              className="text-[9px] uppercase font-bold tracking-[3px]"
              style={{ fontFamily: "var(--font-mono, monospace)", color: identity.accent }}
            >
              // Collezione
            </span>
          </div>

          {/* Team name */}
          <h1
            className="font-black uppercase leading-none"
            style={{
              fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
              fontSize: "clamp(2.8rem, 9vw, 5.5rem)",
              letterSpacing: "-1px",
              color: "#ffffff",
              textShadow: `0 0 60px ${identity.dim}`,
              maxWidth: "680px",
            }}
          >
            {teamDisplayName}
          </h1>

          {/* Motto */}
          {identity.motto && (
            <p
              className="mt-3"
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "10px",
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.22)",
              }}
            >
              {identity.motto}
            </p>
          )}

          {/* Product count */}
          <div className="flex items-center gap-3 mt-6">
            <span
              className="px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest"
              style={{
                background: `${identity.accent}22`,
                border: `1px solid ${identity.accent}44`,
                color: identity.accent,
                fontFamily: "var(--font-mono, monospace)",
              }}
            >
              {products.length} {products.length === 1 ? "prodotto" : "prodotti"}
            </span>
          </div>
        </div>

        {/* Bottom fade into page */}
        <div
          className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #0a0a0a)" }}
        />
      </div>

      {/* ── Category Tabs — always visible ───────────────── */}
      <div
        className="sticky z-20"
        style={{ top: "112px", background: "#0d0d0d", borderTop: `1px solid rgba(255,255,255,0.06)`, borderBottom: `1px solid rgba(255,255,255,0.06)` }}
      >
        <div
          className="overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className="flex items-stretch px-4 sm:px-8 gap-1 py-2"
            style={{ minWidth: "max-content" }}
          >
            {(["tutte", "attuali", "retro", "tute", "combo"] as Category[]).map((cat) => {
              const count = categoryCounts[cat];
              const isActive = activeTab === cat;
              const isEmpty = count === 0 && cat !== "tutte";

              // Colori specifici per categoria
              const catColor: Record<Category, string> = {
                tutte:   identity.accent,
                attuali: identity.accent,
                retro:   "#f5a623",   // arancio vintage
                tute:    "#7ed6df",   // azzurro
                combo:   "#c8f000",   // lime
              };
              const color = catColor[cat];

              return (
                <button
                  key={cat}
                  onClick={() => { if (!isEmpty) setActiveTab(cat); }}
                  className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[1.5px] transition-all duration-200 whitespace-nowrap flex-shrink-0"
                  style={{
                    fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
                    cursor: isEmpty ? "not-allowed" : "pointer",
                    border: "none",
                    outline: "none",
                    // Active: filled pill
                    background: isActive
                      ? `${color}18`
                      : isEmpty
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(255,255,255,0.05)",
                    color: isActive
                      ? color
                      : isEmpty
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(255,255,255,0.5)",
                    boxShadow: isActive ? `inset 0 0 0 1.5px ${color}55` : `inset 0 0 0 1px rgba(255,255,255,0.08)`,
                    opacity: isEmpty ? 0.5 : 1,
                  }}
                >
                  {/* Active indicator dot */}
                  {isActive && (
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: color }}
                    />
                  )}
                  {CATEGORY_LABELS[cat]}
                  <span
                    className="text-[9px] font-black px-1.5 py-0.5 rounded-md flex-shrink-0"
                    style={{
                      background: isActive ? `${color}25` : "rgba(255,255,255,0.07)",
                      color: isActive ? color : "rgba(255,255,255,0.3)",
                      fontFamily: "var(--font-mono, monospace)",
                      letterSpacing: "0px",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>
      </div>

      {/* ── Product Grid ──────────────────────────────────── */}
      <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
        {visibleProducts.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-24 gap-4"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            <span
              className="text-5xl font-black uppercase"
              style={{ fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)", color: identity.accent, opacity: 0.4 }}
            >
              —
            </span>
            <p className="text-[11px] uppercase tracking-[3px]" style={{ fontFamily: "var(--font-mono, monospace)" }}>
              Nessun prodotto in questa categoria
            </p>
          </div>
        ) : (
          <Suspense fallback={
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl aspect-[3/4]" style={{ background: "rgba(255,255,255,0.04)" }} />
              ))}
            </div>
          }>
            <ProductGrid
              products={visibleProducts}
              onWishlistToggle={(product) => {
                const pid = product.id.toString();
                if (isInWishlist(pid)) removeFromWishlist(pid);
                else addToWishlist({ id: pid, name: product.name, price: product.price, image: product.image, team: product.team ?? "" });
              }}
              onAddToCart={(product) => {
                addToCart({ id: product.id.toString(), name: product.name, price: product.price, image: product.image });
              }}
              isInWishlist={isInWishlist}
            />
          </Suspense>
        )}
      </div>

      {/* ── Footer accent bar ─────────────────────────────── */}
      <div
        className="mt-4"
        style={{ height: "1px", background: `linear-gradient(to right, transparent, ${identity.accent}33, transparent)` }}
      />
    </div>
  );
}
