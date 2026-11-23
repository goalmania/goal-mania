"use client";

import { useEffect, useState } from "react";
import { ERA_ORDER, ERA_THEME } from "@/lib/eraTheme";

// Indice delle ere: resta sotto l'intestazione e si accende sull'era che stai guardando
export default function EraDock() {
  const [active, setActive] = useState(ERA_ORDER[0]);
  useEffect(() => {
    const els = ERA_ORDER.map((s) => document.getElementById(s)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0, 0.2, 0.5, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return (
    <nav className="era-dock" aria-label="Salta a un decennio">
      <ul>
        {ERA_ORDER.map((s) => (
          <li key={s}>
            <a href={`#${s}`} aria-current={active === s ? "true" : undefined}>
              {ERA_THEME[s].numeral}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
