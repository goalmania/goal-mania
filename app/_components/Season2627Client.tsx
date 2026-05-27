"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import ProductCard from "@/components/ui/ProductCard";
import { Zap, ChevronRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────
interface SeasonProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  slug: string;
  team: string;
  feature: boolean;
}

// ─── League detection ──────────────────────────────────────
const LEAGUE_RULES: { key: string; keywords: string[] }[] = [
  {
    key: "serieA",
    keywords: [
      "inter", "milan", "juventus", "juve", "napoli", "roma", "lazio",
      "bologna", "como", "venezia", "atalanta", "fiorentina", "torino", "genoa",
    ],
  },
  {
    key: "premier",
    keywords: [
      "arsenal", "chelsea", "liverpool", "manchester city", "man city",
      "manchester united", "man united", "tottenham", "newcastle", "aston villa",
    ],
  },
  {
    key: "laliga",
    keywords: ["real madrid", "barcellona", "atletico madrid", "villarreal", "sevilla"],
  },
  {
    key: "nationals",
    keywords: [
      "italia", "brasile", "portogallo", "giappone", "inghilterra",
      "argentina", "francia", "spagna", "germany", "germania",
    ],
  },
];

function getLeague(title: string): string {
  const t = title.toLowerCase();
  for (const rule of LEAGUE_RULES) {
    if (rule.keywords.some((k) => t.includes(k))) return rule.key;
  }
  return "other";
}

function extractTeamName(title: string): string {
  // "Maglia Arsenal 25/26 Home" → "Arsenal"
  const cleaned = title
    .replace(/^maglia\s+/i, "")
    .replace(/^quarta\s+maglia\s+/i, "")
    .replace(/\s+(home|away|third|quarta|terza|casa|trasferta|pre\s+gara|allenamento|training|halloween|concept|x\s+\S+)\s*.*/i, "")
    .replace(/\s+\d{2}\/\d{2,4}.*$/i, "")
    .replace(/\s+\d{4}\/\d{2,4}.*$/i, "")
    .replace(/\s+\d{4}-\d{2,4}.*$/i, "")
    .trim();
  return cleaned || title;
}

// ─── Section metadata ──────────────────────────────────────
const SECTIONS = [
  {
    key: "serieA",
    flag: "🇮🇹",
    label: "Serie A",
    description: "Inter, Milan, Juventus, Napoli, Roma e tutti i club italiani",
    accent: "rgba(0,120,200,0.12)",
    accentBorder: "rgba(0,120,200,0.25)",
    accentText: "#60A5FA",
  },
  {
    key: "premier",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    label: "Premier League",
    description: "Arsenal, Chelsea, Liverpool, Manchester City e Man United",
    accent: "rgba(130,60,200,0.10)",
    accentBorder: "rgba(130,60,200,0.22)",
    accentText: "#A78BFA",
  },
  {
    key: "laliga",
    flag: "🇪🇸",
    label: "La Liga",
    description: "Real Madrid, Barcellona, Atletico Madrid",
    accent: "rgba(220,50,50,0.10)",
    accentBorder: "rgba(220,50,50,0.22)",
    accentText: "#F87171",
  },
  {
    key: "nationals",
    flag: "🌍",
    label: "Nazionali",
    description: "Italia, Brasile, Portogallo, Giappone e altre selezioni",
    accent: "rgba(200,240,0,0.07)",
    accentBorder: "rgba(200,240,0,0.18)",
    accentText: "#c8f000",
  },
  {
    key: "other",
    flag: "⚡",
    label: "Edizioni Speciali",
    description: "Collaborazioni, edizioni limitate e kit esclusivi",
    accent: "rgba(249,115,22,0.10)",
    accentBorder: "rgba(249,115,22,0.22)",
    accentText: "#FB923C",
  },
];

