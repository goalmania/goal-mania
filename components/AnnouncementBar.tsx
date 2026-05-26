"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

const MESSAGES = [
  { text: "🚚 SPEDIZIONE GRATUITA su tutti gli ordini — nessun minimo!", href: "/shop" },
  { text: "🔥 Scorte limitate: solo pochi pezzi rimasti su alcune taglie!", href: "/shop" },
  { text: "⚡ Nuove Maglie 2026/27 disponibili — ordina adesso!", href: "/shop/2026/27" },
  { text: "🏆 Mondiali 2026 — Vesti la tua Nazionale prima che finiscano!", href: "/shop/worldcup" },
  { text: "🔄 Reso gratuito entro 30 giorni — acquisto senza rischi", href: "/shop" },
  { text: "⭐ Oltre 1.200 clienti soddisfatti — unisciti a loro!", href: "/shop" },
];

const DISMISS_KEY = "announcementBarDismissed_v3";
const TTL_MS = 12 * 60 * 60 * 1000;

// Flash sale countdown — 30 min window
const SALE_DURATION = 30 * 60;

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [countdown, setCountdown] = useState(SALE_DURATION);

  // Visibility check
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DISMISS_KEY);
      if (raw) {
        const ts = parseInt(raw, 10);
        if (Date.now() - ts < TTL_MS) return;
      }
    } catch {}
    setVisible(true);
  }, []);

  // Message rotation
  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setMsgIndex((i) => (i + 1) % MESSAGES.length);
        setAnimating(false);
      }, 300);
    }, 4500);
    return () => clearInterval(id);
  }, [visible]);

  // Countdown
  useEffect(() => {
    if (!visible) return;
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [visible, countdown]);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  const current = MESSAGES[msgIndex];
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div
      className="relative z-[61] overflow-hidden"
      style={{
        background: "#c8f000",
      }}
    >
      <div className="flex items-center justify-between px-4 py-2.5 max-w-7xl mx-auto">
        {/* Left: rotating message */}
        <Link href={current.href} className="flex-1 min-w-0 mr-4">
          <span
            className={`text-xs font-black uppercase tracking-[2px] text-[#0a0a0a] transition-all duration-300 block truncate ${
              animating ? "opacity-0 -translate-y-1" : "opacity-100 translate-y-0"
            }`}
            style={{
              fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
            }}
          >
            {current.text}
          </span>
        </Link>

        {/* Center: Flash sale countdown */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <span
            className="text-[10px] font-black uppercase tracking-[2px] text-[#0a0a0a]/70"
            style={{ fontFamily: "var(--font-mono, monospace)" }}
          >
            🔥 OFFERTA LAMPO — Scade tra:
          </span>
          <div className="flex items-center gap-0.5">
            <span
              className="font-black text-sm px-2 py-0.5 rounded"
              style={{
                fontFamily: "var(--font-mono, monospace)",
                background: "rgba(0,0,0,0.15)",
                color: "#0a0a0a",
              }}
            >
              {pad(minutes)}
            </span>
            <span className="font-black text-sm" style={{ color: "#0a0a0a" }}>:</span>
            <span
              className="font-black text-sm px-2 py-0.5 rounded"
              style={{
                fontFamily: "var(--font-mono, monospace)",
                background: "rgba(0,0,0,0.15)",
                color: "#0a0a0a",
              }}
            >
              {pad(seconds)}
            </span>
          </div>
        </div>

        {/* Right: dots + dismiss */}
        <div className="flex items-center gap-2 ml-4">
          <div className="hidden sm:flex items-center gap-1">
            {MESSAGES.map((_, i) => (
              <span
                key={i}
                className="inline-block rounded-full transition-all duration-300"
                style={{
                  width: i === msgIndex ? "12px" : "4px",
                  height: "4px",
                  background: i === msgIndex ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.2)",
                }}
              />
            ))}
          </div>
          <button
            onClick={dismiss}
            aria-label="Chiudi"
            className="p-0.5 opacity-50 hover:opacity-90 transition-opacity"
          >
            <XMarkIcon className="h-3.5 w-3.5 text-[#0a0a0a]" />
          </button>
        </div>
      </div>
    </div>
  );
}
