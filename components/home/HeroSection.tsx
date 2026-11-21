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
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const addItemToCart = useCartStore((state) => state.addItem);

  useEffect(() => { setMounted(true); }, []);

  // Real order count — no fabricated customer/review numbers
  useEffect(() => {
    fetch("/api/stats/public")
      .then((r) => r.json())
      .then((d) => { if (typeof d.totalOrders === "number") setTotalOrders(d.totalOrders); })
      .catch(() => {});
  }, []);

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

  const offers = [
    { big: "35€", small: "Maglie attuali" },
    { big: "40€", small: "Maglie retro" },
    { big: "3x2", small: "Prendi 3, ne paghi 2" },
    { big: "0€", small: "Spedizione, sempre" },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-[#0a0a0a]">
      {/* Sfondo: foto maglie molto scura, nessun alone né griglia */}
      <div className="absolute inset-0">
        <img src="/hero-home.jpg" alt="" className="h-full w-full object-cover object-center" style={{ opacity: 0.28 }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, #0a0a0a 0%, rgba(10,10,10,0.82) 55%, rgba(10,10,10,0.6) 100%)" }} />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-5 pb-10 pt-8 sm:px-8 lg:grid-cols-[1.25fr_1fr] lg:pb-16 lg:pt-14">
        {/* Testo */}
        <div className={`transition-all duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
          <Link
            href="/shop"
            className="gm-lime-block mb-5 inline-flex items-center rounded-[4px] px-3 py-1.5 text-[12px] font-black uppercase tracking-[0.16em]"
            style={{ fontFamily: "var(--font-display,'Barlow Condensed',sans-serif)" }}
          >
            Black Friday · Prendi 3, ne paghi 2
          </Link>

          <h2
            aria-hidden="true"
            className="font-black uppercase text-white"
            style={{
              fontFamily: "var(--font-display,'Barlow Condensed',sans-serif)",
              fontSize: "clamp(3.4rem, 11vw, 8.5rem)",
              lineHeight: 0.86,
              letterSpacing: "-0.02em",
            }}
          >
            Maglie da<br />calcio a{" "}
            <span className="gm-lime-block inline-block px-3" style={{ transform: "rotate(-1.5deg)" }}>35€</span>
          </h2>

          <p className="gm-muted mt-6 max-w-md text-base leading-relaxed" style={{ fontFamily: "var(--font-body,sans-serif)" }}>
            Serie A, Premier League, Mondiali 2026 e oltre 700 maglie retro da 40€. Spedizione gratuita, reso entro 14 giorni.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/shop" className="gm-btn gm-btn-primary">
              <Tag className="h-4 w-4" />
              Scegli la tua maglia
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/shop/2026/27" className="gm-btn gm-btn-secondary">
              Nuovi arrivi 26/27
            </Link>
          </div>

          {totalOrders !== null && totalOrders > 0 && (
            <p className="mt-5 text-[12px] font-bold uppercase tracking-[0.16em] text-white/60" style={{ fontFamily: "var(--font-mono,monospace)" }}>
              {totalOrders.toLocaleString("it-IT")} ordini spediti
            </p>
          )}
        </div>

        {/* Maglia in evidenza (solo desktop) */}
        <div className={`hidden lg:block transition-all duration-700 delay-150 ${mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}>
          <div className="relative mx-auto w-[340px]">
            <div className="overflow-hidden rounded-[12px] bg-[#101010]" style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
              {current ? (
                <div style={{ opacity: visible ? 1 : 0, transition: "opacity 0.35s ease-in-out" }}>
                  <Link href={`/products/${current.slug || current.id}`} className="block">
                    <div className="relative h-[340px]" style={{ background: "#f1f1ec" }}>
                      <Image
                        src={current.image}
                        alt={current.name}
                        fill
                        className="object-contain p-5"
                        style={{ mixBlendMode: "multiply" }}
                        sizes="340px"
                      />
                      <span className="absolute left-3 top-3 rounded-[3px] bg-[#0a0a0a] px-2 py-1 text-[10px] font-black uppercase tracking-wide text-[#c8f000]" style={{ fontFamily: "var(--font-display,sans-serif)" }}>
                        {catLabel(current.category)}
                      </span>
                    </div>
                  </Link>
                  <div className="flex items-end justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-extrabold uppercase leading-tight text-white" style={{ fontFamily: "var(--font-display,sans-serif)" }}>
                        {cleanName(current.name)}
                      </h3>
                      <span className="text-[28px] font-extrabold leading-none text-[#c8f000]" style={{ fontFamily: "var(--font-display,sans-serif)" }}>
                        €{current.price.toFixed(2).replace(".00", "")}
                      </span>
                    </div>
                    <Link href={`/products/${current.slug || current.id}`} className="gm-btn gm-btn-primary !px-4 !py-2 !text-[13px]">
                      Scegli taglia
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs uppercase tracking-widest text-white/50">Caricamento…</div>
              )}
            </div>
            {pool.length > 1 && (
              <div className="mt-3 flex justify-center gap-1.5">
                {pool.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Maglia ${i + 1}`}
                    onClick={() => { setVisible(false); setTimeout(() => { setCurrentIdx(i); setVisible(true); }, 200); }}
                    style={{ width: i === currentIdx ? 22 : 8, height: 8, borderRadius: 2, background: i === currentIdx ? "#c8f000" : "rgba(255,255,255,0.3)", transition: "all 0.3s", border: "none", padding: 0 }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra offerte: fatti veri, un colpo d'occhio */}
      <div className="gm-lime-block relative z-10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-black/15 md:grid-cols-4">
          {offers.map(({ big, small }) => (
            <div key={big} className="flex items-baseline justify-center gap-2 px-3 py-3 text-center md:py-4">
              <span className="text-[30px] font-black leading-none md:text-[38px]" style={{ fontFamily: "var(--font-display,'Barlow Condensed',sans-serif)", fontVariantNumeric: "tabular-nums" }}>
                {big}
              </span>
              <span className="text-left text-[12px] font-bold uppercase leading-tight tracking-wide" style={{ fontFamily: "var(--font-display,sans-serif)" }}>
                {small}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
