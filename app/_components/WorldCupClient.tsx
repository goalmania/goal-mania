"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import { getFlagUrl } from "@/lib/utils/flags";
import { Trophy, Globe, ChevronRight, Zap, ShieldCheck, RotateCcw, Truck } from "lucide-react";

// ─── WC 2026 kickoff: 11 giugno 2026 20:00 CET ───
const WC_START = new Date("2026-06-11T18:00:00Z");

// ─── Top nations with special card treatment ───
const FEATURED = [
  "Argentina", "Brazil", "France", "England",
  "Portugal", "Germany", "Spain", "Italy",
  "USA", "Mexico", "Morocco", "Japan",
];

interface Product {
  _id: string;
  title: string;
  basePrice: number;
  images?: string[];
  category?: string;
  nationalTeam?: string;
  country?: string;
  isWorldCup?: boolean;
  hasLongSleeve?: boolean;
  slug: string;
  [key: string]: any;
}

interface Props {
  products: Product[];
  groupedProducts: Record<string, Product[]>;
  sortedCountries: string[];
}

// ─── Flag pill background tints per nation ───
const NATION_COLORS: Record<string, string> = {
  Argentina: "rgba(117,170,219,0.12)",
  Brazil:    "rgba(0,156,60,0.12)",
  France:    "rgba(0,35,149,0.12)",
  England:   "rgba(200,240,0,0.08)",
  Portugal:  "rgba(200,0,0,0.12)",
  Germany:   "rgba(220,220,220,0.08)",
  Spain:     "rgba(170,40,40,0.12)",
  Italy:     "rgba(0,100,200,0.12)",
  USA:       "rgba(60,100,200,0.10)",
  Mexico:    "rgba(0,120,60,0.10)",
  Morocco:   "rgba(180,0,40,0.10)",
  Japan:     "rgba(188,0,45,0.10)",
};

function CountdownBox({ n, label }: { n: number; label: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl"
      style={{
        background: "rgba(255,215,0,0.05)",
        border: "1px solid rgba(255,215,0,0.18)",
        minWidth: 64,
        padding: "10px 14px",
      }}
    >
      <span
        className="font-black tabular-nums leading-none"
        style={{ fontSize: "clamp(1.5rem,5vw,2.5rem)", color: "#FFD700" }}
      >
        {String(n).padStart(2, "0")}
      </span>
      <span
        className="text-[8px] font-bold uppercase tracking-widest mt-1"
        style={{ color: "rgba(255,215,0,0.4)" }}
      >
        {label}
      </span>
    </div>
  );
}

