"use client";

import { useState } from "react";
import { Star, CheckCircle, RefreshCw, ThumbsUp, ChevronUp } from "lucide-react";
import Link from "next/link";

// ─── Data ─────────────────────────────────────────────────────────────────────

const AGGREGATE = { score: 4.9, total: 2847 };

const RATING_BARS = [
  { stars: 5, pct: 89 },
  { stars: 4, pct: 8 },
  { stars: 3, pct: 2 },
  { stars: 2, pct: 1 },
  { stars: 1, pct: 0 },
];

const FEATURED = {
  initials: "GT",
  name: "Giuseppe T.",
  city: "Torino",
  color: "#a78bfa",
  stars: 5,
  date: "18 mag 2026",
  product: "Juventus Home 2025/26",
  repeatBuyer: true,
  repeatCount: 5,
  helpful: 47,
  text: `Ero molto scettico — per meno di 30€ mi aspettavo una maglia da mercato. Quando ho aperto il pacco ero letteralmente senza parole: tessuto pesante, cuciture precise, numero stampato perfettamente. Ho tirato fuori quella che avevo comprato in negozio a 120€ e messo le due fianco a fianco. Non vedo la differenza. È arrivata in meno di 48 ore, con un packaging curato come fosse un regalo di lusso. È già il mio quinto ordine su Goal Mania e ogni volta rimango stupito dalla costanza della qualità. Se stai ancora esitando per via del prezzo, fidati: smettila di aspettare.`,
};

const REVIEWS = [
  {
    initials: "MR",
    name: "Marco Rossi",
    city: "Milano",
    stars: 5,
    date: "22 mag 2026",
    text: "Maglia arrivata in meno di 48 ore, qualità impeccabile. È la terza che compro su Goal Mania e ogni volta rimango soddisfatto.",
    product: "Inter Home 2025/26",
    color: "#5f73d6",
    repeatBuyer: true,
    repeatCount: 3,
    helpful: 31,
  },
  {
    initials: "SB",
    name: "Sofia Bianchi",
    city: "Roma",
    stars: 5,
    date: "20 mag 2026",
    text: "Finalmente un e-commerce di maglie serio in Italia. Ho ordinato la maglia della Roma personalizzata e il risultato è straordinario. Consigliatissimo!",
    product: "Roma Away 2025/26",
    color: "#d47070",
    repeatBuyer: false,
    helpful: 24,
  },
  {
    initials: "LV",
    name: "Lorenzo Verdi",
    city: "Napoli",
    stars: 5,
    date: "15 mag 2026",
    text: "Prezzo ottimo, spedizione rapidissima. Il packaging è curatissimo e la maglia era esattamente come descritta. Goal Mania è il mio riferimento.",
    product: "Napoli Home 2025/26",
    color: "#4fa0d0",
    repeatBuyer: false,
    helpful: 19,
  },
  {
    initials: "GF",
    name: "Giulia F.",
    city: "Torino",
    stars: 5,
    date: "12 mag 2026",
    text: "Regalo per il compleanno di mio figlio. Era così entusiasta che ne vuole già un'altra. Qualità eccezionale, packaging da regalo perfetto, consegnata in 24h. Tornerò sicuramente!",
    product: "Milan Home 2025/26",
    color: "#f59e0b",
    repeatBuyer: false,
    helpful: 38,
  },
  {
    initials: "AD",
    name: "Alessandro D.",
    city: "Firenze",
    stars: 5,
    date: "8 mag 2026",
    text: "Presa in vista dei Mondiali 2026. Tessuto tecnico perfetto, taglia esatta come da guida. Già la indosso per le partite con gli amici. A questo prezzo è assurdo non comprarla.",
    product: "Argentina Mondiale 2026",
    color: "#38bdf8",
    repeatBuyer: false,
    helpful: 22,
  },
  {
    initials: "DE",
    name: "Davide E.",
    city: "Palermo",
    stars: 5,
    date: "3 mag 2026",
    text: "La maglia del Napoli scudetto 1987 — quella con il numero 10 di Maradona — è semplicemente perfetta. Hanno riprodotto ogni dettaglio. La tengo in cornice. Incredibile a questo prezzo.",
    product: "Napoli Retro 1987",
    color: "#34d399",
    repeatBuyer: true,
    repeatCount: 4,
    helpful: 55,
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function Stars({ count, size = 14 }: { count: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < count ? "#c8f000" : "transparent"}
          color={i < count ? "#c8f000" : "rgba(255,255,255,0.15)"}
        />
      ))}
    </div>
  );
}

function VerifiedBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[1.5px] px-2 py-0.5 rounded-full"
      style={{
        fontFamily: "var(--font-mono, monospace)",
        background: "rgba(200,240,0,0.06)",
        border: "1px solid rgba(200,240,0,0.18)",
        color: "rgba(200,240,0,0.65)",
      }}
    >
      <CheckCircle size={9} />
      Acquisto verificato
    </span>
  );
}

function RepeatBadge({ count }: { count: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[1.5px] px-2 py-0.5 rounded-full"
      style={{
        fontFamily: "var(--font-mono, monospace)",
        background: "rgba(200,240,0,0.1)",
        border: "1px solid rgba(200,240,0,0.25)",
        color: "#c8f000",
      }}
    >
      <RefreshCw size={9} />
      {count}° acquisto
    </span>
  );
}

function Avatar({
  initials,
  color,
  size = 40,
}: {
  initials: string;
  color: string;
  size?: number;
}) {
  return (
    <div
      className="flex-shrink-0 flex items-center justify-center rounded-full font-black"
      style={{
        width: size,
        height: size,
        background: `${color}20`,
        border: `1.5px solid ${color}45`,
        color,
        fontFamily: "var(--font-display, sans-serif)",
        fontSize: size * 0.35,
      }}
    >
      {initials}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function SocialProofSection() {
  const [helpfulClicked, setHelpfulClicked] = useState<Record<string, boolean>>({});

  const toggleHelpful = (key: string) =>
    setHelpfulClicked((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <section className="py-16 md:py-24 relative overflow-hidden" style={{ background: "#080808" }}>
      {/* Faint top border */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(200,240,0,0.15), transparent)" }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">

          {/* Left: title + score */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-6 h-[1.5px] rounded-full" style={{ background: "#c8f000" }} />
              <span
                className="text-[10px] uppercase tracking-[4px]"
                style={{ fontFamily: "var(--font-mono, monospace)", color: "#c8f000" }}
              >
                // Recensioni Verificate
              </span>
              <span className="w-6 h-[1.5px] rounded-full" style={{ background: "#c8f000" }} />
            </div>

            <h2
              className="font-black uppercase text-white leading-tight mb-4"
              style={{
                fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
                fontSize: "clamp(2rem, 4vw, 3.2rem)",
                letterSpacing: "1px",
              }}
            >
              Cosa dicono i nostri{" "}
              <span style={{ color: "#c8f000" }}>clienti</span>
            </h2>

            {/* Score row */}
            <div className="flex items-center gap-3 flex-wrap">
              <Stars count={5} size={18} />
              <span
                className="text-3xl font-black text-white"
                style={{ fontFamily: "var(--font-display, sans-serif)" }}
              >
                {AGGREGATE.score}
              </span>
              <span
                className="text-sm"
                style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-body, sans-serif)" }}
              >
                / 5
              </span>
              <span
                className="text-xs uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-mono, monospace)" }}
              >
                · {AGGREGATE.total.toLocaleString("it-IT")} recensioni ·
              </span>
              <span
                className="flex items-center gap-1 text-xs"
                style={{ color: "rgba(200,240,0,0.7)", fontFamily: "var(--font-mono, monospace)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#c8f000" }} />
                Verificate
              </span>
            </div>
          </div>

          {/* Right: rating distribution bars */}
          <div className="flex flex-col gap-1.5 min-w-[200px] lg:min-w-[240px]">
            {RATING_BARS.map(({ stars, pct }) => (
              <div key={stars} className="flex items-center gap-2">
                <Stars count={stars} size={10} />
                <div
                  className="flex-1 h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: pct > 50
                        ? "linear-gradient(90deg, #c8f000, rgba(200,240,0,0.7))"
                        : "rgba(200,240,0,0.35)",
                    }}
                  />
                </div>
                <span
                  className="text-[10px] w-7 text-right tabular-nums"
                  style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.3)" }}
                >
                  {pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Featured hero testimonial ───────────────────────────── */}
        <div
          className="rounded-2xl p-7 md:p-9 mb-8 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #141414 0%, #0f0f0f 100%)",
            border: "1.5px solid rgba(200,240,0,0.2)",
          }}
        >
          {/* Accent top line */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: "linear-gradient(90deg, transparent, #c8f000, transparent)" }}
          />
          {/* Glow */}
          <div
            className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(200,240,0,0.05) 0%, transparent 70%)" }}
          />
          {/* Big quote mark */}
          <div
            className="absolute top-5 right-7 text-8xl font-black leading-none select-none pointer-events-none"
            style={{ color: "rgba(200,240,0,0.05)", fontFamily: "var(--font-display, sans-serif)" }}
          >
            "
          </div>

          <div className="relative">
            {/* Top row: badges */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <Stars count={FEATURED.stars} size={16} />
              <VerifiedBadge />
              {FEATURED.repeatBuyer && <RepeatBadge count={FEATURED.repeatCount!} />}
              <span
                className="text-[10px] uppercase tracking-widest ml-auto"
                style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.2)" }}
              >
                {FEATURED.date}
              </span>
            </div>

            {/* Review text */}
            <p
              className="text-base md:text-lg leading-relaxed mb-5"
              style={{
                fontFamily: "var(--font-body, sans-serif)",
                color: "rgba(255,255,255,0.78)",
                fontStyle: "italic",
              }}
            >
              "{FEATURED.text}"
            </p>

            {/* Bottom row: product + author + helpful */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar initials={FEATURED.initials} color={FEATURED.color} size={46} />
                <div>
                  <p
                    className="text-sm font-black text-white leading-tight"
                    style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "0.5px" }}
                  >
                    {FEATURED.name}
                  </p>
                  <p
                    className="text-[10px] uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.3)" }}
                  >
                    {FEATURED.city} · Cliente verificato
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className="text-[10px] px-3 py-1.5 rounded-full uppercase tracking-widest"
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    color: "rgba(200,240,0,0.6)",
                    background: "rgba(200,240,0,0.06)",
                    border: "1px solid rgba(200,240,0,0.12)",
                  }}
                >
                  {FEATURED.product}
                </span>
                <button
                  onClick={() => toggleHelpful("featured")}
                  className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest transition-colors duration-200"
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    color: helpfulClicked["featured"] ? "#c8f000" : "rgba(255,255,255,0.25)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <ThumbsUp size={11} />
                  Utile ({helpfulClicked["featured"] ? FEATURED.helpful + 1 : FEATURED.helpful})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Review grid ─────────────────────────────────────────── */}
        {/* Mobile: horizontal scroll; Desktop: 3-col grid */}
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
        >
          {REVIEWS.map((r) => (
            <div
              key={r.name}
              className="flex flex-col gap-3 p-5 rounded-2xl relative overflow-hidden"
              style={{
                background: "#111",
                border: "1px solid rgba(255,255,255,0.06)",
                transition: "border-color 250ms ease, transform 250ms cubic-bezier(0.23,1,0.32,1)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(200,240,0,0.2)";
                el.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(255,255,255,0.06)";
                el.style.transform = "translateY(0)";
              }}
            >
              {/* Quote accent */}
              <div
                className="absolute top-3 right-4 text-5xl font-black leading-none select-none pointer-events-none"
                style={{ color: "rgba(200,240,0,0.04)", fontFamily: "var(--font-display, sans-serif)" }}
              >
                "
              </div>

              {/* Top: stars + date */}
              <div className="flex items-center justify-between">
                <Stars count={r.stars} size={12} />
                <span
                  className="text-[9px] uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.2)" }}
                >
                  {r.date}
                </span>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <VerifiedBadge />
                {r.repeatBuyer && r.repeatCount && <RepeatBadge count={r.repeatCount} />}
              </div>

              {/* Text */}
              <p
                className="text-sm leading-relaxed flex-1"
                style={{ fontFamily: "var(--font-body, sans-serif)", color: "rgba(255,255,255,0.62)" }}
              >
                "{r.text}"
              </p>

              {/* Product tag */}
              <div
                className="text-[9px] px-2.5 py-1 rounded-full uppercase tracking-widest self-start"
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  color: "rgba(200,240,0,0.55)",
                  background: "rgba(200,240,0,0.05)",
                  border: "1px solid rgba(200,240,0,0.1)",
                }}
              >
                {r.product}
              </div>

              {/* Author row + helpful */}
              <div
                className="flex items-center justify-between pt-2"
                style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
              >
                <div className="flex items-center gap-2.5">
                  <Avatar initials={r.initials} color={r.color} size={34} />
                  <div>
                    <p
                      className="text-xs font-bold text-white leading-tight"
                      style={{ fontFamily: "var(--font-display, sans-serif)" }}
                    >
                      {r.name}
                    </p>
                    <p
                      className="text-[9px] uppercase tracking-widest"
                      style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.28)" }}
                    >
                      {r.city}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleHelpful(r.name)}
                  className="flex items-center gap-1 text-[9px] uppercase tracking-widest transition-colors duration-200"
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    color: helpfulClicked[r.name] ? "#c8f000" : "rgba(255,255,255,0.2)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <ThumbsUp size={10} />
                  {helpfulClicked[r.name] ? r.helpful + 1 : r.helpful}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA ─────────────────────────────────────────────────── */}
        <div className="text-center mt-12">
          <p
            className="text-xs uppercase tracking-[3px] mb-5"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.2)" }}
          >
            Unisciti a {AGGREGATE.total.toLocaleString("it-IT")} clienti soddisfatti
          </p>

          {/* "Leggi tutte" → opens ReviewsStrip at top of page */}
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent("goal-mania:open-reviews"));
              // Scroll to strip after it opens (brief delay for state update)
              setTimeout(() => {
                const strip = document.querySelector("[data-reviews-strip]");
                if (strip) strip.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 120);
            }}
            className="inline-flex items-center gap-2 text-sm uppercase tracking-widest transition-colors duration-200 mb-6"
            style={{
              fontFamily: "var(--font-mono, monospace)",
              color: "rgba(200,240,0,0.6)",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "block",
              margin: "0 auto 24px",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#c8f000"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(200,240,0,0.6)"; }}
          >
            <span className="flex items-center gap-2 justify-center">
              <ChevronUp size={14} />
              Leggi tutte le {AGGREGATE.total.toLocaleString("it-IT")} recensioni
              <ChevronUp size={14} />
            </span>
          </button>

          <Link
            href="/shop"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-black uppercase transition-all duration-300 hover:-translate-y-1"
            style={{
              background: "#c8f000",
              color: "#0a0a0a",
              fontFamily: "var(--font-display, sans-serif)",
              letterSpacing: "2px",
              fontSize: "0.85rem",
              boxShadow: "0 4px 24px rgba(200,240,0,0.3)",
            }}
          >
            Scopri le Maglie →
          </Link>
          <p
            className="mt-4 text-[10px] uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.15)" }}
          >
            Spedizione gratuita · Reso entro 30 giorni · Pagamento sicuro
          </p>
        </div>
      </div>
    </section>
  );
}
