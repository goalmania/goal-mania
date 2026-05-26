"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Zap, ShoppingCart, Clock } from "lucide-react";

const DEALS = [
  {
    id: 1,
    emoji: "🇦🇷",
    team: "Argentina",
    label: "Mondiali 2026",
    price: "€30",
    originalPrice: "€45",
    savings: "-33%",
    href: "/shop/worldcup/argentina",
    urgency: "Solo 3 taglie rimaste!",
    color: "rgba(117,170,219,0.15)",
    accent: "#74AADB",
  },
  {
    id: 2,
    emoji: "🔴",
    team: "Arsenal",
    label: "Premier League",
    price: "€35",
    originalPrice: "€50",
    savings: "-30%",
    href: "/shop/premier-league/arsenal",
    urgency: "12 persone stanno guardando",
    color: "rgba(200,0,0,0.12)",
    accent: "#EF4444",
  },
  {
    id: 3,
    emoji: "⚫🔵",
    team: "Inter",
    label: "Serie A",
    price: "€30",
    originalPrice: "€42",
    savings: "-29%",
    href: "/shop/serieA/inter",
    urgency: "Ultimi 2 disponibili!",
    color: "rgba(0,60,150,0.15)",
    accent: "#3B82F6",
  },
  {
    id: 4,
    emoji: "🌍",
    team: "Maglie Retro",
    label: "Edizione Storica",
    price: "€35",
    originalPrice: "€55",
    savings: "-36%",
    href: "/shop/retro",
    urgency: "Collezione limitata!",
    color: "rgba(200,240,0,0.08)",
    accent: "#c8f000",
  },
];

const DISMISS_KEY = "urgencyFloat_v2";
const TTL_MS = 4 * 60 * 60 * 1000; // 4 ore
const SHOW_DELAY = 6000; // 6 secondi
const COUNTDOWN_START = 18 * 60; // 18 minuti

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function UrgencyFloat() {
  const [visible, setVisible] = useState(false);
  const [dealIdx, setDealIdx] = useState(0);
  const [countdown, setCountdown] = useState(COUNTDOWN_START);
  const [animating, setAnimating] = useState(false);

  // Show after delay, respecting dismiss TTL
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DISMISS_KEY);
      if (raw) {
        const ts = parseInt(raw, 10);
        if (Date.now() - ts < TTL_MS) return;
      }
    } catch {}

    // Pick a random deal index
    setDealIdx(Math.floor(Math.random() * DEALS.length));

    const timer = setTimeout(() => setVisible(true), SHOW_DELAY);
    return () => clearTimeout(timer);
  }, []);

  // Countdown
  useEffect(() => {
    if (!visible) return;
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [visible, countdown]);

  // Auto-rotate deals every 8 sec
  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setDealIdx((i) => (i + 1) % DEALS.length);
        setAnimating(false);
      }, 300);
    }, 8000);
    return () => clearInterval(id);
  }, [visible]);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  const deal = DEALS[dealIdx];
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
          <div
            className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: deal.color }}
          >
            {deal.emoji}
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
              <span className="text-white/30 text-xs line-through">{deal.originalPrice}</span>
              <span
                className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}
              >
                {deal.savings}
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
        {DEALS.map((_, i) => (
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
