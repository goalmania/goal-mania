"use client";

import { useState, useEffect, useRef } from "react";
import { Star, X, CheckCircle, RefreshCw } from "lucide-react";

// ─── Review data (shared with SocialProofSection) ─────────────────────────────

interface StripReview {
  initials: string;
  name: string;
  city: string;
  color: string;
  stars: number;
  text: string;
  product: string;
  repeatBuyer?: boolean;
  repeatCount?: number;
}

const STRIP_REVIEWS: StripReview[] = [
  {
    initials: "GT",
    name: "Giuseppe T.",
    city: "Torino",
    color: "#a78bfa",
    stars: 5,
    text: "Ero molto scettico — per meno di 30€ mi aspettavo una maglia da mercato. Quando ho aperto il pacco ero letteralmente senza parole. Ho confrontato con quella comprata in negozio a 120€: non vedo la differenza.",
    product: "Juventus Home 2025/26",
    repeatBuyer: true,
    repeatCount: 5,
  },
  {
    initials: "MR",
    name: "Marco Rossi",
    city: "Milano",
    color: "#5f73d6",
    stars: 5,
    text: "Maglia arrivata in meno di 48 ore, qualità impeccabile. È la terza che compro su Goal Mania e ogni volta rimango soddisfatto.",
    product: "Inter Home 2025/26",
    repeatBuyer: true,
    repeatCount: 3,
  },
  {
    initials: "SB",
    name: "Sofia Bianchi",
    city: "Roma",
    color: "#d47070",
    stars: 5,
    text: "Finalmente un e-commerce di maglie serio in Italia. Ho ordinato la maglia della Roma personalizzata e il risultato è straordinario. Consigliatissimo!",
    product: "Roma Away 2025/26",
  },
  {
    initials: "LV",
    name: "Lorenzo Verdi",
    city: "Napoli",
    color: "#4fa0d0",
    stars: 5,
    text: "Prezzo ottimo, spedizione rapidissima. Il packaging è curatissimo e la maglia era esattamente come descritta. Goal Mania è il mio riferimento.",
    product: "Napoli Home 2025/26",
  },
  {
    initials: "GF",
    name: "Giulia F.",
    city: "Torino",
    color: "#f59e0b",
    stars: 5,
    text: "Regalo per il compleanno di mio figlio. Era così entusiasta che ne vuole già un'altra. Qualità eccezionale, packaging da regalo, consegnata in 24h.",
    product: "Milan Home 2025/26",
  },
  {
    initials: "AD",
    name: "Alessandro D.",
    city: "Firenze",
    color: "#38bdf8",
    stars: 5,
    text: "Presa in vista dei Mondiali 2026. Tessuto tecnico perfetto, taglia esatta come da guida. A questo prezzo è assurdo non comprarla.",
    product: "Argentina Mondiale 2026",
  },
  {
    initials: "DE",
    name: "Davide E.",
    city: "Palermo",
    color: "#34d399",
    stars: 5,
    text: "La maglia del Napoli scudetto 1987 — quella con il numero 10 di Maradona — è semplicemente perfetta. Hanno riprodotto ogni dettaglio. La tengo in cornice.",
    product: "Napoli Retro 1987",
    repeatBuyer: true,
    repeatCount: 4,
  },
  {
    initials: "MC",
    name: "Matteo C.",
    city: "Milano",
    color: "#f472b6",
    stars: 5,
    text: "La maglia del PSG è bellissima. Tessuto leggero, colori vividi, cuciture precise. Spedita il giorno stesso dell'ordine. Tornerò sicuramente.",
    product: "PSG Away 2025/26",
  },
  {
    initials: "AR",
    name: "Anna R.",
    city: "Venezia",
    color: "#fb923c",
    stars: 5,
    text: "Ordinata per mio marito tifoso del Liverpool, arrivata in soli 2 giorni. Era senza parole. Il packaging sembrava un acquisto da boutique premium.",
    product: "Liverpool Home 2025/26",
  },
  {
    initials: "LB",
    name: "Luca B.",
    city: "Roma",
    color: "#60a5fa",
    stars: 5,
    text: "Il numero 10 di Maradona con l'Argentina del Mondiale 1986. Perfetta sotto ogni aspetto: tessuto, stampa, vestibilità. Un pezzo da collezione.",
    product: "Argentina Retro 1986",
    repeatBuyer: true,
    repeatCount: 2,
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={11}
          fill={i < count ? "#c8f000" : "transparent"}
          color={i < count ? "#c8f000" : "rgba(255,255,255,0.15)"}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: StripReview }) {
  return (
    <div
      className="flex-shrink-0 flex flex-col gap-2.5 p-4 rounded-xl mx-2"
      style={{
        width: "272px",
        background: "#111",
        border: "1px solid rgba(255,255,255,0.07)",
        pointerEvents: "none", // drag handled by parent
      }}
      draggable={false}
    >
      {/* Stars + badges row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Stars count={review.stars} />
        {review.repeatBuyer && review.repeatCount && (
          <span
            className="inline-flex items-center gap-1 text-[8px] uppercase tracking-[1px] px-1.5 py-0.5 rounded-full"
            style={{
              fontFamily: "var(--font-mono, monospace)",
              background: "rgba(200,240,0,0.08)",
              border: "1px solid rgba(200,240,0,0.2)",
              color: "#c8f000",
            }}
          >
            <RefreshCw size={7} />
            {review.repeatCount}° acquisto
          </span>
        )}
      </div>

      {/* Text — 3 lines max */}
      <p
        className="text-xs leading-relaxed"
        style={{
          fontFamily: "var(--font-body, sans-serif)",
          color: "rgba(255,255,255,0.6)",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        "{review.text}"
      </p>

      {/* Product tag */}
      <span
        className="text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider self-start"
        style={{
          fontFamily: "var(--font-mono, monospace)",
          color: "rgba(200,240,0,0.5)",
          background: "rgba(200,240,0,0.05)",
          border: "1px solid rgba(200,240,0,0.1)",
        }}
      >
        {review.product}
      </span>

      {/* Author */}
      <div className="flex items-center gap-2 mt-auto pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-full font-black text-[10px]"
          style={{
            width: 28,
            height: 28,
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
            className="text-xs font-bold text-white leading-tight"
            style={{ fontFamily: "var(--font-display, sans-serif)" }}
          >
            {review.name}
          </p>
          <div className="flex items-center gap-1">
            <CheckCircle size={8} style={{ color: "rgba(200,240,0,0.5)" }} />
            <p
              className="text-[9px] uppercase tracking-wider"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.28)" }}
            >
              {review.city} · verificato
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Scrolling strip (identical mechanics to TeamLogoTicker) ───────────────────

const DURATION_S = 38; // seconds per full cycle

function ScrollStrip() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const posRef = useRef(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollAtDragStart = useRef(0);
  const lastTs = useRef(0);
  const isPaused = useRef(false);
  const dragMoved = useRef(0);

  const doubled = [...STRIP_REVIEWS, ...STRIP_REVIEWS];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    requestAnimationFrame(() => {
      el.scrollLeft = 0;
      posRef.current = 0;
    });

    function tick(ts: number) {
      const el = scrollRef.current;
      if (!el) { rafRef.current = requestAnimationFrame(tick); return; }

      if (!isDragging.current && !isPaused.current) {
        if (lastTs.current === 0) lastTs.current = ts;
        const dt = Math.min(ts - lastTs.current, 64);
        lastTs.current = ts;
        const halfWidth = el.scrollWidth / 2;
        if (halfWidth === 0) { rafRef.current = requestAnimationFrame(tick); return; }
        const speed = halfWidth / DURATION_S;
        const delta = speed * (dt / 1000);
        posRef.current += delta;
        if (posRef.current >= halfWidth) posRef.current -= halfWidth;
        el.scrollLeft = posRef.current;
      } else {
        lastTs.current = ts;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current || !scrollRef.current) return;
      const el = scrollRef.current;
      const delta = dragStartX.current - e.clientX;
      dragMoved.current = Math.abs(delta);
      const halfWidth = el.scrollWidth / 2;
      let newPos = scrollAtDragStart.current + delta;
      if (newPos < 0) newPos += halfWidth;
      if (newPos >= halfWidth * 2) newPos -= halfWidth;
      el.scrollLeft = newPos;
      posRef.current = newPos;
    };

    const handlePointerUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      if (scrollRef.current) scrollRef.current.style.cursor = "grab";
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerUp);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);
    };
  }, []);

  return (
    <div
      ref={scrollRef}
      className="overflow-x-scroll"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        cursor: "grab",
        userSelect: "none",
        WebkitOverflowScrolling: "touch",
      } as React.CSSProperties}
      onMouseEnter={() => { isPaused.current = true; lastTs.current = 0; }}
      onMouseLeave={() => { isPaused.current = false; }}
      onPointerDown={(e) => {
        isDragging.current = true;
        dragMoved.current = 0;
        dragStartX.current = e.clientX;
        scrollAtDragStart.current = scrollRef.current?.scrollLeft ?? 0;
        e.currentTarget.style.cursor = "grabbing";
      }}
    >
      <div className="flex py-3" style={{ width: "max-content" }}>
        {doubled.map((review, i) => (
          <ReviewCard key={`${review.initials}-${i}`} review={review} />
        ))}
      </div>
      <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function ReviewsStrip() {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => {
      setIsOpen(true);
      // Scroll to strip after CSS transition starts
      setTimeout(() => {
        wrapperRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    };
    window.addEventListener("goal-mania:open-reviews", handler);
    return () => window.removeEventListener("goal-mania:open-reviews", handler);
  }, []);

  return (
    <div
      ref={wrapperRef}
      aria-hidden={!isOpen}
      style={{
        maxHeight: isOpen ? "420px" : "0px",
        overflow: "hidden",
        transition: "max-height 550ms cubic-bezier(0.23,1,0.32,1)",
      }}
    >
      <section
        className="relative overflow-hidden select-none"
        style={{
          background: "#0a0a0a",
          borderTop: "0.5px solid rgba(200,240,0,0.12)",
          borderBottom: "0.5px solid rgba(200,240,0,0.12)",
          paddingTop: "20px",
          paddingBottom: "20px",
        }}
      >
        {/* Fade edges */}
        <div
          className="absolute inset-y-0 left-0 w-16 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, #0a0a0a, transparent)" }}
        />
        <div
          className="absolute inset-y-0 right-0 w-16 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, #0a0a0a, transparent)" }}
        />

        {/* Header row */}
        <div className="relative z-20 flex items-center justify-center gap-3 mb-4 px-6">
          <span className="w-6 h-[1.5px] rounded-full" style={{ background: "#c8f000" }} />
          <span
            className="text-[10px] uppercase tracking-[4px]"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.75)" }}
          >
            // Tutte le Recensioni
          </span>
          <span className="w-6 h-[1.5px] rounded-full" style={{ background: "#c8f000" }} />

          {/* Close button */}
          <button
            aria-label="Chiudi recensioni"
            onClick={() => setIsOpen(false)}
            className="absolute right-4 flex items-center justify-center rounded-full transition-colors duration-200"
            style={{
              width: 28,
              height: 28,
              background: "rgba(200,240,0,0.06)",
              border: "1px solid rgba(200,240,0,0.15)",
              color: "rgba(200,240,0,0.55)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(200,240,0,0.14)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(200,240,0,0.06)"; }}
          >
            <X size={13} />
          </button>
        </div>

        {/* Scrolling strip */}
        <ScrollStrip />

        {/* Hint */}
        <p
          className="text-center mt-3 text-[9px] uppercase tracking-[2px] relative z-20"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.15)" }}
        >
          ← trascina per scorrere →
        </p>
      </section>
    </div>
  );
}
