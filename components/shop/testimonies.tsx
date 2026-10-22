"use client";

import React, { useEffect, useRef } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import { useRealReviews, type RealReview } from "@/lib/hooks/useRealReviews";

const CAROUSEL_DURATION_S = 40;

function ReviewCard({ review }: { review: RealReview }) {
  return (
    <div
      className="flex-shrink-0 mx-2 rounded-2xl p-4 flex flex-col gap-3"
      style={{
        width: "260px",
        background: "#111",
        border: "1px solid rgba(255,255,255,0.07)",
        cursor: "default",
      }}
    >
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={13}
            fill={i < review.rating ? "#c8f000" : "rgba(200,240,0,0.15)"}
            stroke="none"
          />
        ))}
      </div>

      <p
        className="text-[13px] leading-relaxed flex-1"
        style={{ color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-body, sans-serif)" }}
      >
        "{review.comment}"
      </p>

      {review.productName && (
        <div
          className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider self-start"
          style={{ background: "rgba(200,240,0,0.08)", color: "rgba(200,240,0,0.6)", fontFamily: "var(--font-mono, monospace)", border: "1px solid rgba(200,240,0,0.12)" }}
        >
          {review.productName}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
            style={{ background: "rgba(200,240,0,0.12)", color: "#c8f000", fontFamily: "var(--font-display, sans-serif)" }}
          >
            {review.userName[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-bold text-white flex items-center gap-1" style={{ fontFamily: "var(--font-display, sans-serif)" }}>
              {review.userName}
              <CheckCircle2 size={11} fill="#22c55e" stroke="white" strokeWidth={1.5} />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const Testimonies = () => {
  const { reviews } = useRealReviews();
  const scrollRef   = useRef<HTMLDivElement>(null);
  const rafRef      = useRef<number>(0);
  const posRef      = useRef(0);
  const isDragging  = useRef(false);
  const dragStartX  = useRef(0);
  const scrollAtDrag = useRef(0);
  const lastTs      = useRef(0);
  const isPaused    = useRef(false);
  const dragMoved   = useRef(0);

  const doubled = [...reviews, ...reviews];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || reviews.length === 0) return;

    function tick(ts: number) {
      const el = scrollRef.current;
      if (!el) { rafRef.current = requestAnimationFrame(tick); return; }
      if (!isDragging.current && !isPaused.current) {
        if (lastTs.current === 0) lastTs.current = ts;
        const dt = Math.min(ts - lastTs.current, 64);
        lastTs.current = ts;
        const half = el.scrollWidth / 2;
        if (half === 0) { rafRef.current = requestAnimationFrame(tick); return; }
        posRef.current += (half / CAROUSEL_DURATION_S) * (dt / 1000);
        if (posRef.current >= half) posRef.current -= half;
        el.scrollLeft = posRef.current;
      } else {
        lastTs.current = ts;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    const onMove = (e: PointerEvent) => {
      if (!isDragging.current || !scrollRef.current) return;
      const delta = dragStartX.current - e.clientX;
      dragMoved.current = Math.abs(delta);
      const half = scrollRef.current.scrollWidth / 2;
      let np = scrollAtDrag.current + delta;
      if (np < 0) np += half;
      if (np >= half * 2) np -= half;
      scrollRef.current.scrollLeft = np;
      posRef.current = np;
    };
    const onUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      if (scrollRef.current) scrollRef.current.style.cursor = "grab";
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
    };
  }, [reviews.length]);

  // Nothing fabricated to show until real reviews exist
  if (reviews.length === 0) return null;

  return (
    <section className="py-14 relative overflow-hidden" style={{ background: "#0a0a0a", borderTop: "0.5px solid rgba(255,255,255,0.05)" }}>
      {/* Edge fades */}
      <div className="absolute inset-y-0 left-0 w-12 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, #0a0a0a, transparent)" }} />
      <div className="absolute inset-y-0 right-0 w-12 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, #0a0a0a, transparent)" }} />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-4 h-[1.5px] rounded-full inline-block" style={{ background: "#c8f000" }} />
          <span className="text-[9px] uppercase tracking-[3px] font-bold" style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.6)" }}>
            // Verificati
          </span>
        </div>
        <div className="flex items-end justify-between flex-wrap gap-3">
          <h2
            className="font-black uppercase text-white"
            style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", letterSpacing: "-0.5px" }}
          >
            I Nostri Clienti Felici
          </h2>
        </div>
      </div>

      {/* Carousel */}
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
        onMouseEnter={() => { isPaused.current = true;  lastTs.current = 0; }}
        onMouseLeave={() => { isPaused.current = false; }}
        onPointerDown={(e) => {
          isDragging.current = true;
          dragMoved.current  = 0;
          dragStartX.current = e.clientX;
          scrollAtDrag.current = scrollRef.current?.scrollLeft ?? 0;
          e.currentTarget.style.cursor = "grabbing";
        }}
      >
        <div className="flex py-2" style={{ width: "max-content" }}>
          {doubled.map((r, i) => (
            <ReviewCard key={`${r.id}-${i}`} review={r} />
          ))}
        </div>
        <style jsx>{`div::-webkit-scrollbar{display:none}`}</style>
      </div>

      <p className="text-center mt-3 text-[9px] uppercase tracking-[2px]" style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.15)" }}>
        ← trascina per leggere tutte le recensioni →
      </p>
    </section>
  );
};

export default Testimonies;
