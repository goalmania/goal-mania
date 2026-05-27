"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const GRAIN = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='200' height='200' filter='url(#g)' opacity='0.08'/></svg>`;

const CATS = [
  {
    key: "serieA",
    flag: "🇮🇹",
    label: "Serie A",
    count: "66 maglie",
    href: "/shop",
    teams: ["Inter", "Juventus", "Milan", "Roma", "Napoli"],
    accent: "rgba(0,120,220,0.12)",
    accentBorder: "rgba(0,120,220,0.28)",
    accentText: "#60A5FA",
    glow: "rgba(0,100,200,0.15)",
  },
  {
    key: "premier",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    label: "Premier League",
    count: "50+ maglie",
    href: "/shop",
    teams: ["Arsenal", "Man City", "Liverpool", "Chelsea"],
    accent: "rgba(130,60,200,0.12)",
    accentBorder: "rgba(130,60,200,0.28)",
    accentText: "#A78BFA",
    glow: "rgba(100,40,180,0.15)",
  },
  {
    key: "worldcup",
    flag: "🌍",
    label: "World Cup 2026",
    count: "64 maglie",
    href: "/shop/worldcup",
    teams: ["Brasile", "Italia", "Argentina", "Francia"],
    accent: "rgba(200,150,0,0.12)",
    accentBorder: "rgba(200,150,0,0.28)",
    accentText: "#FCD34D",
    glow: "rgba(180,120,0,0.15)",
  },
  {
    key: "retro",
    flag: "⏪",
    label: "Maglie Retro",
    count: "50+ maglie",
    href: "/shop/retro",
    teams: ["Napoli '87", "Brasile '02", "Milan '90s"],
    accent: "rgba(200,240,0,0.07)",
    accentBorder: "rgba(200,240,0,0.22)",
    accentText: "#c8f000",
    glow: "rgba(180,220,0,0.1)",
  },
  {
    key: "next",
    flag: "⚡",
    label: "Stagione 26/27",
    count: "Nuovi arrivi",
    href: "/shop/2026/27",
    teams: ["Arsenal", "In arrivo…"],
    accent: "rgba(200,240,0,0.05)",
    accentBorder: "rgba(200,240,0,0.15)",
    accentText: "#c8f000",
    glow: "rgba(180,220,0,0.08)",
  },
];

export default function HomeCategoryCards() {
  return (
    <section className="py-12 md:py-16 bg-[#070707] relative overflow-hidden">
      {/* Grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(GRAIN)}")`,
          backgroundRepeat: "repeat",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section header */}
        <div className="flex items-center gap-4 mb-8">
          <div>
            <div
              className="text-[10px] uppercase tracking-[4px] mb-1"
              style={{ fontFamily: "var(--font-mono,monospace)", color: "rgba(200,240,0,0.6)" }}
            >
              // Shop per campionato
            </div>
            <h2
              className="font-black uppercase text-white leading-none"
              style={{
                fontFamily: "var(--font-display,'Barlow Condensed',sans-serif)",
                fontSize: "clamp(1.8rem,4vw,2.8rem)",
                letterSpacing: "0.5px",
              }}
            >
              Scegli la tua{" "}
              <span style={{ color: "#c8f000" }}>Categoria</span>
            </h2>
          </div>
          <Link
            href="/shop"
            className="ml-auto hidden md:inline-flex items-center gap-2 text-xs uppercase tracking-widest transition-all duration-200 hover:gap-3"
            style={{ fontFamily: "var(--font-mono,monospace)", color: "rgba(200,240,0,0.6)" }}
          >
            Vedi tutto <ArrowRight size={14} />
          </Link>
        </div>

        {/* Cards — horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0">
          {CATS.map((cat) => (
            <Link
              key={cat.key}
              href={cat.href}
              className="flex-shrink-0 w-[200px] lg:w-auto group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: `1.5px solid ${cat.accentBorder}`,
                boxShadow: `0 0 0 0 ${cat.glow}`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${cat.glow}`;
                (e.currentTarget as HTMLElement).style.borderColor = cat.accentText;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 0 transparent";
                (e.currentTarget as HTMLElement).style.borderColor = cat.accentBorder;
              }}
            >
              {/* Inner grain */}
              <div
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                  backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(GRAIN)}")`,
                  backgroundRepeat: "repeat",
                }}
              />
              {/* Colored radial bg */}
              <div
                className="absolute inset-0"
                style={{ background: `radial-gradient(ellipse at 50% 0%,${cat.accent} 0%,transparent 70%)` }}
              />

              <div className="relative z-10 p-5 flex flex-col h-full min-h-[220px]">
                {/* Flag */}
                <div className="text-4xl mb-3 select-none">{cat.flag}</div>

                {/* Name */}
                <div
                  className="font-black uppercase leading-none mb-1"
                  style={{
                    fontFamily: "var(--font-display,'Barlow Condensed',sans-serif)",
                    fontSize: "1.3rem",
                    color: "white",
                    letterSpacing: "0.5px",
                  }}
                >
                  {cat.label}
                </div>

                {/* Count */}
                <div
                  className="text-[10px] uppercase tracking-[2px] mb-3"
                  style={{ fontFamily: "var(--font-mono,monospace)", color: cat.accentText }}
                >
                  {cat.count}
                </div>

                {/* Teams */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {cat.teams.map((t) => (
                    <span
                      key={t}
                      className="text-[9px] px-2 py-0.5 rounded-full"
                      style={{
                        fontFamily: "var(--font-mono,monospace)",
                        background: "rgba(255,255,255,0.04)",
                        color: "rgba(255,255,255,0.4)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div
                  className="mt-auto flex items-center gap-1.5 text-[10px] uppercase tracking-widest transition-all duration-200 group-hover:gap-2.5"
                  style={{ fontFamily: "var(--font-mono,monospace)", color: cat.accentText }}
                >
                  Vedi tutte <ArrowRight size={11} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
