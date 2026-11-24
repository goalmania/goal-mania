"use client";

import { useEffect, useState } from "react";

// shortcut: scadenza fissa in codice per questa campagna, da aggiornare a mano per la prossima
const DEADLINE = new Date("2026-11-30T23:59:59+01:00").getTime();

function format(ms: number) {
  const totalMin = Math.floor(ms / 60000);
  const days = Math.floor(totalMin / 1440);
  const hours = Math.floor((totalMin % 1440) / 60);
  const minutes = totalMin % 60;
  if (days > 0) return `${days}g ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function BlackFridayCountdown() {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setLeft(DEADLINE - Date.now());
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  if (left === null || left <= 0) return null;

  return (
    <p className="rise mt-3 flex items-center gap-2 text-[14px] font-semibold text-[var(--lime)]" style={{ animationDelay: "110ms" }}>
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--lime)]" aria-hidden="true" />
      Finisce tra {format(left)}
    </p>
  );
}
