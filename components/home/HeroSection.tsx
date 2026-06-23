"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store/cart";

const GRAIN = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='200' height='200' filter='url(#g)' opacity='0.07'/></svg>`;

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
  if (cat === "2026/27") return "26/27";
  if (cat === "2025/26") return "25/26";
  return cat;
}

export default function HeroSection({ products = [] }: Props) {
  const [mounted, setMounted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const addItemToCart = useCartStore((state) => state.addItem);

  useEffect(() => { setMounted(true); }, []);

  const pool = products.slice(0, 6);

  useEffect(() => {
    if (pool.length <= 1) return;
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIdx((i) => (i + 1) % pool.length);
        setVisible(true);
      }, 350);
    }, 4500);
    return () => clearInterval(id);
  }, [pool.length]);

  const current = pool[currentIdx] ?? null;

  return (
    <section
      className="relative w-full min-h-screen flex flex-col overflow-hidden"
      style={{ background: "#070707" }}
    >
      {/* Hero bg — jersey collage */}
      <div className="absolute inset-0">
        <img
          src="/hero-home.jpg"
          alt=""
          className="w-full h-full object-cover object-center"
          style={{ opacity: 0.45 }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(7,7,7,0.95) 0%, rgba(7,7,7,0.70) 45%, rgba(7,7,7,0.88) 100%)",
          }}
        />
        {/* Lime glow BL */}
        <div
          className="absolute bottom-0 left-0 w-[700px] h-[500px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 0% 100%, rgba(200,240,0,0.07) 0%, transparent 65%)",
          }}
        />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(200,240,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(200,240,0,1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        {/* Grain */}
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(GRAIN)}")`,
            backgroundRepeat: "repeat",
          }}
        />
      </div>


      {/* ── Main ── */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between flex-1 container mx-auto px-6 lg:px-12 max-w-7xl pt-12 pb-16 lg:pt-16 gap-10">

        {/* LEFT */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-2xl">

          {/* Social proof */}
          <div
            className={`flex items-center gap-2.5 mb-6 px-4 py-2 rounded-full transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ background: "rgba(200,240,0,0.08)", border: "1px solid rgba(200,240,0,0.22)" }}
          >
            <div className="flex">
              {"★★★★★".split("").map((s, i) => (
                <span key={i} style={{ color: "#c8f000", fontSize: 10 }}>{s}</span>
              ))}
            </div>
            <span
              className="text-[10px] font-black uppercase tracking-[2px]"
              style={{ fontFamily: "var(--font-display,'Barlow Condensed',sans-serif)", color: "#c8f000" }}
            >
              4.9/5 · 2.847 recensioni
            </span>
          </div>

          {/* ── HEADLINE PRINCIPALE ── */}
          <div
            aria-hidden="true"
            className={`font-black uppercase leading-none mb-4 transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{
              fontFamily: "var(--font-display,'Barlow Condensed',sans-serif)",
              fontSize: "clamp(3.2rem, 9vw, 7.5rem)",
              letterSpacing: "-1px",
              lineHeight: 0.88,
            }}
          >
            <span className="text-white block">MAGLIE DA</span>
            <span className="text-white block">CALCIO</span>
            <span style={{ color: "#c8f000" }} className="block">A 30€</span>
          </div>

          {/* Subtext */}
          <p
            className={`text-sm md:text-base text-white/55 mb-8 max-w-md leading-relaxed transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ fontFamily: "var(--font-body,sans-serif)" }}
          >
            Serie A, Premier League, World Cup 2026, Retro e molto altro.
            Spedizione gratuita su tutti gli ordini.
          </p>

          {/* CTAs */}
          <div
            className={`flex flex-wrap items-center gap-3 mb-8 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <Link
              href="/shop"
              className="gm-btn gm-btn-primary inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-black uppercase"
              style={{
                fontFamily: "var(--font-display,sans-serif)",
                letterSpacing: "2px",
                fontSize: "0.85rem",
                boxShadow: "0 4px 28px rgba(200,240,0,0.4)",
              }}
            >
              <Tag className="w-4 h-4" />
              Vedi le Maglie
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/shop/2026/27"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-black uppercase transition-all duration-200"
              style={{
                fontFamily: "var(--font-display,sans-serif)",
                letterSpacing: "2px",
                fontSize: "0.8rem",
                border: "1.5px solid rgba(200,240,0,0.3)",
                color: "rgba(200,240,0,0.85)",
                background: "transparent",
              }}
            >
              ⚡ Nuovi arrivi 26/27
            </Link>
          </div>

          {/* Trust */}
          <div
            className={`flex flex-wrap items-center gap-4 transition-all duration-700 delay-[400ms] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            {[
              { icon: "🚚", label: "Spedizione Gratis" },
              { icon: "🔒", label: "Pagamento Sicuro" },
              { icon: "↩️", label: "Reso 30 giorni" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="text-sm">{icon}</span>
                <span
                  className="text-[10px] uppercase tracking-[2px] text-white/35"
                  style={{ fontFamily: "var(--font-mono,monospace)" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: rotating product card */}
        <div
          className={`flex-shrink-0 transition-all duration-1000 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div
            className="relative w-60 lg:w-[300px]"
            style={{ animation: "heroFloat 4s ease-in-out infinite" }}
          >
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg,#121212 0%,#0a0a0a 100%)",
                border: "1.5px solid rgba(200,240,0,0.18)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.7),0 0 0 1px rgba(200,240,0,0.04)",
              }}
            >
              {current ? (
                <div style={{ opacity: visible ? 1 : 0, transition: "opacity 0.35s ease-in-out" }}>
                  {/* Image */}
                  <Link href={`/products/${current.slug || current.id}`}>
                    <div className="relative h-60 lg:h-72 overflow-hidden" style={{ background: "rgba(200,240,0,0.03)" }}>
                      <Image
                        src={current.image}
                        alt={current.name}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width:1024px) 240px,300px"
                      />
                      <div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(to bottom,transparent 55%,#0a0a0a 100%)" }}
                      />
                      <div
                        className="absolute top-4 right-4 px-2.5 py-1 rounded-full font-black text-[10px] uppercase"
                        style={{ background: "#c8f000", color: "#0a0a0a", fontFamily: "var(--font-display,sans-serif)", letterSpacing: "1px" }}
                      >
                        {catLabel(current.category)}
                      </div>
                      <div
                        className="absolute top-4 left-4 px-2 py-1 rounded-full text-[9px] font-black uppercase"
                        style={{ background: "rgba(255,68,68,0.15)", border: "1px solid rgba(255,68,68,0.3)", color: "#ff6666", fontFamily: "var(--font-mono,monospace)" }}
                      >
                        🔥 Top
                      </div>
                    </div>
                  </Link>
                  {/* Info */}
                  <div className="p-4">
                    <div className="text-[9px] uppercase tracking-[3px] mb-1" style={{ fontFamily: "var(--font-mono,monospace)", color: "rgba(200,240,0,0.55)" }}>
                      {catLabel(current.category)}
                    </div>
                    <h3 className="font-black uppercase text-white text-base leading-tight mb-3" style={{ fontFamily: "var(--font-display,sans-serif)" }}>
                      {cleanName(current.name)}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-black" style={{ fontFamily: "var(--font-display,sans-serif)", color: "#c8f000" }}>
                          €{current.price.toFixed(2).replace(".", ",")}
                        </span>
                        <div className="text-[9px] uppercase tracking-[2px] mt-0.5" style={{ fontFamily: "var(--font-mono,monospace)", color: "rgba(200,240,0,0.45)" }}>
                          Spedizione Gratis
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          addItemToCart({ id: current.id, name: current.name, price: current.price, image: current.image, quantity: 1 });
                          setAddedToCart(true);
                          setTimeout(() => setAddedToCart(false), 1800);
                        }}
                        className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
                        style={{ background: addedToCart ? "#a0c000" : "#c8f000" }}
                        title="Aggiungi al carrello"
                      >
                        <ShoppingBag size={15} color="#0a0a0a" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="text-5xl mb-3 opacity-20">👕</div>
                  <span className="text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-mono,monospace)", color: "rgba(200,240,0,0.4)" }}>
                    Caricamento...
                  </span>
                </div>
              )}
            </div>

            {/* Dot indicators */}
            {pool.length > 1 && (
              <div className="flex gap-1.5 justify-center mt-3">
                {pool.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setVisible(false); setTimeout(() => { setCurrentIdx(i); setVisible(true); }, 200); }}
                    style={{
                      width: i === currentIdx ? 18 : 6,
                      height: 6,
                      borderRadius: 3,
                      background: i === currentIdx ? "#c8f000" : "rgba(200,240,0,0.2)",
                      transition: "all 0.3s",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Glow */}
            <div
              className="absolute -inset-4 rounded-3xl -z-10"
              style={{ background: "radial-gradient(ellipse at center,rgba(200,240,0,0.07) 0%,transparent 70%)", filter: "blur(20px)" }}
            />
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="relative z-10 border-t" style={{ borderColor: "rgba(200,240,0,0.08)" }}>
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
            {[
              { value: "10.000+", label: "Clienti" },
              { value: "500+", label: "Maglie" },
              { value: "4.9★", label: "Rating" },
              { value: "30gg", label: "Reso Gratis" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center justify-center py-4 px-4 text-center">
                <span className="font-black text-xl lg:text-2xl text-white leading-none mb-0.5" style={{ fontFamily: "var(--font-display,'Barlow Condensed',sans-serif)", letterSpacing: "1px" }}>
                  {value}
                </span>
                <span className="text-[9px] uppercase tracking-[3px]" style={{ fontFamily: "var(--font-mono,monospace)", color: "rgba(200,240,0,0.55)" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes heroFloat {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(0.5deg); }
          66% { transform: translateY(-5px) rotate(-0.5deg); }
        }
      `}</style>
    </section>
  );
}
