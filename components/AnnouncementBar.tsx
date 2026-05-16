"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

const MESSAGES = [
  { text: "🚚 Spedizione Gratuita sopra €89 | 30 giorni di reso gratuito", href: "/shop" },
  { text: "⚡ Personalizza la tua maglia con nome e numero!", href: "/shop" },
  { text: "🏆 Maglie ufficiali Mondiali 2026 — disponibili ora!", href: "/shop/worldcup" },
  { text: "🔒 Pagamenti 100% Sicuri · Originale Garantito · Spedizione Express", href: "/shop" },
];

const DISMISS_KEY = "announcementBarDismissed_v2";
const TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

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

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  const current = MESSAGES[msgIndex];

  return (
    <div
      className="relative z-[60] flex items-center justify-center px-8 py-2.5 overflow-hidden"
      style={{
        background: "linear-gradient(90deg, #0a0a0a 0%, #111 40%, #0a0a0a 100%)",
        borderBottom: "1px solid rgba(200,240,0,0.2)",
      }}
    >
      {/* Animated lime scan line */}
      <div
        className="absolute inset-y-0 left-0 w-[60px] opacity-20"
        style={{
          background: "linear-gradient(90deg, transparent, #c8f000, transparent)",
          animation: "scanLine 4s linear infinite",
        }}
      />

      <Link href={current.href} className="flex-1 text-center">
        <span
          className={`text-xs font-black uppercase tracking-[3px] text-[#c8f000] transition-all duration-300 ${
            animating ? "opacity-0 -translate-y-1" : "opacity-100 translate-y-0"
          }`}
          style={{
            fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
            display: "inline-block",
          }}
        >
          {current.text}
        </span>
      </Link>

      {/* Message dots */}
      <div className="flex items-center gap-1 mx-3">
        {MESSAGES.map((_, i) => (
          <span
            key={i}
            className="inline-block rounded-full transition-all duration-300"
            style={{
              width: i === msgIndex ? "12px" : "4px",
              height: "4px",
              background: i === msgIndex ? "#c8f000" : "rgba(200,240,0,0.2)",
            }}
          />
        ))}
      </div>

      <button
        onClick={dismiss}
        aria-label="Chiudi"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-30 hover:opacity-80 transition-opacity"
      >
        <XMarkIcon className="h-3.5 w-3.5 text-white" />
      </button>
    </div>
  );
}
