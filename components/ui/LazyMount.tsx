"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Monta il contenuto solo quando sta per entrare in vista: le sezioni in fondo alla pagina non pesano sul primo caricamento
export default function LazyMount({ children, minHeight = 320, rootMargin = "900px" }: { children: ReactNode; minHeight?: number; rootMargin?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return setOn(true);
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setOn(true);
        io.disconnect();
      }
    }, { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);
  return <div ref={ref} style={on ? undefined : { minHeight }}>{on ? children : null}</div>;
}
