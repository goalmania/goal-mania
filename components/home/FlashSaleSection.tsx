"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";

const ROTATE_INTERVAL_MS = 7000; // auto-advance every 7s
const FADE_DURATION_MS = 350;

const GRAIN_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='200' height='200' filter='url(#g)' opacity='0.09'/></svg>`;

function cleanTitle(raw: string): string {
  return raw.replace(/^Maglia\s+/i, "").trim();
}

interface FlashProduct {
  id?: string;
  name: string;
  price: number;
  image: string;
  slug?: string;
  category?: string;
}

interface Props {
  /** Pass an array to enable rotation; single product still works */
  products?: FlashProduct[];
  /** Legacy single-product prop — used if `products` is not provided */
  product?: FlashProduct;
}

export default function FlashSaleSection({ products, product }: Props) {
  // Normalise to array
  const list: FlashProduct[] = products && products.length > 0
    ? products
    : product
    ? [product]
    : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);
  const listLenRef = useRef(list.length);
  const touchStartX = useRef<number | null>(null);
  listLenRef.current = list.length;

  // ── Manual navigation ──────────────────────────────────────────
  const goTo = (index: number) => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    setVisible(false);
    fadeTimerRef.current = setTimeout(() => {
      indexRef.current = index;
      setCurrentIndex(index);
      setVisible(true);
    }, FADE_DURATION_MS);
  };

  // ── Auto-rotation (runs once; uses refs to avoid stale closure) ──
  useEffect(() => {
    if (listLenRef.current <= 1) return;
    const id = setInterval(() => {
      if (listLenRef.current <= 1) return;
      const next = (indexRef.current + 1) % listLenRef.current;
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      setVisible(false);
      fadeTimerRef.current = setTimeout(() => {
        indexRef.current = next;
        setCurrentIndex(next);
        setVisible(true);
      }, FADE_DURATION_MS);
    }, ROTATE_INTERVAL_MS);
    return () => {
      clearInterval(id);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []); // intentionally empty — all state accessed via refs

  // ── Current product ────────────────────────────────────────────
  const current = list[currentIndex] ?? null;
  const href = current?.slug ? `/products/${current.slug}` : "/shop";
  const fullTitle = current ? cleanTitle(current.name) : "Maglia in Evidenza";
  const price = current?.price ?? 79.9;

  const words = fullTitle.split(" ");
  const titleMain = words.slice(0, -1).join(" ");
  const titleAccent = words[words.length - 1];

  return (
    <section className="py-12 md:py-16 bg-[#0a0a0a] relative overflow-hidden">
      {/* Outer grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(GRAIN_SVG)}")`,
          backgroundRepeat: "repeat",
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <span className="w-6 h-[1.5px] rounded-full inline-block" style={{ background: "#c8f000" }} />
          <span
            className="text-[10px] uppercase tracking-[4px]"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "#c8f000" }}
          >
            // In Evidenza
          </span>
          <span className="w-6 h-[1.5px] rounded-full inline-block" style={{ background: "#c8f000" }} />
        </div>

        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden relative"
          style={{
            border: "1.5px solid rgba(200,240,0,0.35)",
            background: "linear-gradient(135deg, #111 0%, #0a0a0a 100%)",
          }}
        >
          {/* Top lime accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px] z-10"
            style={{ background: "linear-gradient(90deg, transparent, #c8f000, transparent)" }}
          />

          {/* Inner grain */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(GRAIN_SVG)}")`,
              backgroundRepeat: "repeat",
            }}
          />

          {/* Background radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 28% 50%, rgba(200,240,0,0.07) 0%, transparent 60%)",
            }}
          />

          {/* ── Content (fades on product change) ── */}
          <div
            className="relative z-10 flex flex-col lg:flex-row items-stretch"
            style={{
              opacity: visible ? 1 : 0,
              transition: `opacity ${FADE_DURATION_MS}ms cubic-bezier(0.4,0,0.2,1)`,
            }}
            onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null || list.length <= 1) return;
              const diff = touchStartX.current - e.changedTouches[0].clientX;
              if (Math.abs(diff) > 40) {
                goTo(diff > 0
                  ? (currentIndex + 1) % list.length
                  : (currentIndex - 1 + list.length) % list.length);
              }
              touchStartX.current = null;
            }}
          >
            {/* Left: Product image */}
            <div
              className="flex-shrink-0 w-full lg:w-[340px] flex items-center justify-center relative"
              style={{
                background: "rgba(200,240,0,0.025)",
                borderRight: "1px solid rgba(200,240,0,0.08)",
                minHeight: 340,
              }}
            >
              {/* Lime glow behind jersey */}
              <div
                className="absolute inset-0"
                style={{
                  background: "radial-gradient(ellipse at center, rgba(200,240,0,0.1) 0%, transparent 65%)",
                }}
              />

              {current ? (
                <div className="relative w-full h-72 lg:h-full lg:min-h-[340px]">
                  <Image
                    src={current.image}
                    alt={current.name}
                    fill
                    className="object-contain p-6"
                    sizes="(max-width: 1024px) 100vw, 340px"
                    unoptimized
                  />
                  {/* In evidenza badge */}
                  <div
                    className="absolute top-4 left-4 px-3 py-1.5 rounded-full font-black text-xs uppercase z-10"
                    style={{
                      background: "#c8f000",
                      color: "#0a0a0a",
                      fontFamily: "var(--font-display, sans-serif)",
                      letterSpacing: "1px",
                    }}
                  >
                    In Evidenza
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 px-8">
                  <div className="text-6xl mb-3 opacity-30">👕</div>
                  <span
                    className="text-xs uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.4)" }}
                  >
                    Caricamento...
                  </span>
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div className="flex-1 p-8 md:p-10 lg:p-12 flex flex-col justify-center">
              {/* Header badge */}
              <div className="flex items-center gap-2.5 mb-5">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{
                    background: "rgba(200,240,0,0.1)",
                    border: "1px solid rgba(200,240,0,0.25)",
                  }}
                >
                  <span
                    className="text-xs font-black uppercase tracking-[2px]"
                    style={{ fontFamily: "var(--font-display, sans-serif)", color: "#c8f000" }}
                  >
                    In Evidenza
                  </span>
                </div>
              </div>

              {/* Product title */}
              <h2
                className="font-black uppercase text-white leading-tight mb-3"
                style={{
                  fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
                  fontSize: "clamp(2rem, 5vw, 3.2rem)",
                  letterSpacing: "1px",
                }}
              >
                {titleMain.length > 0 ? (
                  <>
                    {titleMain}{" "}
                    <span style={{ color: "#c8f000" }}>{titleAccent}</span>
                  </>
                ) : (
                  <span style={{ color: "#c8f000" }}>{titleAccent}</span>
                )}
              </h2>

              <p
                className="text-white/45 mb-6 text-sm leading-relaxed"
                style={{ fontFamily: "var(--font-body, sans-serif)" }}
              >
                Disponibile in tutte le taglie. Spedizione gratuita inclusa.
                Reso gratuito entro 30 giorni.
              </p>

              {/* Price */}
              <div className="flex items-end gap-3 mb-6">
                <span
                  className="font-black leading-none"
                  style={{
                    fontFamily: "var(--font-display, sans-serif)",
                    fontSize: "clamp(2.4rem, 5vw, 3rem)",
                    color: "#c8f000",
                  }}
                >
                  €{price.toFixed(2).replace(".", ",")}
                </span>
                <div
                  className="mb-1 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold"
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    background: "rgba(200,240,0,0.08)",
                    color: "rgba(200,240,0,0.75)",
                    border: "1px solid rgba(200,240,0,0.18)",
                  }}
                >
                  🚚 Spedizione Gratis
                </div>
              </div>

              {/* CTA */}
              <Link
                href={href}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-black uppercase transition-all duration-300 hover:-translate-y-1 self-start"
                style={{
                  background: "#c8f000",
                  color: "#0a0a0a",
                  fontFamily: "var(--font-display, sans-serif)",
                  letterSpacing: "2px",
                  fontSize: "0.9rem",
                  boxShadow: "0 4px 24px rgba(200,240,0,0.35)",
                }}
              >
                <ShoppingBag className="w-4 h-4" />
                Acquista Ora
              </Link>
            </div>
          </div>

          {/* ── Multi-product navigation (only when >1 product) ── */}
          {list.length > 1 && (
            <div className="relative z-20 flex items-center justify-center gap-3 py-4 px-6"
              style={{ borderTop: "1px solid rgba(200,240,0,0.06)" }}
            >
              {/* Prev */}
              <button
                aria-label="Prodotto precedente"
                onClick={() => goTo((currentIndex - 1 + list.length) % list.length)}
                className="p-1 rounded-full transition-colors duration-200"
                style={{ color: "rgba(200,240,0,0.5)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#c8f000"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(200,240,0,0.5)"; }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Dots */}
              <div className="flex items-center gap-2">
                {list.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Vai al prodotto ${i + 1}`}
                    onClick={() => goTo(i)}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: i === currentIndex ? "20px" : "6px",
                      height: "6px",
                      background: i === currentIndex ? "#c8f000" : "rgba(200,240,0,0.25)",
                    }}
                  />
                ))}
              </div>

              {/* Next */}
              <button
                aria-label="Prodotto successivo"
                onClick={() => goTo((currentIndex + 1) % list.length)}
                className="p-1 rounded-full transition-colors duration-200"
                style={{ color: "rgba(200,240,0,0.5)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#c8f000"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(200,240,0,0.5)"; }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Counter */}
              <span
                className="text-[10px] uppercase tracking-widest ml-1"
                style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.2)" }}
              >
                {currentIndex + 1}/{list.length}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
