"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const MESSAGES = [
  "🚚 Spedizione gratuita in Italia per ordini superiori a €50",
  "⚡ Personalizza la tua maglia con nome e numero!",
  "🏆 Maglie ufficiali Mondiali 2026 — disponibili ora!",
];

const DISMISS_KEY = "announcementBarDismissed";
const TTL_MS = 24 * 60 * 60 * 1000;

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);

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
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(id);
  }, [visible]);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="bg-[#f5963c] text-white text-xs font-semibold flex items-center justify-center gap-3 px-4 py-2 relative">
      <span className="text-center leading-tight">{MESSAGES[msgIndex]}</span>
      <button
        onClick={dismiss}
        aria-label="Chiudi"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-70 hover:opacity-100 transition-opacity"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