export default function WorldCupClient({ products, groupedProducts, sortedCountries }: Props) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [mounted, setMounted] = useState(false);
  const [selectedNation, setSelectedNation] = useState<string | null>(null);
  const pillsRef = useRef<HTMLDivElement>(null);

  // ─── Countdown ───
  useEffect(() => {
    setMounted(true);
    const tick = () => {
      const diff = WC_START.getTime() - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        days:  Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        mins:  Math.floor((diff % 3_600_000) / 60_000),
        secs:  Math.floor((diff % 60_000) / 1_000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ─── Order: featured first, then rest alphabetically ───
  const ordered = [
    ...sortedCountries.filter(c => FEATURED.includes(c)),
    ...sortedCountries.filter(c => !FEATURED.includes(c) && c !== "Other"),
    ...sortedCountries.filter(c => c === "Other"),
  ];

  const filteredProducts = selectedNation
    ? (groupedProducts[selectedNation] ?? [])
    : products;

  return (
    <div className="min-h-screen bg-[#050505] font-munish overflow-x-hidden">

      {/* ═══════════════════════════════════════
          HERO — full-viewport WC cinematic
      ═══════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">

        {/* Grid lines */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,215,0,0.025) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(255,215,0,0.025) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

        {/* Glow top centre */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(200,240,0,0.07) 0%, transparent 65%)," +
              "radial-gradient(ellipse 50% 40% at 50% 100%, rgba(255,215,0,0.04) 0%, transparent 65%)",
          }}
        />

        {/* Host-country flags — blurred, decorative */}
        <div
          className="absolute top-1/2 left-0 right-0 -translate-y-1/2 z-0 flex justify-between pointer-events-none"
          style={{ opacity: 0.03 }}
        >
          {["us", "ca", "mx"].map((code) => (
            <img
              key={code}
              src={`https://flagcdn.com/w640/${code}.png`}
              alt={code}
              className="w-1/3 h-64 object-cover"
              style={{ filter: "blur(40px) saturate(0.5)" }}
            />
          ))}
        </div>

        {/* ── Trophy badge ── */}
        <div
          className="relative z-10 flex items-center gap-2 mb-8 px-5 py-2.5 rounded-full"
          style={{
            background: "rgba(255,215,0,0.07)",
            border: "1px solid rgba(255,215,0,0.22)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Trophy size={12} style={{ color: "#FFD700" }} />
          <span
            className="text-[10px] font-black uppercase tracking-[0.35em]"
            style={{ color: "#FFD700" }}
          >
            FIFA World Cup 2026™ · USA · Canada · Mexico
          </span>
        </div>

        {/* ── Main title ── */}
        <div className="relative z-10 mb-10">
          <p
            className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.5em] text-white/25 mb-4"
          >
            La Tua Nazione · Il Tuo Stile
          </p>
          <h1 className="leading-none uppercase italic font-black" style={{ letterSpacing: "-0.025em" }}>
            <span
              className="block text-white"
              style={{ fontSize: "clamp(4rem, 14vw, 10rem)", textShadow: "0 0 120px rgba(255,215,0,0.12)" }}
            >
              WORLD CUP
            </span>
            <span
              className="block"
              style={{
                fontSize: "clamp(4rem, 14vw, 10rem)",
                color: "transparent",
                WebkitTextStroke: "2px #FFD700",
                textShadow: "0 0 80px rgba(255,215,0,0.25)",
              }}
            >
              2026
            </span>
          </h1>
        </div>

        {/* ── Countdown ── */}
        {mounted && (
          <div className="relative z-10 flex gap-3 sm:gap-4 mb-10">
            <CountdownBox n={timeLeft.days}  label="Giorni" />
            <CountdownBox n={timeLeft.hours} label="Ore"    />
            <CountdownBox n={timeLeft.mins}  label="Min"    />
            <CountdownBox n={timeLeft.secs}  label="Sec"    />
          </div>
        )}

        {/* ── CTA ── */}
        <a
          href="#kits"
          className="relative z-10 inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-black uppercase text-[12px] tracking-widest transition-all active:scale-95"
          style={{
            background: "#c8f000",
            color: "#000",
            letterSpacing: "2px",
            boxShadow: "0 0 40px rgba(200,240,0,0.3)",
          }}
        >
          <Trophy size={14} />
          Vesti la Tua Nazionale
        </a>

        {/* Host flags row */}
        <div className="relative z-10 mt-10 flex items-center gap-3">
          {["us", "ca", "mx"].map((code) => (
            <img
              key={code}
              src={`https://flagcdn.com/w80/${code}.png`}
              alt={code}
              className="h-4 rounded-sm object-cover"
              style={{ opacity: 0.5 }}
            />
          ))}
          <span className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-bold ml-1">
            Host Nations
          </span>
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 z-5 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #050505)" }}
        />
      </section>

      {/* ═══════════════════════════════════════
          FEATURED NATION CARDS
      ═══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-8" id="kits">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-1 h-6 rounded-full"
            style={{ background: "#FFD700" }}
          />
          <p
            className="text-[10px] font-black uppercase tracking-[0.4em]"
            style={{ color: "rgba(255,215,0,0.7)" }}
          >
            Nazionali Protagoniste
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {ordered
            .filter(c => FEATURED.includes(c) && (groupedProducts[c]?.length ?? 0) > 0)
            .map(country => {
              const count = groupedProducts[country]?.length ?? 0;
              const preview = groupedProducts[country]?.[0]?.images?.[0];
              const isSelected = selectedNation === country;

              return (
                <button
                  key={country}
                  onClick={() => {
                    setSelectedNation(isSelected ? null : country);
                    document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="group relative rounded-2xl overflow-hidden text-left transition-all duration-300 active:scale-[0.97]"
                  style={{
                    aspectRatio: "4/3",
                    background: NATION_COLORS[country] ?? "rgba(255,255,255,0.03)",
                    border: isSelected
                      ? "1.5px solid rgba(200,240,0,0.6)"
                      : "1px solid rgba(255,255,255,0.06)",
                    boxShadow: isSelected
                      ? "0 0 24px rgba(200,240,0,0.15)"
                      : "none",
                  }}
                >
                  {/* Flag background */}
                  <img
                    src={getFlagUrl(country)}
                    alt={country}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    style={{ filter: "brightness(0.2) saturate(0.6)" }}
                  />
                  {/* Overlay */}
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)" }}
                  />

                  {/* Kit image preview */}
                  {preview && (
                    <div
                      className="absolute bottom-0 right-0 w-16 h-16 sm:w-20 sm:h-20 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100"
                      style={{ opacity: 0.7 }}
                    >
                      <Image
                        src={preview}
                        alt={country}
                        fill
                        className="object-contain drop-shadow-xl"
                        sizes="80px"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="absolute inset-0 p-3 flex flex-col justify-between">
                    {/* Mini flag */}
                    <img
                      src={getFlagUrl(country)}
                      alt={country}
                      className="w-9 h-6 object-cover rounded-sm shadow-lg"
                    />
                    <div>
                      <p className="font-black italic uppercase text-white text-sm leading-tight">
                        {country}
                      </p>
                      <p
                        className="text-[9px] font-bold uppercase tracking-wider"
                        style={{ color: "rgba(200,240,0,0.7)" }}
                      >
                        {count} kit
                      </p>
                    </div>
                  </div>

                  {/* Selected indicator */}
                  {isSelected && (
                    <div
                      className="absolute top-2 right-2 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ background: "#c8f000", color: "#000" }}
                    >
                      ✓ Selezionata
                    </div>
                  )}

                  {/* Hover border glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl pointer-events-none"
                    style={{ border: "1.5px solid rgba(255,215,0,0.3)" }}
                  />
                </button>
              );
            })}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FILTER PILLS + PRODUCTS
      ═══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4" id="products-section">
        {/* Filter bar */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[9px] uppercase tracking-[0.4em] font-black text-white/25">
              Filtra per nazione
            </p>
            <h2 className="text-base font-black italic uppercase text-white leading-tight">
              {selectedNation ? selectedNation : `Tutte le Nazioni`}
              <span className="text-white/30 font-normal text-sm ml-2 non-italic">
                ({filteredProducts.length} kit)
              </span>
            </h2>
          </div>
          {selectedNation && (
            <button
              onClick={() => setSelectedNation(null)}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all active:scale-95"
              style={{ color: "#c8f000", border: "1px solid rgba(200,240,0,0.25)" }}
            >
              ← Tutte
            </button>
          )}
        </div>

        {/* Scrollable pills */}
        <div
          ref={pillsRef}
          className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide"
        >
          <button
            onClick={() => setSelectedNation(null)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full font-black uppercase text-[10px] tracking-wide transition-all active:scale-95"
            style={{
              background: !selectedNation ? "#c8f000" : "rgba(255,255,255,0.05)",
              color: !selectedNation ? "#000" : "rgba(255,255,255,0.55)",
              border: !selectedNation ? "none" : "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <Globe size={9} />
            Tutte
          </button>

          {ordered.map(country => {
            const count = groupedProducts[country]?.length ?? 0;
            const isSelected = selectedNation === country;
            const isFeatured = FEATURED.includes(country);

            return (
              <button
                key={country}
                onClick={() => {
                  setSelectedNation(isSelected ? null : country);
                }}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold uppercase text-[10px] tracking-wide transition-all active:scale-95"
                style={{
                  background: isSelected
                    ? "#c8f000"
                    : isFeatured
                    ? "rgba(255,215,0,0.05)"
                    : "rgba(255,255,255,0.04)",
                  color: isSelected ? "#000" : "rgba(255,255,255,0.65)",
                  border: isSelected
                    ? "none"
                    : isFeatured
                    ? "1px solid rgba(255,215,0,0.18)"
                    : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <img
                  src={getFlagUrl(country)}
                  alt={country}
                  className="w-4 h-3 object-cover rounded-sm flex-shrink-0"
                />
                {country}
                <span className="opacity-50">({count})</span>
              </button>
            );
          })}
        </div>

        {/* ── Products ── */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-white/20 font-black uppercase text-sm">
              Nessun kit disponibile
            </p>
          </div>
        ) : selectedNation ? (
          /* Single-nation view */
          <div>
            <div
              className="flex items-center gap-4 mb-8 pb-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div className="relative w-14 h-10 rounded overflow-hidden shadow-lg flex-shrink-0">
                <Image
                  src={getFlagUrl(selectedNation)}
                  alt={selectedNation}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl font-black italic uppercase text-white">
                  {selectedNation}
                </h2>
                <p
                  className="text-[10px] uppercase tracking-widest font-bold"
                  style={{ color: "#FFD700" }}
                >
                  World Cup 2026 · {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "kit disponibile" : "kit disponibili"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((p: any) => (
                <ProductCard
                  key={p._id}
                  id={p._id}
                  name={p.title}
                  price={p.basePrice}
                  image={p.images?.[0] ?? "/placeholder.jpg"}
                  category={p.category}
                  team={p.nationalTeam ?? p.country}
                  isWorldCup={p.isWorldCup}
                  hasLongSleeve={p.hasLongSleeve}
                  href={`/products/${p.slug}`}
                  product={p}
                />
              ))}
            </div>
          </div>
        ) : (
          /* All-nations grouped view */
          <div className="space-y-16">
            {ordered.map(country => (
              <div key={country}>
                {/* Section header */}
                <div
                  className="flex items-center gap-4 mb-6 pb-3"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="relative w-12 h-8 rounded overflow-hidden shadow-md flex-shrink-0">
                    <Image
                      src={getFlagUrl(country)}
                      alt={country}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-black italic uppercase text-white leading-none truncate">
                      {country}
                    </h2>
                    <p
                      className="text-[9px] uppercase tracking-widest font-bold mt-0.5"
                      style={{ color: "rgba(255,215,0,0.6)" }}
                    >
                      {groupedProducts[country]?.length ?? 0} kit · World Cup 2026
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedNation(country);
                      window.scrollTo({ top: document.getElementById("products-section")?.offsetTop ?? 0, behavior: "smooth" });
                    }}
                    className="flex-shrink-0 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-[#c8f000] transition-colors"
                  >
                    Vedi tutti <ChevronRight size={10} />
                  </button>
                </div>

                {/* Products */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {(groupedProducts[country] ?? []).map((p: any) => (
                    <ProductCard
                      key={p._id}
                      id={p._id}
                      name={p.title}
                      price={p.basePrice}
                      image={p.images?.[0] ?? "/placeholder.jpg"}
                      category={p.category}
                      team={p.nationalTeam ?? p.country}
                      isWorldCup={p.isWorldCup}
                      hasLongSleeve={p.hasLongSleeve}
                      href={`/products/${p.slug}`}
                      product={p}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════
          URGENCY BANNER
      ═══════════════════════════════════════ */}
      {mounted && timeLeft.days > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div
            className="rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left"
            style={{
              background: "linear-gradient(135deg, rgba(255,215,0,0.05) 0%, rgba(200,240,0,0.04) 100%)",
              border: "1px solid rgba(255,215,0,0.15)",
            }}
          >
            <div
              className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{ background: "rgba(255,215,0,0.1)" }}
            >
              ⚽
            </div>
            <div className="flex-1">
              <p className="font-black uppercase text-white text-sm">
                Mancano solo{" "}
                <span style={{ color: "#FFD700" }}>{timeLeft.days} giorni</span>{" "}
                al fischio d'inizio!
              </p>
              <p className="text-[11px] text-white/40 mt-0.5">
                Ordina ora e ricevi il tuo kit prima del Mondiale 2026
              </p>
            </div>
            <a
              href="#kits"
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full font-black uppercase text-[10px] tracking-widest transition-all active:scale-95"
              style={{ background: "#c8f000", color: "#000" }}
            >
              <Zap size={11} />
              Acquista Ora
            </a>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          TRUST STRIP
      ═══════════════════════════════════════ */}
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 py-10 mt-4 mb-8"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { Icon: Truck,        title: "Spedizione Rapida",  sub: "3-5 giorni lavorativi" },
            { Icon: RotateCcw,    title: "Reso Gratuito",      sub: "30 giorni senza domande" },
            { Icon: ShieldCheck,  title: "Pagamento Sicuro",   sub: "SSL · PayPal · Klarna" },
            { Icon: Trophy,       title: "Kit Mondiali 2026",  sub: "Selezione esclusiva" },
          ].map(({ Icon, title, sub }) => (
            <div key={title} className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
              <div
                className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(255,215,0,0.07)", border: "1px solid rgba(255,215,0,0.1)" }}
              >
                <Icon size={16} style={{ color: "#FFD700" }} />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-white/70">{title}</p>
                <p className="text-[10px] text-white/30 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
