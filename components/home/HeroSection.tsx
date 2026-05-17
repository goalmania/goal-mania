"use client";

import Link from "next/link";
import { ArrowRight, Star, ShoppingBag, Newspaper, Zap } from "lucide-react";
import { useEffect, useState } from "react";

const STATS = [
  { value: "10.000+", label: "Clienti" },
  { value: "500+", label: "Maglie" },
  { value: "4.9★", label: "Rating" },
  { value: "30gg", label: "Reso Gratis" },
];

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      className="relative w-full min-h-screen flex flex-col overflow-hidden"
      style={{ background: "#0a0a0a" }}
    >
      {/* ── Background: stadium image with dark overlay ── */}
      <div className="absolute inset-0">
        <img
          src="/images/recentUpdate/home-banner.jpg"
          alt="Football stadium"
          className="w-full h-full object-cover object-center"
          style={{ opacity: 0.25 }}
        />
        {/* Gradient overlays */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.8) 50%, rgba(10,10,10,0.92) 100%)",
          }}
        />
        {/* Lime radial glow bottom-left */}
        <div
          className="absolute bottom-0 left-0 w-[600px] h-[400px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 0% 100%, rgba(200,240,0,0.08) 0%, transparent 70%)",
          }}
        />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(200,240,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(200,240,0,1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* ── Desktop overlay image ── */}
      <div className="absolute hidden lg:block inset-0 pointer-events-none">
        <img
          src="/images/recentUpdate/desktop-overlay.png"
          alt=""
          className="w-full h-full object-cover"
          style={{ opacity: 0.12 }}
        />
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between flex-1 container mx-auto px-6 lg:px-12 max-w-7xl pt-12 pb-20 lg:pt-16 gap-12">
        {/* LEFT content */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-2xl">
          {/* Social proof pill */}
          <div
            className={`flex items-center gap-2.5 mb-6 px-4 py-2 rounded-full transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{
              background: "rgba(200,240,0,0.08)",
              border: "1px solid rgba(200,240,0,0.22)",
            }}
          >
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={10} fill="#c8f000" color="#c8f000" />
              ))}
            </div>
            <span
              className="text-[10px] font-black uppercase tracking-[2px] text-[#c8f000]"
              style={{ fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)" }}
            >
              4.9/5 · 2.847 recensioni verificate
            </span>
          </div>

          {/* Headline */}
          <h1
            className={`font-black uppercase leading-none mb-6 transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{
              fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
              fontSize: "clamp(3rem, 8vw, 6.5rem)",
              letterSpacing: "-0.5px",
              lineHeight: 0.92,
            }}
          >
            <span className="text-white">LE MAGLIE CHE</span>
            <br />
            <span style={{ color: "#c8f000" }}>AMI INDOSSARE</span>
          </h1>

          {/* Subtext */}
          <p
            className={`text-base md:text-lg text-white/60 mb-8 max-w-lg leading-relaxed transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ fontFamily: "var(--font-body, sans-serif)" }}
          >
            Maglie ufficiali Serie A, Premier League, Champions League.
            Spedizione gratuita sopra €89. Reso gratuito entro 30 giorni.
          </p>

          {/* CTAs */}
          <div
            className={`flex flex-wrap items-center gap-3 mb-8 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <Link
              href="/shop"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-black uppercase transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "#c8f000",
                color: "#0a0a0a",
                fontFamily: "var(--font-display, sans-serif)",
                letterSpacing: "2px",
                fontSize: "0.85rem",
                boxShadow: "0 4px 24px rgba(200,240,0,0.35)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 40px rgba(200,240,0,0.55)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(200,240,0,0.35)";
              }}
            >
              <ShoppingBag className="w-4 h-4" />
              Scopri le Maglie
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/news"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-black uppercase transition-all duration-300 hover:-translate-y-0.5 hover:border-[#c8f000]/60 hover:text-[#c8f000]"
              style={{
                background: "transparent",
                color: "rgba(255,255,255,0.7)",
                fontFamily: "var(--font-display, sans-serif)",
                letterSpacing: "2px",
                fontSize: "0.85rem",
                border: "1.5px solid rgba(255,255,255,0.2)",
              }}
            >
              <Newspaper className="w-4 h-4" />
              Leggi le Notizie
            </Link>
          </div>

          {/* Trust row */}
          <div
            className={`flex flex-wrap items-center gap-4 transition-all duration-700 delay-[400ms] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            {[
              { icon: "🚚", label: "Spedizione Gratuita" },
              { icon: "🔒", label: "Pagamento Sicuro" },
              { icon: "✅", label: "Originale Garantito" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="text-sm">{icon}</span>
                <span
                  className="text-[10px] uppercase tracking-[2px] text-white/40"
                  style={{ fontFamily: "var(--font-mono, monospace)" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: floating product card */}
        <div
          className={`flex-shrink-0 transition-all duration-1000 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div
            className="relative w-64 lg:w-80"
            style={{ animation: "heroFloat 4s ease-in-out infinite" }}
          >
            {/* Card */}
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #111 0%, #0d0d0d 100%)",
                border: "1.5px solid rgba(200,240,0,0.2)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,240,0,0.05)",
              }}
            >
              {/* Product image area */}
              <div
                className="relative h-64 lg:h-72 flex items-center justify-center"
                style={{ background: "rgba(200,240,0,0.03)" }}
              >
                <img
                  src="/images/recentUpdate/home-banner.jpg"
                  alt="Featured Jersey"
                  className="w-full h-full object-cover object-center"
                  style={{ opacity: 0.6 }}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to bottom, transparent 60%, #111 100%)" }}
                />
                {/* Badge */}
                <div
                  className="absolute top-4 right-4 px-3 py-1.5 rounded-full font-black text-xs uppercase"
                  style={{
                    background: "#c8f000",
                    color: "#0a0a0a",
                    fontFamily: "var(--font-display, sans-serif)",
                    letterSpacing: "1.5px",
                  }}
                >
                  Nuovo
                </div>
                {/* Hot badge */}
                <div
                  className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(255,68,68,0.15)",
                    border: "1px solid rgba(255,68,68,0.3)",
                  }}
                >
                  <Zap size={10} style={{ color: "#ff6666" }} />
                  <span
                    className="text-[9px] font-black uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-mono, monospace)", color: "#ff6666" }}
                  >
                    Hot
                  </span>
                </div>
              </div>

              {/* Product info */}
              <div className="p-5">
                <div
                  className="text-[9px] uppercase tracking-[3px] mb-1.5"
                  style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.6)" }}
                >
                  Serie A · 2025/26
                </div>
                <h3
                  className="font-black uppercase text-white text-lg leading-tight mb-3"
                  style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "0.5px" }}
                >
                  Maglia in Evidenza
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <span
                      className="text-2xl font-black"
                      style={{ fontFamily: "var(--font-display, sans-serif)", color: "#c8f000" }}
                    >
                      €79,90
                    </span>
                    <span
                      className="text-xs text-white/30 line-through ml-2"
                      style={{ fontFamily: "var(--font-body, sans-serif)" }}
                    >
                      €99,90
                    </span>
                  </div>
                  <Link
                    href="/shop"
                    className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:scale-110"
                    style={{ background: "#c8f000" }}
                  >
                    <ShoppingBag size={16} color="#0a0a0a" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Floating glow behind card */}
            <div
              className="absolute -inset-4 rounded-3xl -z-10"
              style={{
                background: "radial-gradient(ellipse at center, rgba(200,240,0,0.08) 0%, transparent 70%)",
                filter: "blur(20px)",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Scrolling stats bar at bottom ── */}
      <div
        className="relative z-10 border-t"
        style={{ borderColor: "rgba(200,240,0,0.1)" }}
      >
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
            {STATS.map(({ value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center py-5 px-4 text-center"
              >
                <span
                  className="font-black text-xl lg:text-2xl text-white leading-none mb-0.5"
                  style={{ fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)", letterSpacing: "1px" }}
                >
                  {value}
                </span>
                <span
                  className="text-[9px] uppercase tracking-[3px]"
                  style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.6)" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(0.5deg); }
          66% { transform: translateY(-5px) rotate(-0.5deg); }
        }
      `}</style>
    </section>
  );
}
