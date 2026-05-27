"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Conversion-focused promos — no dismiss, always visible
const PROMOS = [
  { text: "🚚 SPEDIZIONE GRATUITA su tutti gli ordini — senza minimo", href: "/shop" },
  { text: "🎁 PRENDI 3 PAGHI 2 su tutte le maglie", href: "/shop" },
  { text: "⚡ MAGLIE DA CALCIO A 30€ — oltre 500 modelli disponibili", href: "/shop" },
  { text: "🔄 RESO GRATUITO entro 30 giorni — acquisto senza rischi", href: "/shop" },
  { text: "🏆 MONDIALI 2026 — Vesti la tua Nazionale adesso", href: "/shop/worldcup" },
  { text: "⭐ 4.9/5 — oltre 10.000 clienti soddisfatti", href: "/shop" },
];

const SALE_DURATION = 30 * 60; // 30 min

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function AnnouncementBar() {
  const [countdown, setCountdown] = useState(SALE_DURATION);

  useEffect(() => {
    const id = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  // Duplicate content for seamless infinite scroll
  const items = [...PROMOS, ...PROMOS];

  return (
    <div
      className="relative z-[61] overflow-hidden"
      style={{ background: "#c8f000" }}
    >
      <div className="flex items-center" style={{ height: "36px" }}>
        {/* ── Scrolling marquee ── */}
        <div className="flex-1 overflow-hidden relative">
          <div
            style={{
              display: "flex",
              width: "max-content",
              animation: "gmMarquee 32s linear infinite",
              willChange: "transform",
            }}
          >
            {items.map((promo, i) => (
              <Link
                key={i}
                href={promo.href}
                className="flex-shrink-0 flex items-center hover:opacity-75 transition-opacity"
                style={{ paddingLeft: "2rem", paddingRight: "1rem" }}
              >
                <span
                  className="text-[11px] font-black uppercase whitespace-nowrap"
                  style={{
                    fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
                    letterSpacing: "1.5px",
                    color: "#0a0a0a",
                  }}
                >
                  {promo.text}
                </span>
                <span
                  className="ml-4 select-none flex-shrink-0"
                  style={{ color: "rgba(0,0,0,0.25)", fontSize: "10px" }}
                >
                  ★
                </span>
              </Link>
            ))}
          </div>
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

      <style jsx global>{`
        @keyframes gmMarquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes gmMarquee { 0%, 100% { transform: translateX(0); } }
        }
      `}</style>
    </div>
  );
}
