"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Zap, ShoppingCart, Clock } from "lucide-react";

const URGENCY_MESSAGES = [
  "Solo 3 taglie rimaste!",
  "12 persone stanno guardando",
  "Ultimi 2 disponibili!",
  "Collezione limitata!",
  "5 ordini nelle ultime 2h",
  "Quasi esaurito!",
  "Alta richiesta oggi",
];

const ACCENTS = ["#c8f000", "#74AADB", "#EF4444", "#F97316", "#A78BFA"];
const COLORS = [
  "rgba(200,240,0,0.08)",
  "rgba(117,170,219,0.12)",
  "rgba(239,68,68,0.10)",
  "rgba(249,115,22,0.10)",
  "rgba(167,139,250,0.10)",
];

const DISMISS_KEY = "urgencyFloat_v3";
const TTL_MS = 4 * 60 * 60 * 1000; // 4 ore
const SHOW_DELAY = 7000; // 7 secondi
const COUNTDOWN_START = 18 * 60; // 18 minuti

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function extractTeamName(title: string): string {
  // "Maglia Arsenal Home 2026-27" → "Arsenal"
  // "Maglia Inter Away 25/26" → "Inter"
  const cleaned = title
    .replace(/^maglia\s+/i, "")
    .replace(/\s+(home|away|third|portiere|gk|goalkeeper|training|allenamento)\s*.*/i, "")
    .replace(/\s+\d{4}[\/-]\d{2,4}.*$/i, "")
    .trim();
  return cleaned || title;
}

function getCategoryLabel(category: string, isWorldCup: boolean, isRetro: boolean): string {
  if (isWorldCup) return "Mondiali 2026";
  if (isRetro) return "Edizione Storica";
  if (category === "2025/26") return "Stagione 25/26";
  if (category === "2026/27") return "Nuova Stagione";
  return category || "Maglia da Calcio";
}

interface Deal {
  id: string;
  image: string;
  team: string;
  label: string;
  price: string;
  href: string;
  urgency: string;
  accent: string;
  color: string;
}

