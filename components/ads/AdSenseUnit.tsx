"use client";

import { useEffect, useRef } from "react";

// ─── CONFIGURAZIONE ────────────────────────────────────────────────────────────
// Sostituisci questi valori con quelli reali dopo l'approvazione AdSense:
//   Publisher ID → https://adsense.google.com → Account → Informazioni account
//   Ad Slot ID   → AdSense → Annunci → Per annuncio → crea unità annuncio

// Publisher ID reale — account Google AdSense goal-mania.it
const PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ?? "ca-pub-1255454616752120";

// Slot IDs — crea 3 unità annuncio su AdSense → Annunci → Per annuncio → Nuovo
// e sostituisci i placeholder con gli ID reali nelle env Vercel
const AD_SLOTS: Record<AdPosition, string> = {
  "in-article":  process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE  ?? "SLOT_IN_ARTICLE",
  "bottom":      process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM       ?? "SLOT_BOTTOM",
  "list-banner": process.env.NEXT_PUBLIC_ADSENSE_SLOT_LIST_BANNER  ?? "SLOT_LIST_BANNER",
};

export type AdPosition = "in-article" | "bottom" | "list-banner";

interface Props {
  position: AdPosition;
  className?: string;
}

export default function AdSenseUnit({ position, className = "" }: Props) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  const isPlaceholder = AD_SLOTS[position].startsWith("SLOT_");

  useEffect(() => {
    if (isPlaceholder || pushed.current) return;
    try {
      pushed.current = true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // AdSense non ancora caricato
    }
  }, [isPlaceholder]);

  // Placeholder visibile solo in sviluppo o prima dell'approvazione AdSense
  if (isPlaceholder) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl ${className}`}
        style={{
          minHeight: position === "list-banner" ? 90 : 250,
          background: "rgba(200,240,0,0.03)",
          border: "1px dashed rgba(200,240,0,0.2)",
        }}
      >
        <p
          className="text-center text-xs"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.4)" }}
        >
          // AdSense — crea unità annuncio su AdSense e imposta NEXT_PUBLIC_ADSENSE_SLOT_* in Vercel
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={AD_SLOTS[position]}
        data-ad-format={position === "list-banner" ? "horizontal" : "auto"}
        data-full-width-responsive="true"
      />
    </div>
  );
}
