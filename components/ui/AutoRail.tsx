"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Fila orizzontale che scorre da sola e si lascia guidare a mano (dito, rotella, trascinamento, frecce).
// Appena la tocchi si ferma per qualche secondo, poi riparte. Va avanti e torna indietro, senza salti.
export default function AutoRail({
  children,
  className = "",
  speed = 38,
  label,
  auto = true,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
  label?: string;
  auto?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const hold = useRef<(ms?: number) => void>(() => {});

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = 0;
    let acc = el.scrollLeft;
    let dir = 1;
    let visible = false;
    let hovering = false;
    let holdUntil = 0;
    hold.current = (ms = 4000) => {
      holdUntil = performance.now() + ms;
    };

    const tick = (t: number) => {
      const dt = Math.min(64, t - last);
      last = t;
      if (auto && !reduce && visible && !hovering && t > holdUntil && !document.hidden) {
        const max = el.scrollWidth - el.clientWidth;
        if (max > 4) {
          if (Math.abs(el.scrollLeft - acc) > 1.5) acc = el.scrollLeft; // l'utente ha spostato la fila
          if (dir > 0 && acc >= max - 1) {
            dir = -1;
            holdUntil = t + 1500;
          } else if (dir < 0 && acc <= 1) {
            dir = 1;
            holdUntil = t + 1500;
          } else {
            acc = Math.min(max, Math.max(0, acc + (dir * speed * dt) / 1000));
            el.scrollLeft = acc;
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    raf = requestAnimationFrame(tick);

    const pause = () => hold.current(4500);
    const enter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") hovering = true;
    };
    const leave = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        hovering = false;
        hold.current(1200);
      }
    };

    // Trascinamento col mouse: il click sui link si blocca solo se hai davvero trascinato
    let startX = 0;
    let startLeft = 0;
    let down = false;
    let moved = false;
    const onDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      down = true;
      moved = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
    };
    const onMove = (e: MouseEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) {
        moved = true;
        el.style.userSelect = "none";
        el.style.cursor = "grabbing";
      }
      if (moved) el.scrollLeft = startLeft - dx;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      el.style.userSelect = "";
      el.style.cursor = "";
      if (moved) hold.current(4500);
    };
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };

    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("wheel", pause, { passive: true });
    el.addEventListener("keydown", pause);
    el.addEventListener("focusin", pause);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("mousedown", onDown);
    el.addEventListener("click", onClick, true);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("wheel", pause);
      el.removeEventListener("keydown", pause);
      el.removeEventListener("focusin", pause);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("mousedown", onDown);
      el.removeEventListener("click", onClick, true);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [auto, speed]);

  const go = (d: number) => {
    const el = ref.current;
    if (!el) return;
    hold.current(6000);
    el.scrollBy({ left: d * Math.max(260, el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <div className="rail-wrap group/rail relative" role="region" aria-label={label}>
      <div ref={ref} className={`rail rail-free ${className}`} tabIndex={0}>
        {children}
      </div>
      <button type="button" aria-label="Indietro" onClick={() => go(-1)} className="rail-arrow left-3 lg:left-6">
        <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
      </button>
      <button type="button" aria-label="Avanti" onClick={() => go(1)} className="rail-arrow right-3 lg:right-6">
        <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
      </button>
    </div>
  );
}
