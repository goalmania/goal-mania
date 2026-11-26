"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Tornando indietro da una scheda prodotto la lista deve ricomparire com'era: stesse maglie caricate, stessi filtri, stessa posizione.
// Il "ritorno" si riconosce da un segno lasciato quando si clicca una scheda; chi arriva da un altro link riparte da capo.
const TTL = 30 * 60 * 1000;

const read = (k: string) => {
  try {
    return sessionStorage.getItem(k);
  } catch {
    return null;
  }
};

function marker(path: string): { y: number } | null {
  const raw = read(`gm:back:${path}`);
  if (!raw) return null;
  try {
    const m = JSON.parse(raw);
    return Date.now() - m.t < TTL ? m : null;
  } catch {
    return null;
  }
}

// Una volta per lista: salva la posizione quando si apre una scheda e la ripristina al ritorno
export function useBackMemory() {
  const path = usePathname();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") || "";
      try {
        if (href.startsWith("/products/")) sessionStorage.setItem(`gm:back:${path}`, JSON.stringify({ y: window.scrollY, t: Date.now() }));
        else sessionStorage.removeItem(`gm:back:${path}`);
      } catch {}
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [path]);

  useEffect(() => {
    const m = marker(path);
    if (!m) return;
    const go = () => window.scrollTo({ top: m.y, behavior: "instant" as ScrollBehavior });
    const r = requestAnimationFrame(() => requestAnimationFrame(go));
    const t1 = window.setTimeout(go, 120);
    const t2 = window.setTimeout(go, 400);
    return () => {
      cancelAnimationFrame(r);
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// Come useState, ma al ritorno da una scheda riprende il valore che aveva
export function useRememberedState<T>(name: string, initial: T) {
  const path = usePathname();
  const key = `gm:st:${path}:${name}`;
  const [v, setV] = useState<T>(initial);
  const ready = useRef(false);

  useLayoutEffect(() => {
    if (marker(path)) {
      const raw = read(key);
      if (raw) {
        try {
          setV(JSON.parse(raw));
        } catch {}
      }
    }
    ready.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready.current) return;
    try {
      sessionStorage.setItem(key, JSON.stringify(v));
    } catch {}
  }, [key, v]);

  return [v, setV] as const;
}
