"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, ShoppingBag, Newspaper, Tag } from "lucide-react";
import { useEffect, useState } from "react";

const STATS = [
  { value: "10.000+", label: "Clienti" },
  { value: "500+", label: "Maglie" },
  { value: "4.9★", label: "Rating" },
  { value: "30gg", label: "Reso Gratis" },
];

interface HeroProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  slug: string;
}

interface Props {
  products?: HeroProduct[];
}

function cleanName(raw: string): string {
  return raw
    .replace(/^Maglia\s+/i, "")
    .replace(/\s+\d{4}[-/]\d{2,4}.*$/i, "")
    .trim();
}

function catLabel(cat: string): string {
  if (!cat) return "";
  const c = cat.toLowerCase();
  if (c.includes("retro")) return "Vintage";
  if (c.includes("world cup") || c.includes("mondiali")) return "World Cup";
  if (cat === "2026/27") return "Stagione 26/27";
  if (cat === "2025/26") return "Stagione 25/26";
  return cat;
}

export default function HeroSection({ products = [] }: Props) {
  const [mounted, setMounted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const rotationProducts = products.slice(0, 6);

  useEffect(() => {
    if (rotationProducts.length <= 1) return;
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIdx((i) => (i + 1) % rotationProducts.length);
        setVisible(true);
      }, 350);
    }, 4500);
    return () => clearInterval(id);
  }, [rotationProducts.length]);

  const current = rotationProducts[currentIdx] ?? null;

  return (
    <section
      className="relative w-full min-h-screen flex flex-col overflow-hidden"
      style={{ background: "#0a0a0a" }}
    >
      {/* ── Background ── */}
      <div className="absolute inset-0">
        <img
          src="/images/recentUpdate/home-banner.jpg"
          alt="Football stadium"
          className="w-full h-full object-cover object-center"
          style={{ opacity: 0.25 }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.8) 50%, rgba(10,10,10,0.92) 100%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[600px] h-[400px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 0% 100%, rgba(200,240,0,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(200,240,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(200,240,0,1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* ── Desktop overlay ── */}
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
        {/* LEFT */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-2xl">
          {/* Social proof pill */}
          <div
            className={`flex items-center gap-2.5 mb-6 px-4 py-2 rounded-full transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
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
            className={`font-black uppercase leading-none mb-6 transition-all duration-700 delay-100 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
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
            className={`text-base md:text-lg text-white/60 mb-8 max-w-lg leading-relaxed transition-all duration-700 delay-200 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ fontFamily: "var(--font-body, sans-serif)" }}
          >
            Maglie Serie A, Premier League, Champions League e molto altro.
            Spedizione Gratuita su tutti gli ordini. Reso gratuito entro 30 giorni.
          </p>

          {/* CTAs */}
          <div
            className={`flex flex-wrap items-center gap-3 mb-8 transition-all duration-700 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Link
              href="/shop"
              className="gm-btn gm-btn-primary inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-black uppercase"
              style={{
                fontFamily: "var(--font-display, sans-serif)",
                letterSpacing: "2px",
                fontSize: "0.85rem",
                boxShadow: "0 4px 24px rgba(200,240,0,0.35)",
              }}
            >
              <Tag className="w-4 h-4" />
              Maglie a 30€
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/news"
              className="gm-btn gm-btn-secondary inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-black uppercase"
              style={{
                fontFamily: "var(--font-display, sans-serif)",
                letterSpacing: "2px",
                fontSize: "0.85rem",
              }}
            >
              <Newspaper className="w-4 h-4" />
              Leggi le Notizie
            </Link>
          </div>

          {/* Trust row */}
          <div
            className={`flex flex-wrap items-center gap-4 transition-all duration-700 delay-[400ms] ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
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

        {/* RIGHT: rotating product card */}
        <div
          className={`flex-shrink-0 transition-all duration-1000 delay-200 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
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
                boxShadow:
                  "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,240,0,0.05)",
              }}
            >
              {current ? (
                /* ── Real rotating product ── */
                <div
                  style={{
                    opacity: visible ? 1 : 0,
                    transition: "opacity 0.35s ease-in-out",
                  }}
                >
                  {/* Image */}
                  <Link href={current.slug ? `/shop/${current.slug}` : "/shop"}>
                    <div
                      className="relative h-64 lg:h-72 overflow-hidden"
                      style={{ background: "rgba(200,240,0,0.04)" }}
                    >
                      <Image
                        src={current.image}
                        alt={current.name}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 1024px) 256px, 320px"
                      />
                      {/* Bottom fade */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to bottom, transparent 55%, #111 100%)",
                        }}
                      />
                      {/* Category badge */}
                      <div
                        className="absolute top-4 right-4 px-3 py-1.5 rounded-full font-black text-xs uppercase"
                        style={{
                          background: "#c8f000",
                          color: "#0a0a0a",
                          fontFamily: "var(--font-display, sans-serif)",
                          letterSpacing: "1.5px",
                        }}
                      >
                        {catLabel(current.category)}
                      </div>
                      {/* Hot badge */}
                      <div
                        className="absolute top-4 left-4 flex items-center gap-1 px-2.5 py-1 rounded-full"
                        style={{
                          background: "rgba(255,68,68,0.15)",
                          border: "1px solid rgba(255,68,68,0.3)",
                        }}
                      >
                        <span
                          className="text-[9px] font-black uppercase tracking-wider"
                          style={{
                            fontFamily: "var(--font-mono, monospace)",
                            color: "#ff6666",
                          }}
                        >
                          🔥 Top
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="p-5">
                    <div
                      className="text-[9px] uppercase tracking-[3px] mb-1.5"
                      style={{
                        fontFamily: "var(--font-mono, monospace)",
                        color: "rgba(200,240,0,0.6)",
                      }}
                    >
                      {catLabel(current.category)}
                    </div>
                    <h3
                      className="font-black uppercase text-white text-lg leading-tight mb-3"
                      style={{
                        fontFamily: "var(--font-display, sans-serif)",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {cleanName(current.name)}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <span
                          className="text-2xl font-black"
                          style={{
                            fontFamily: "var(--font-display, sans-serif)",
                            color: "#c8f000",
                          }}
                        >
                          €{current.price.toFixed(2).replace(".", ",")}
                        </span>
                        <div
                          className="text-[9px] uppercase tracking-[2px] mt-0.5"
                          style={{
                            fontFamily: "var(--font-mono, monospace)",
                            color: "rgba(200,240,0,0.5)",
                          }}
                        >
                          Spedizione Gratis
                        </div>
                      </div>
                      <Link
                        href={current.slug ? `/shop/${current.slug}` : "/shop"}
                        className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:scale-110"
                        style={{ background: "#c8f000" }}
                      >
                        <ShoppingBag size={16} color="#0a0a0a" />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Fallback static card ── */
                <>
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
                      style={{
                        background:
                          "linear-gradient(to bottom, transparent 60%, #111 100%)",
                      }}
                    />
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
                  </div>
                  <div className="p-5">
                    <div
                      className="text-[9px] uppercase tracking-[3px] mb-1.5"
                      style={{
                        fontFamily: "var(--font-mono, monospace)",
                        color: "rgba(200,240,0,0.6)",
                      }}
                    >
                      Stagione 2025/26
                    </div>
                    <h3
                      className="font-black uppercase text-white text-lg leading-tight mb-3"
                      style={{
                        fontFamily: "var(--font-display, sans-serif)",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Maglia in Evidenza
                    </h3>
                    <div className="flex items-center justify-between">
                      <span
                        className="text-2xl font-black"
                        style={{
                          fontFamily: "var(--font-display, sans-serif)",
                          color: "#c8f000",
                        }}
                      >
                        DA €30
                      </span>
                      <Link
                        href="/shop"
                        className="flex items-center justify-center w-10 h-10 rounded-full"
                        style={{ background: "#c8f000" }}
                      >
                        <ShoppingBag size={16} color="#0a0a0a" />
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Dot indicators */}
            {rotationProducts.length > 1 && (
              <div className="flex gap-1.5 justify-center mt-4">
                {rotationProducts.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setVisible(false);
                      setTimeout(() => {
                        setCurrentIdx(i);
                        setVisible(true);
                      }, 200);
                    }}
                    style={{
                      width: i === currentIdx ? 18 : 6,
                      height: 6,
                      borderRadius: 3,
                      background:
                        i === currentIdx
                          ? "#c8f000"
                          : "rgba(200,240,0,0.25)",
                      transition: "all 0.3s ease",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                    aria-label={`Prodotto ${i + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Glow behind card */}
            <div
              className="absolute -inset-4 rounded-3xl -z-10"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(200,240,0,0.08) 0%, transparent 70%)",
                filter: "blur(20px)",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
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
                  style={{
                    fontFamily:
                      "var(--font-display, 'Barlow Condensed', sans-serif)",
                    letterSpacing: "1px",
                  }}
                >
                  {value}
                </span>
                <span
                  className="text-[9px] uppercase tracking-[3px]"
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    color: "rgba(200,240,0,0.6)",
                  }}
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
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-10px) rotate(0.5deg);
          }
          66% {
            transform: translateY(-5px) rotate(-0.5deg);
          }
        }
      `}</style>
    </section>
  );
}
