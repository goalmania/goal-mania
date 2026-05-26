"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import { Clock, Trophy, Globe, Star, ChevronRight, Flame } from "lucide-react";

// ─── Types ────────────────────────────────────────────────
interface RetroProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  slug: string;
  team: string;
  isRetro: boolean;
  feature: boolean;
}

// ─── Hall of Fame slugs ────────────────────────────────────
// Le maglie più iconiche della storia
const HOF_SLUGS = new Set([
  "maglia-napoli-198788-home",           // Maradona
  "maglia-brasile-2002-home",            // Pentacampioni
  "maglia-milan-1993-94-casa",           // Sacchi / Capello
  "maglia-manchester-united-home-1998-99", // Treble
  "maglia-barcellona-2009-home",         // Sextuple Guardiola
  "maglia-inter-200910-home",            // Triplete Mourinho
  "maglia-juventus-199798-home",         // Juve anni d'oro
  "maglia-francia-1998-home",            // Mondiali Francia 98
]);

// ─── Categorisation helpers ────────────────────────────────
function getSection(title: string): "nationals" | "serieA" | "europe" {
  const t = title.toLowerCase();
  const isNational =
    ["brasile", "brasil", "francia", "france", "inghilterra", "england",
     "italia", "argentina", "boca"].some((k) => t.includes(k));
  if (isNational) return "nationals";

  const isSerieA =
    ["inter", "milan", "juventus", "napoli", "roma", "lazio", "parma"].some(
      (k) => t.includes(k)
    );
  if (isSerieA) return "serieA";

  return "europe";
}

// ─── Section metadata ──────────────────────────────────────
const SECTIONS = [
  {
    key: "nationals" as const,
    icon: Globe,
    label: "Naz.",
    era: "1987 — 2014",
    title: "Nazionali & Mondiali",
    subtitle:
      "Le divise che hanno definito un'era: dai Mondiali del '98 al Brasile leggendario del 2002.",
    legends: ["Brasile 2002", "Francia 1998", "Argentina 2014", "Italia 1996"],
  },
  {
    key: "serieA" as const,
    icon: Star,
    label: "Serie A",
    era: "1987 — 2019",
    title: "Leggende di Serie A",
    subtitle:
      "Napoli di Maradona, Milan di Sacchi, Inter del Triplete, Juve degli scudetti. Il calcio italiano al suo apice.",
    legends: ["Napoli 87/88", "Milan 93/94", "Inter 09/10", "Juve 96/97"],
  },
  {
    key: "europe" as const,
    icon: Trophy,
    label: "Europa",
    era: "1995 — 2012",
    title: "Campioni d'Europa",
    subtitle:
      "Real Madrid, Barcellona, Arsenal e Manchester United. I club che hanno scritto la storia della Champions League.",
    legends: ["Barça 2009", "Man Utd Treble", "Arsenal Invincibles", "Real Madrid 99"],
  },
];

// ─── Grain SVG (inline, no file needed) ───────────────────
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E")`;

