"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// Sei porte d'ingresso al catalogo. Tutte uguali per forma e colore:
// al passaggio (o al tocco) il riquadro diventa lime pieno.
const CATS = [
  { key: "serieA", flag: "🇮🇹", label: "Serie A", count: "66 maglie", href: "/shop/serieA", ghost: "A" },
  { key: "premier", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", label: "Premier League", count: "50+ maglie", href: "/shop/premier-league", ghost: "PL" },
  { key: "worldcup", flag: "🌍", label: "Mondiali 2026", count: "64 maglie", href: "/shop/worldcup", ghost: "26" },
  { key: "international", flag: "⭐", label: "Grandi club", count: "30+ maglie", href: "/shop/international", ghost: "UE" },
  { key: "retro", flag: "⏪", label: "Maglie retro", count: "700+ maglie", href: "/shop/retro", ghost: "90" },
  { key: "next", flag: "⚡", label: "Stagione 26/27", count: "73 maglie", href: "/shop/2026/27", ghost: "27" },
];

export default function HomeCategoryCards() {
  return (
    <section className="bg-[#0a0a0a] py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end gap-4">
          <div>
            <p className="gm-eyebrow">Shop per campionato</p>
            <h2 className="gm-section-title">Scegli la categoria</h2>
          </div>
          <Link
            href="/shop"
            className="ml-auto hidden items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#c8f000] transition-all duration-200 hover:gap-3 md:inline-flex"
            style={{ fontFamily: "var(--font-display,sans-serif)" }}
          >
            Tutto il catalogo <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {CATS.map((cat) => (
            <Link
              key={cat.key}
              href={cat.href}
              className="group relative flex min-h-[150px] flex-col justify-between overflow-hidden rounded-[10px] border border-white/10 bg-[#101010] p-4 transition-colors duration-200 hover:border-[#c8f000] hover:bg-[#c8f000] active:bg-[#c8f000] md:min-h-[210px] md:p-5"
            >
              {/* Numero fantasma: richiamo al numero di maglia */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-4 -right-2 select-none font-black leading-none transition-colors duration-200 group-hover:text-black/15"
                style={{
                  fontFamily: "var(--font-display,'Barlow Condensed',sans-serif)",
                  fontSize: "clamp(5rem, 12vw, 8.5rem)",
                  color: "rgba(255,255,255,0.07)",
                }}
              >
                {cat.ghost}
              </span>

              <div className="relative flex items-start justify-between">
                <span className="text-2xl leading-none" aria-hidden="true">{cat.flag}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#c8f000] text-[#0a0a0a] transition-colors group-hover:bg-[#0a0a0a] group-hover:text-[#c8f000]">
                  <ArrowUpRight size={16} />
                </span>
              </div>

              <div className="relative">
                <h3
                  className="text-[26px] font-extrabold uppercase leading-[0.95] text-white transition-colors group-hover:text-[#0a0a0a] md:text-[30px]"
                  style={{ fontFamily: "var(--font-display,'Barlow Condensed',sans-serif)" }}
                >
                  {cat.label}
                </h3>
                <p
                  className="mt-1.5 text-[12px] font-bold uppercase tracking-[0.14em] text-[#c8f000] transition-colors group-hover:text-[#0a0a0a]/80"
                  style={{ fontFamily: "var(--font-mono,monospace)" }}
                >
                  {cat.count}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