// ─── Main ─────────────────────────────────────────────────
export default function Season2627Client({ products }: { products: SeasonProduct[] }) {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Group products by league
  const grouped = useMemo(() => {
    const map: Record<string, SeasonProduct[]> = {
      serieA: [], premier: [], laliga: [], nationals: [], other: [],
    };
    for (const p of products) {
      const league = getLeague(p.name);
      map[league].push(p);
    }
    return map;
  }, [products]);

  // All sections always shown (empty ones show "prossimamente")
  const activeSections = SECTIONS;

  // Flat filtered view
  const filteredProducts = useMemo(() => {
    if (activeFilter === "all") return [];
    return grouped[activeFilter] ?? [];
  }, [activeFilter, grouped]);

  const PILLS = [
    { key: "all", label: "Tutta la Stagione" },
    ...activeSections.map((s) => ({ key: s.key, label: s.label })),
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0a] font-munish">

      {/* ── HERO ──────────────────────────────────────── */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        {/* Hero background image */}
        <Image
          src="/hero-2627.jpg"
          alt=""
          fill
          priority
          className="absolute inset-0 object-cover object-center"
          style={{ zIndex: 0 }}
          sizes="100vw"
        />
        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.72) 50%, rgba(10,10,10,0.45) 100%)",
            zIndex: 1,
          }}
        />
        {/* Grid bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(200,240,0,0.025) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(200,240,0,0.025) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            zIndex: 2,
          }}
        />
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(200,240,0,0.06) 0%, transparent 70%)",
            zIndex: 2,
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative" style={{ zIndex: 3 }}>
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-4">
            <Zap size={12} style={{ color: "#c8f000" }} />
            <span
              className="text-[10px] font-black uppercase tracking-[0.4em]"
              style={{ color: "rgba(200,240,0,0.6)" }}
            >
              Nuova Stagione
            </span>
          </div>

          {/* Title */}
          <h1
            className="font-black italic uppercase leading-none mb-3"
            style={{
              fontSize: "clamp(2.8rem, 9vw, 5.5rem)",
              color: "#fff",
              letterSpacing: "-0.025em",
            }}
          >
            Maglie{" "}
            <span style={{ color: "#c8f000" }}>2026/27</span>
          </h1>

          <p className="text-sm text-white/40 max-w-xl mb-6">
            {products.length > 0
              ? `${products.length} kit già disponibili — Serie A, Premier League, La Liga e Nazionali. Nuovi arrivi ogni settimana.`
              : "I nuovi kit della stagione 2026/27 stanno arrivando. Ogni maglia spedita gratis, resa in 30 giorni."}
          </p>

          {/* League quick-jump chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveFilter(s.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-150 active:scale-95"
                style={{
                  background: s.accent,
                  border: `1px solid ${s.accentBorder}`,
                  color: s.accentText,
                }}
              >
                <span>{s.flag}</span>
                <span>{s.label}</span>
                <span className="opacity-50">({grouped[s.key]?.length ?? 0})</span>
              </button>
            ))}
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center gap-4 mt-2">
            {["🚚 Spedizione Gratuita", "🔄 Reso 30gg", "🔒 Pagamento Sicuro"].map((t) => (
              <span key={t} className="text-[10px] font-bold text-white/35 uppercase tracking-wider">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FILTER PILLS ──────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {PILLS.map(({ key, label }) => {
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
                        color: "rgba(255,255,255,0.45)",
                        border: "1px solid rgba(255,255,255,0.07)",
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
          {(() => {
            const sec = SECTIONS.find((s) => s.key === activeFilter);
            return sec ? (
              <div className="flex items-center gap-3 mb-6">
                <span
                  className="text-xs font-black uppercase tracking-[0.35em] px-3 py-1.5 rounded-full"
                  style={{ background: sec.accent, border: `1px solid ${sec.accentBorder}`, color: sec.accentText }}
                >
                  {sec.flag} {sec.label}
                </span>
                <span className="text-xs text-white/25">{filteredProducts.length} maglie</span>
                <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.05)" }} />
                <button
                  onClick={() => setActiveFilter("all")}
                  className="text-[10px] font-bold text-white/30 hover:text-white/60 transition-colors"
                >
                  ← Torna a tutte
                </button>
              </div>
            ) : null;
          })()}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={p.price}
                image={p.image}
                category={p.category}
                team={extractTeamName(p.name)}
                href={`/products/${p.slug}`}
                product={p}
                isNew={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── ALL SECTIONS VIEW ─────────────────────────── */}
      {activeFilter === "all" && (
        <div className="pb-24 space-y-16">
          {activeSections.map((section) => {
            const prods = grouped[section.key] ?? [];
            const isEmpty = prods.length === 0;

            // Group by team within each league
            const byTeam: Record<string, SeasonProduct[]> = {};
            for (const p of prods) {
              const team = extractTeamName(p.name);
              if (!byTeam[team]) byTeam[team] = [];
              byTeam[team].push(p);
            }
            const teams = Object.keys(byTeam);

            return (
              <section key={section.key} className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Section header */}
                <div className="mb-7">
                  <div className="flex items-center gap-3 mb-3">
                    {/* League badge */}
                    <div
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                      style={{
                        background: section.accent,
                        border: `1px solid ${section.accentBorder}`,
                      }}
                    >
                      <span className="text-sm">{section.flag}</span>
                      <span
                        className="text-[10px] font-black uppercase tracking-[0.35em]"
                        style={{ color: section.accentText }}
                      >
                        {section.label}
                      </span>
                    </div>
                    <div
                      className="h-px flex-1"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    />
                    <span className="text-[10px] font-black tabular-nums text-white/25">
                      {prods.length} kit · {teams.length} squadre
                    </span>
                  </div>

                  <h2
                    className="font-black italic uppercase mb-1"
                    style={{
                      fontSize: "clamp(1.4rem, 4vw, 2.2rem)",
                      color: "#fff",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {section.label}
                  </h2>
                  <p className="text-xs text-white/30">{section.description}</p>
                </div>

                {/* Empty state — coming soon */}
                {isEmpty && (
                  <div
                    className="rounded-2xl flex items-center gap-4 px-6 py-5 mb-2"
                    style={{
                      border: `1px dashed ${section.accentBorder}`,
                      background: section.accent,
                    }}
                  >
                    <span className="text-2xl">{section.flag}</span>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider" style={{ color: section.accentText }}>
                        Prossimamente
                      </p>
                      <p className="text-[11px] text-white/30 mt-0.5">
                        I kit {section.label} 2026/27 saranno disponibili a breve.
                      </p>
                    </div>
                  </div>
                )}

                {/* Team sub-sections */}
                {!isEmpty && teams.length > 1 ? (
                  <div className="space-y-8">
                    {teams.map((team) => (
                      <div key={team}>
                        {/* Team header */}
                        <div className="flex items-center gap-3 mb-4">
                          <span
                            className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg"
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              color: "rgba(255,255,255,0.55)",
                              border: "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            {team}
                          </span>
                          <div
                            className="h-px flex-1"
                            style={{ background: "rgba(255,255,255,0.04)" }}
                          />
                          <span className="text-[9px] text-white/20">
                            {byTeam[team].length} kit
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                          {byTeam[team].map((p) => (
                            <ProductCard
                              key={p.id}
                              id={p.id}
                              name={p.name}
                              price={p.price}
                              image={p.image}
                              category={p.category}
                              team={team}
                              href={`/products/${p.slug}`}
                              product={p}
                              isNew={true}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !isEmpty ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                    {prods.map((p) => (
                      <ProductCard
                        key={p.id}
                        id={p.id}
                        name={p.name}
                        price={p.price}
                        image={p.image}
                        category={p.category}
                        team={extractTeamName(p.name)}
                        href={`/products/${p.slug}`}
                        product={p}
                        isNew={true}
                      />
                    ))}
                  </div>
                ) : null}

                {/* View all CTA — only when section has products */}
                {!isEmpty && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={() => setActiveFilter(section.key)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all duration-200 active:scale-95"
                      style={{
                        border: `1px solid ${section.accentBorder}`,
                        color: section.accentText,
                      }}
                    >
                      Tutti i kit {section.label} <ChevronRight size={12} />
                    </button>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
