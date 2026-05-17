"use client";

import { Star } from "lucide-react";
import Link from "next/link";

const REVIEWS = [
  {
    initials: "MR",
    name: "Marco Rossi",
    city: "Milano",
    stars: 5,
    text: "Maglia arrivata in meno di 48 ore, qualità impeccabile. È la terza che compro su Goal Mania e ogni volta rimango soddisfatto. L'autenticità è garantita!",
    product: "Maglia Inter Home 2025/26",
    color: "#5f73d6",
  },
  {
    initials: "SB",
    name: "Sofia Bianchi",
    city: "Roma",
    stars: 5,
    text: "Finalmente un e-commerce di maglie serio in Italia. Ho ordinato la maglia della Roma personalizzata e il risultato è straordinario. Consigliatissimo!",
    product: "Maglia Roma Away 2025/26",
    color: "#d47070",
  },
  {
    initials: "LV",
    name: "Lorenzo Verdi",
    city: "Napoli",
    stars: 5,
    text: "Prezzo ottimo, spedizione rapidissima. Il packaging è curatissimo e la maglia era esattamente come descritta. Goal Mania è il mio riferimento per le maglie!",
    product: "Maglia Napoli Home 2025/26",
    color: "#4fa0d0",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          fill={i < count ? "#c8f000" : "transparent"}
          color={i < count ? "#c8f000" : "rgba(255,255,255,0.2)"}
        />
      ))}
    </div>
  );
}

export default function SocialProofSection() {
  return (
    <section className="py-16 md:py-20 bg-[#0a0a0a]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="w-6 h-[1.5px] rounded-full inline-block" style={{ background: "#c8f000" }} />
            <span
              className="text-[10px] uppercase tracking-[4px]"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "#c8f000" }}
            >
              // Recensioni Verificate
            </span>
            <span className="w-6 h-[1.5px] rounded-full inline-block" style={{ background: "#c8f000" }} />
          </div>

          <h2
            className="font-black uppercase text-white leading-tight mb-4"
            style={{
              fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              letterSpacing: "1px",
            }}
          >
            Cosa dicono i nostri{" "}
            <span style={{ color: "#c8f000" }}>clienti</span>
          </h2>

          {/* Aggregate rating */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <StarRating count={5} />
              <span
                className="text-2xl font-black text-white"
                style={{ fontFamily: "var(--font-display, sans-serif)" }}
              >
                4.9
              </span>
              <span
                className="text-sm"
                style={{ fontFamily: "var(--font-body, sans-serif)", color: "rgba(255,255,255,0.4)" }}
              >
                / 5
              </span>
            </div>
            <span
              className="text-xs uppercase tracking-widest"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.3)" }}
            >
              · 2.847 recensioni ·
            </span>
            <span
              className="flex items-center gap-1 text-xs"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.7)" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ background: "#c8f000" }}
              />
              Verificate
            </span>
          </div>
        </div>

        {/* Review cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {REVIEWS.map((review) => (
            <div
              key={review.name}
              className="p-6 rounded-2xl flex flex-col gap-4 group transition-all duration-300"
              style={{
                background: "#111",
                border: "1px solid rgba(255,255,255,0.06)",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.border = "1px solid rgba(200,240,0,0.2)";
                el.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.border = "1px solid rgba(255,255,255,0.06)";
                el.style.transform = "translateY(0)";
              }}
            >
              {/* Top quote accent */}
              <div
                className="absolute top-4 right-4 text-5xl font-black leading-none select-none"
                style={{ color: "rgba(200,240,0,0.06)", fontFamily: "var(--font-display, sans-serif)" }}
              >
                "
              </div>

              {/* Stars */}
              <StarRating count={review.stars} />

              {/* Review text */}
              <p
                className="text-sm leading-relaxed flex-1"
                style={{ fontFamily: "var(--font-body, sans-serif)", color: "rgba(255,255,255,0.65)" }}
              >
                "{review.text}"
              </p>

              {/* Product */}
              <div
                className="text-[10px] px-3 py-1.5 rounded-full uppercase tracking-widest inline-block self-start"
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  color: "rgba(200,240,0,0.6)",
                  background: "rgba(200,240,0,0.06)",
                  border: "1px solid rgba(200,240,0,0.12)",
                }}
              >
                {review.product}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm"
                  style={{
                    background: `${review.color}20`,
                    border: `1.5px solid ${review.color}40`,
                    color: review.color,
                    fontFamily: "var(--font-display, sans-serif)",
                  }}
                >
                  {review.initials}
                </div>
                <div>
                  <p
                    className="text-sm font-bold text-white leading-tight"
                    style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "0.5px" }}
                  >
                    {review.name}
                  </p>
                  <p
                    className="text-[10px] uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.3)" }}
                  >
                    {review.city} · Cliente Verificato
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm uppercase tracking-widest transition-colors hover:text-[#c8f000]"
            style={{
              fontFamily: "var(--font-mono, monospace)",
              color: "rgba(200,240,0,0.6)",
            }}
          >
            Leggi tutte le 2.847 recensioni →
          </Link>
        </div>
      </div>
    </section>
  );
}