export default function UrgencyFloat() {
  const [visible, setVisible] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [dealIdx, setDealIdx] = useState(0);
  const [countdown, setCountdown] = useState(COUNTDOWN_START);
  const [animating, setAnimating] = useState(false);
  const fetchedRef = useRef(false);

  // Fetch real products once — mix attuali + retro + mondiali
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const shuffle = (arr: any[]) =>
      arr.map((p) => ({ p, s: Math.random() })).sort((a, b) => a.s - b.s).map(({ p }) => p);

    fetch("/api/products?limit=100")
      .then((r) => r.json())
      .then((data) => {
        const prods: any[] = (data.products || []).filter((p: any) => p.images?.[0] && p.slug);
        if (prods.length === 0) return;

        const worldCup = prods.filter((p) => p.isWorldCup);
        const retro    = prods.filter((p) => p.isRetro && !p.isWorldCup);
        const current  = prods.filter((p) => !p.isRetro && !p.isWorldCup);

        // 3 da ogni categoria (o meno se non ne ha abbastanza), poi shuffle
        const pool = [
          ...shuffle(current).slice(0, 3),
          ...shuffle(retro).slice(0, 3),
          ...shuffle(worldCup).slice(0, 3),
        ];

        const mixed = shuffle(pool.length >= 3 ? pool : shuffle(prods).slice(0, 9)).slice(0, 9);
        if (mixed.length === 0) return;

        const mapped: Deal[] = mixed.map((p: any, i: number) => ({
          id: p._id,
          image: p.images[0],
          team: extractTeamName(p.title),
          label: getCategoryLabel(p.category, !!p.isWorldCup, !!p.isRetro),
          price: `€${p.basePrice ?? 30}`,
          href: `/products/${p.slug}`,
          urgency: URGENCY_MESSAGES[Math.floor(Math.random() * URGENCY_MESSAGES.length)],
          accent: ACCENTS[i % ACCENTS.length],
          color: COLORS[i % COLORS.length],
        }));

        setDeals(mapped);
        setDealIdx(Math.floor(Math.random() * mapped.length));
      })
      .catch(() => {});
  }, []);

  // Show after delay, respecting dismiss TTL
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DISMISS_KEY);
      if (raw) {
        const ts = parseInt(raw, 10);
        if (Date.now() - ts < TTL_MS) return;
      }
    } catch {}

    const timer = setTimeout(() => {
      if (deals.length > 0) setVisible(true);
    }, SHOW_DELAY);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deals]);

  // Countdown
  useEffect(() => {
    if (!visible) return;
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [visible, countdown]);

  // Auto-rotate deals every 8 sec
  useEffect(() => {
    if (!visible || deals.length === 0) return;
    const id = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setDealIdx((i) => (i + 1) % deals.length);
        setAnimating(false);
      }, 300);
    }, 8000);
    return () => clearInterval(id);
  }, [visible, deals]);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setVisible(false);
  };

  if (!visible || deals.length === 0) return null;

  const deal = deals[dealIdx];
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div
      className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-5 sm:w-[320px] z-[90] transition-all duration-500"
      style={{
        transform: visible ? "translateY(0)" : "translateY(120%)",
        opacity: animating ? 0 : 1,
      }}
    >
      <div
        className="rounded-2xl overflow-hidden font-munish"
        style={{
          background: "#111",
          border: "1px solid rgba(200,240,0,0.2)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(200,240,0,0.05)",
        }}
      >
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ background: deal.color, borderBottom: `1px solid ${deal.accent}25` }}
        >
          <div className="flex items-center gap-2">
            <Zap size={12} style={{ color: deal.accent }} />
            <span
              className="text-[10px] font-black uppercase tracking-[2px]"
              style={{ color: deal.accent }}
            >
              Offerta lampo
            </span>
          </div>
          {/* Countdown */}
          <div className="flex items-center gap-1.5">
            <Clock size={10} className="text-white/40" />
            <span
              className="text-[11px] font-black tabular-nums"
              style={{ color: "#c8f000", fontFamily: "var(--font-mono, monospace)" }}
            >
              {pad(minutes)}:{pad(seconds)}
            </span>
          </div>
          <button
            onClick={dismiss}
            className="w-6 h-6 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={12} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3 flex items-center gap-3">
          {/* Product image */}
          <div
            className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden relative"
            style={{ background: deal.color }}
          >
            <Image
              src={deal.image}
              alt={deal.team}
              fill
              sizes="56px"
              className="object-cover"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-sm leading-tight truncate">
              {deal.team}
            </p>
            <p className="text-white/40 text-[10px] uppercase tracking-wider">
              {deal.label}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-black text-white text-base">{deal.price}</span>
              <span
                className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(200,240,0,0.12)", color: "#c8f000" }}
              >
                SPEDIZIONE GRATIS
              </span>
            </div>
          </div>
        </div>

        {/* Urgency text */}
        <div
          className="px-4 py-2 flex items-center gap-1.5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          <span className="text-[9px] animate-pulse" style={{ color: "#f97316" }}>●</span>
          <span className="text-[10px] text-white/50">{deal.urgency}</span>
        </div>

        {/* CTA */}
        <div className="px-3 pb-3">
          <Link
            href={deal.href}
            onClick={dismiss}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-black uppercase text-[11px] tracking-widest transition-all active:scale-95"
            style={{ background: "#c8f000", color: "#000" }}
          >
            <ShoppingCart size={12} />
            Vedi la Maglia
          </Link>
        </div>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-1 mt-2">
        {deals.map((_, i) => (
          <span
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === dealIdx ? 16 : 4,
              height: 4,
              background: i === dealIdx ? "#c8f000" : "rgba(255,255,255,0.15)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
