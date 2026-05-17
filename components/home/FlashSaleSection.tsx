"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, ShoppingBag, Clock, Flame } from "lucide-react";

const FLASH_DURATION_MINUTES = 15;

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function FlashSaleSection() {
  const [timeLeft, setTimeLeft] = useState(FLASH_DURATION_MINUTES * 60);
  const [stock, setStock] = useState(7);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <section className="py-12 md:py-16 bg-[#0a0a0a]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <span className="w-6 h-[1.5px] rounded-full inline-block" style={{ background: "#c8f000" }} />
          <span
            className="text-[10px] uppercase tracking-[4px]"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "#c8f000" }}
          >
            // Offerta Lampo
          </span>
          <span className="w-6 h-[1.5px] rounded-full inline-block" style={{ background: "#c8f000" }} />
        </div>

        <div
          className="rounded-2xl overflow-hidden relative"
          style={{
            border: "1.5px solid rgba(200,240,0,0.35)",
            background: "linear-gradient(135deg, #111 0%, #0d0d0d 100%)",
          }}
        >
          {/* Top lime accent */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: "linear-gradient(90deg, transparent, #c8f000, transparent)" }}
          />

          {/* Background glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 60% 50%, rgba(200,240,0,0.04) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 p-8 md:p-12">
            {/* Left: Product image area */}
            <div className="flex-shrink-0 w-full lg:w-72 flex items-center justify-center">
              <div
                className="relative w-56 h-64 lg:w-72 lg:h-80 rounded-xl overflow-hidden flex items-center justify-center"
                style={{ background: "rgba(200,240,0,0.04)", border: "1px solid rgba(200,240,0,0.1)" }}
              >
                <div className="text-center">
                  <div className="text-6xl mb-3">👕</div>
                  <span
                    className="text-xs uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.5)" }}
                  >
                    Maglia del Momento
                  </span>
                </div>
                {/* Sale badge */}
                <div
                  className="absolute top-3 left-3 px-3 py-1.5 rounded-full font-black text-xs uppercase"
                  style={{ background: "#c8f000", color: "#0a0a0a", fontFamily: "var(--font-display, sans-serif)", letterSpacing: "1px" }}
                >
                  -30%
                </div>
              </div>
            </div>

            {/* Right: Details */}
            <div className="flex-1 w-full">
              {/* Flash Sale Header */}
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{ background: "rgba(200,240,0,0.1)", border: "1px solid rgba(200,240,0,0.25)" }}
                >
                  <Zap className="w-3.5 h-3.5 animate-pulse" style={{ color: "#c8f000" }} />
                  <span
                    className="text-xs font-black uppercase tracking-[2px]"
                    style={{ fontFamily: "var(--font-display, sans-serif)", color: "#c8f000" }}
                  >
                    Offerta Lampo
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: "#ff4444", display: "inline-block" }}
                  />
                  <span
                    className="text-xs uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-mono, monospace)", color: "#ff4444" }}
                  >
                    LIVE
                  </span>
                </div>
              </div>

              <h2
                className="font-black uppercase text-white leading-tight mb-2"
                style={{
                  fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
                  fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                  letterSpacing: "1px",
                }}
              >
                Maglia Premier League{" "}
                <span style={{ color: "#c8f000" }}>2025/26</span>
              </h2>

              <p
                className="text-white/50 mb-6 text-sm leading-relaxed"
                style={{ fontFamily: "var(--font-body, sans-serif)" }}
              >
                Edizione speciale con patch Champions League. Disponibile in tutte le taglie.
                Spedizione express in 24h.
              </p>

              {/* Pricing */}
              <div className="flex items-center gap-4 mb-6">
                <span
                  className="font-black"
                  style={{
                    fontFamily: "var(--font-display, sans-serif)",
                    fontSize: "2.5rem",
                    color: "#c8f000",
                    lineHeight: 1,
                  }}
                >
                  €55,90
                </span>
                <div>
                  <span
                    className="text-white/30 line-through text-lg"
                    style={{ fontFamily: "var(--font-body, sans-serif)" }}
                  >
                    €79,90
                  </span>
                  <div
                    className="text-xs uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.6)" }}
                  >
                    Risparmi €24,00
                  </div>
                </div>
              </div>

              {/* Stock + Countdown */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                {/* Stock */}
                <div
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                  style={{ background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.2)" }}
                >
                  <Flame className="w-4 h-4" style={{ color: "#ff4444" }} />
                  <span
                    className="text-sm font-bold uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-display, sans-serif)", color: "#ff6666" }}
                  >
                    Solo {stock} rimasti!
                  </span>
                </div>

                {/* Countdown */}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" style={{ color: "rgba(200,240,0,0.6)" }} />
                  <span
                    className="text-xs uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.4)" }}
                  >
                    Scade tra:
                  </span>
                  <div className="flex items-center gap-1">
                    {[pad(minutes), ":", pad(seconds)].map((part, i) => (
                      <span
                        key={i}
                        className={`font-black text-base ${part === ":" ? "" : "px-2 py-1 rounded-lg"}`}
                        style={{
                          fontFamily: "var(--font-mono, monospace)",
                          color: "#c8f000",
                          background: part !== ":" ? "rgba(200,240,0,0.1)" : "transparent",
                          border: part !== ":" ? "1px solid rgba(200,240,0,0.15)" : "none",
                        }}
                      >
                        {part}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-6">
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${(stock / 20) * 100}%`,
                      background: "linear-gradient(90deg, #c8f000, rgba(200,240,0,0.6))",
                    }}
                  />
                </div>
                <p
                  className="text-[10px] mt-1.5 uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.3)" }}
                >
                  {stock}/20 ancora disponibili
                </p>
              </div>

              {/* CTA */}
              <Link
                href="/shop"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-black uppercase transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                style={{
                  background: "#c8f000",
                  color: "#0a0a0a",
                  fontFamily: "var(--font-display, sans-serif)",
                  letterSpacing: "2px",
                  fontSize: "0.9rem",
                  boxShadow: "0 4px 24px rgba(200,240,0,0.3)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 40px rgba(200,240,0,0.5)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(200,240,0,0.3)";
                }}
              >
                <ShoppingBag className="w-4 h-4" />
                Aggiungi al Carrello
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