// ─── Main component ────────────────────────────────────────
export default function RetroClient({ products }: { products: RetroProduct[] }) {
  const [activeFilter, setActiveFilter] = useState<"all" | "nationals" | "serieA" | "europe">("all");

  // Partition products
  const { hof, categorised } = useMemo(() => {
    const hof = products.filter((p) => HOF_SLUGS.has(p.slug));
    const rest = products.filter((p) => !HOF_SLUGS.has(p.slug));

    const categorised = {
      nationals: rest.filter((p) => getSection(p.name) === "nationals"),
      serieA:    rest.filter((p) => getSection(p.name) === "serieA"),
      europe:    rest.filter((p) => getSection(p.name) === "europe"),
    };
    return { hof, categorised };
  }, [products]);

  // Filtered view (when pill selected)
  const filteredFlat = useMemo(() => {
    if (activeFilter === "all") return [];
    const all = [
      ...products.filter((p) => HOF_SLUGS.has(p.slug)),
      ...products.filter((p) => !HOF_SLUGS.has(p.slug)),
    ];
    return all.filter((p) => getSection(p.name) === activeFilter);
  }, [activeFilter, products]);

  const FILTER_PILLS = [
    { key: "all",       label: "Tutta la Collezione" },
    { key: "nationals", label: "Nazionali & Mondiali" },
    { key: "serieA",    label: "Leggende Serie A" },
    { key: "europe",    label: "Campioni d'Europa" },
  ] as const;

  return (
    <main className="min-h-screen bg-[#0a0a0a] font-munish">

      {/* ── HERO ──────────────────────────────────────── */}
      <section className="relative pt-32 pb-14 overflow-hidden">
        {/* Grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
          style={{ backgroundImage: GRAIN_SVG, backgroundSize: "300px 300px" }}
        />
        {/* Warm radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(200,160,50,0.08) 0%, transparent 70%)",
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(200,240,0,0.015) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(200,240,0,0.015) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className="h-px flex-1 max-w-[40px]"
              style={{ background: "rgba(200,240,0,0.3)" }}
            />
            <span
              className="text-[10px] font-black uppercase tracking-[0.45em]"
              style={{ color: "rgba(200,240,0,0.55)" }}
            >
              Collezione Storica
            </span>
            <div
              className="h-px flex-1 max-w-[40px]"
              style={{ background: "rgba(200,240,0,0.3)" }}
            />
          </div>

          {/* Main title */}
          <h1
            className="font-black italic uppercase leading-none mb-4"
            style={{
              fontSize: "clamp(3rem, 10vw, 6.5rem)",
              color: "#fff",
              letterSpacing: "-0.03em",
              textShadow: "0 2px 40px rgba(0,0,0,0.6)",
            }}
          >
            Maglie
            <br />
            <span style={{ color: "#c8f000", WebkitTextStroke: "0px" }}>Retro</span>
          </h1>

          {/* Tagline */}
          <p
            className="text-sm max-w-lg mb-2 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}
          >
            "Il calcio è emozione, la storia è immortale."
          </p>
          <p className="text-xs text-white/30 max-w-xl mb-8">
            Dal Napoli di Maradona al Brasile del Penta, passando per il Triplete
            dell'Inter e la Barcellona di Guardiola — ogni maglia racconta una storia.
          </p>

          {/* Stats strip */}
          <div className="flex flex-wrap items-center gap-6">
            {[
              { icon: Clock,  val: `Dal ${new Date().getFullYear() - 37}`, label: "Oltre 35 anni di storia" },
              { icon: Flame,  val: `${products.length}+`, label: "Maglie in collezione" },
              { icon: Trophy, val: "3",  label: "Ere del calcio" },
            ].map(({ icon: Icon, val, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(200,240,0,0.08)", border: "1px solid rgba(200,240,0,0.15)" }}
                >
                  <Icon size={13} style={{ color: "#c8f000" }} />
                </div>
                <div>
                  <p className="text-xs font-black text-white leading-none">{val}</p>
                  <p className="text-[9px] text-white/35 uppercase tracking-wider leading-none mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HALL OF FAME ──────────────────────────────── */}
      {hof.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
          {/* Section header */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(200,240,0,0.06)",
                border: "1px solid rgba(200,240,0,0.2)",
              }}
            >
              <Star size={10} style={{ color: "#c8f000" }} />
              <span
                className="text-[10px] font-black uppercase tracking-[0.35em]"
                style={{ color: "#c8f000" }}
              >
                Hall of Fame
              </span>
            </div>
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>

          {/* Intro */}
          <p className="text-xs text-white/35 mb-6 max-w-2xl">
            Le maglie più iconiche di tutti i tempi. Quelle che chiunque ami il calcio riconosce a prima vista.
          </p>

          {/* HOF cards — slightly emphasised */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {hof.map((p) => (
              <div key={p.id} className="relative">
                {/* Legend badge */}
                <div
                  className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(200,240,0,0.9)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <Star size={8} fill="#000" color="#000" />
                  <span className="text-[8px] font-black uppercase tracking-wider text-black">
                    Leggenda
                  </span>
                </div>
                <ProductCard
                  id={p.id}
                  name={p.name}
                  price={p.price}
                  image={p.image}
                  category={p.category}
                  team={p.team}
                  href={`/products/${p.slug}`}
                  product={p}
                  isNew={false}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── FILTER PILLS ──────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {FILTER_PILLS.map(({ key, label }) => {
            const active = activeFilter === key;
            return (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className="flex-shrink-0 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all duration-200 active:scale-95"
                style={
                  active
                    ? { background: "#c8f000", color: "#000" }
                    : {
                        background: "rgba(255,255,255,0.04)",
                        color: "rgba(255,255,255,0.5)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── FILTERED FLAT VIEW ────────────────────────── */}
      {activeFilter !== "all" && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
          {filteredFlat.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {filteredFlat.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  price={p.price}
                  image={p.image}
                  category={p.category}
                  team={p.team}
                  href={`/products/${p.slug}`}
                  product={p}
                  isNew={false}
                />
              ))}
            </div>
          ) : (
            <p className="text-white/30 text-sm py-20 text-center">Nessuna maglia in questa categoria.</p>
          )}
        </section>
      )}

      {/* ── SECTIONED ALL VIEW ────────────────────────── */}
      {activeFilter === "all" && (
        <div className="pb-24 space-y-20">
          {SECTIONS.map((section, sIdx) => {
            const Icon = section.icon;
            const prods = categorised[section.key];
            if (prods.length === 0) return null;

            return (
              <section key={section.key} className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Section header */}
                <div className="mb-8">
                  {/* Top line: icon + era + divider */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "rgba(200,240,0,0.08)",
                        border: "1px solid rgba(200,240,0,0.18)",
                      }}
                    >
                      <Icon size={14} style={{ color: "#c8f000" }} />
                    </div>
                    <span
                      className="text-[10px] font-black uppercase tracking-[0.4em]"
                      style={{ color: "rgba(200,240,0,0.5)" }}
                    >
                      {section.era}
                    </span>
                    <div
                      className="h-px flex-1"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    />
                    {/* Count badge */}
                    <span
                      className="text-[10px] font-black tabular-nums px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        color: "rgba(255,255,255,0.3)",
                      }}
                    >
                      {prods.length} maglie
                    </span>
                  </div>

                  {/* Title */}
                  <h2
                    className="font-black italic uppercase mb-2"
                    style={{
                      fontSize: "clamp(1.4rem, 4vw, 2.4rem)",
                      color: "#fff",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {section.title}
                  </h2>
                  <p className="text-xs text-white/35 max-w-lg mb-4">{section.subtitle}</p>

                  {/* Legend chips */}
                  <div className="flex flex-wrap gap-2">
                    {section.legends.map((leg) => (
                      <span
                        key={leg}
                        className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                        style={{
                          background: "rgba(200,240,0,0.05)",
                          border: "1px solid rgba(200,240,0,0.12)",
                          color: "rgba(200,240,0,0.6)",
                        }}
                      >
                        ★ {leg}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Products grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                  {prods.map((p) => (
                    <ProductCard
                      key={p.id}
                      id={p.id}
                      name={p.name}
                      price={p.price}
                      image={p.image}
                      category={p.category}
                      team={p.team}
                      href={`/products/${p.slug}`}
                      product={p}
                      isNew={false}
                    />
                  ))}
                </div>

                {/* "Vedi tutti" CTA — only for first 2 sections as teaser */}
                {sIdx < 2 && prods.length >= 6 && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={() => setActiveFilter(section.key)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all duration-200 active:scale-95"
                      style={{
                        border: "1px solid rgba(200,240,0,0.25)",
                        color: "rgba(200,240,0,0.7)",
                        background: "transparent",
                      }}
                    >
                      Vedi tutti i {section.label} <ChevronRight size={12} />
                    </button>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* ── BOTTOM TRUST ──────────────────────────────── */}
      <section
        className="border-t py-10"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: "📦",
                title: "Spedizione Gratuita",
                desc: "Su tutti gli ordini, senza minimo.",
              },
              {
                icon: "🔄",
                title: "Reso 30 Giorni",
                desc: "Non soddisfatto? Reso facile e gratuito.",
              },
              {
                icon: "🔒",
                title: "Pagamento Sicuro",
                desc: "Carta, PayPal, Klarna. Sempre protetto.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{icon}</span>
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-wider">
                    {title}
                  </p>
                  <p className="text-[11px] text-white/35 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
