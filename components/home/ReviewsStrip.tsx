"use client";

import { useState, useEffect, useRef } from "react";
import { Star, X, CheckCircle } from "lucide-react";
import { useRealReviews, type RealReview } from "@/lib/hooks/useRealReviews";

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

const AVATAR_COLORS = ["#a78bfa", "#5f73d6", "#d47070", "#f59e0b", "#38bdf8", "#34d399", "#f472b6", "#fb923c", "#60a5fa"];

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function ReviewCard({ review }: { review: RealReview }) {
  const color = colorFor(review.userName);
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
      <Stars count={review.rating} />

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
        "{review.comment}"
      </p>

      {review.productName && (
        <span
          className="text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider self-start"
          style={{
            fontFamily: "var(--font-mono, monospace)",
            color: "rgba(200,240,0,0.5)",
            background: "rgba(200,240,0,0.05)",
            border: "1px solid rgba(200,240,0,0.1)",
          }}
        >
          {review.productName}
        </span>
      )}

      <div className="flex items-center gap-2 mt-auto pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-full font-black text-[10px]"
          style={{
            width: 28,
            height: 28,
            background: `${color}20`,
            border: `1.5px solid ${color}40`,
            color,
            fontFamily: "var(--font-display, sans-serif)",
          }}
        >
          {review.userName[0]?.toUpperCase()}
        </div>
        <div>
          <p
            className="text-xs font-bold text-white leading-tight"
            style={{ fontFamily: "var(--font-display, sans-serif)" }}
          >
            {review.userName}
          </p>
          <div className="flex items-center gap-1">
            <CheckCircle size={8} style={{ color: "rgba(200,240,0,0.5)" }} />
            <p
              className="text-[9px] uppercase tracking-wider"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.28)" }}
            >
              verificato
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Scrolling strip (identical mechanics to TeamLogoTicker) ───────────────────

const DURATION_S = 38; // seconds per full cycle

function ScrollStrip({ reviews }: { reviews: RealReview[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const posRef = useRef(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollAtDragStart = useRef(0);
  const lastTs = useRef(0);
  const isPaused = useRef(false);
  const dragMoved = useRef(0);

  const doubled = [...reviews, ...reviews];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || reviews.length === 0) return;

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
  }, [reviews]);

  if (reviews.length === 0) return null;

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
          <ReviewCard key={`${review.id}-${i}`} review={review} />
        ))}
      </div>
      <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function ReviewsStrip() {
  const { reviews } = useRealReviews();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => {
      setIsOpen(true);
      setTimeout(() => {
        wrapperRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    };
    window.addEventListener("goal-mania:open-reviews", handler);
    return () => window.removeEventListener("goal-mania:open-reviews", handler);
  }, []);

  if (reviews.length === 0) return null;

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
          >
            <X size={14} />
          </button>
        </div>

        <ScrollStrip reviews={reviews} />
      </section>
    </div>
  );
}
