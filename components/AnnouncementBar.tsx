"use client";

import { useState, useEffect, useRef } from "react";

// Exported so Header and template can stay in sync
export const ANNOUNCEMENT_BAR_HEIGHT = 40;

const PROMOS = [
  { text: "🚚 SPEDIZIONE GRATUITA su tutti gli ordini — senza minimo", href: "/shop" },
  { text: "🎁 PRENDI 3 PAGHI 2 su tutte le maglie", href: "/shop" },
  { text: "⚡ MAGLIE DA CALCIO A 30€ — oltre 500 modelli disponibili", href: "/shop" },
  { text: "🔄 RESO GRATUITO entro 30 giorni — acquisto senza rischi", href: "/shop" },
  { text: "🏆 MONDIALI 2026 — Vesti la tua Nazionale adesso", href: "/shop/worldcup" },
  { text: "⭐ 4.9/5 — oltre 10.000 clienti soddisfatti", href: "/shop" },
];

const SALE_DURATION = 30 * 60;

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function AnnouncementBar() {
  const [countdown, setCountdown] = useState(SALE_DURATION);

  // Scroll refs — same pattern as TeamLogoTicker Strip
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const posRef = useRef(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollAtDragStart = useRef(0);
  const lastTs = useRef(0);
  const isPaused = useRef(false);
  const didDrag = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  // JS-driven auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    posRef.current = 0;
    el.scrollLeft = 0;

    function tick(ts: number) {
      const el = scrollRef.current;
      if (!el) { rafRef.current = requestAnimationFrame(tick); return; }
      if (!isDragging.current && !isPaused.current) {
        if (lastTs.current === 0) lastTs.current = ts;
        const dt = Math.min(ts - lastTs.current, 64);
        lastTs.current = ts;
        const halfWidth = el.scrollWidth / 2;
        const speed = halfWidth / 30; // full loop every 30s
        posRef.current += speed * (dt / 1000);
        if (posRef.current >= halfWidth) posRef.current -= halfWidth;
        el.scrollLeft = posRef.current;
      } else {
        lastTs.current = ts;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  function onMouseEnter() { isPaused.current = true; lastTs.current = 0; }
  function onMouseLeave() { isPaused.current = false; }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    isDragging.current = true;
    didDrag.current = false;
    dragStartX.current = e.clientX;
    scrollAtDragStart.current = scrollRef.current?.scrollLeft ?? 0;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.style.cursor = "grabbing";
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging.current || !scrollRef.current) return;
    const el = scrollRef.current;
    const delta = dragStartX.current - e.clientX;
    if (Math.abs(delta) > 4) didDrag.current = true;
    const halfWidth = el.scrollWidth / 2;
    let newPos = scrollAtDragStart.current + delta;
    if (newPos < 0) newPos += halfWidth;
    if (newPos >= halfWidth * 2) newPos -= halfWidth;
    el.scrollLeft = newPos;
    posRef.current = newPos;
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    isDragging.current = false;
    e.currentTarget.style.cursor = "grab";
    // Click without drag → navigate
    if (!didDrag.current) {
      const target = e.target as HTMLElement;
      const item = target.closest("[data-href]") as HTMLElement | null;
      if (item?.dataset?.href) window.location.href = item.dataset.href;
    }
  }

  const items = [...PROMOS, ...PROMOS];
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div
      className="fixed left-0 right-0 z-[61] overflow-hidden"
      style={{
        top: 0,
        height: `${ANNOUNCEMENT_BAR_HEIGHT}px`,
        background: "#c8f000",
      }}
    >
      <div className="flex items-center h-full">
        {/* ── Scrollable ticker ── */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-x-scroll h-full flex items-center"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            cursor: "grab",
            userSelect: "none",
            WebkitOverflowScrolling: "touch",
          } as React.CSSProperties}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="flex items-center h-full" style={{ width: "max-content" }}>
            {items.map((promo, i) => (
              <div
                key={i}
                data-href={promo.href}
                className="flex-shrink-0 flex items-center"
                style={{ paddingLeft: "2rem", paddingRight: "1rem" }}
              >
                <span
                  className="text-[11px] font-black uppercase whitespace-nowrap"
                  style={{
                    fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
                    letterSpacing: "1.5px",
                    color: "#0a0a0a",
                    pointerEvents: "none",
                  }}
                >
                  {promo.text}
                </span>
                <span
                  className="ml-5 select-none flex-shrink-0"
                  style={{ color: "rgba(0,0,0,0.2)", fontSize: "9px", pointerEvents: "none" }}
                >
                  ★
                </span>
              </div>
            ))}
          </div>
          <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>
        </div>

        {/* ── Countdown — fixed right ── */}
        <div
          className="hidden sm:flex items-center gap-2 flex-shrink-0 px-4 h-full"
          style={{ borderLeft: "1px solid rgba(0,0,0,0.12)" }}
        >
          <span
            className="whitespace-nowrap"
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "9px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: "rgba(0,0,0,0.55)",
            }}
          >
            🔥 scade tra
          </span>
          <span
            className="font-black text-sm px-2 py-0.5 rounded"
            style={{
              fontFamily: "var(--font-mono, monospace)",
              background: "rgba(0,0,0,0.12)",
              color: "#0a0a0a",
            }}
          >
            {pad(minutes)}:{pad(seconds)}
          </span>
        </div>
      </div>
    </div>
  );
}
