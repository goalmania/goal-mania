"use client";

import { useEffect, useState } from "react";

export type SearchItem = { id: string; slug: string; title: string; price: number; image: string; category: string; norm: string };

const ALIASES: string[][] = [
  ["fiorentina", "viola"], ["torino", "toro"], ["barcellona", "barcelona", "barca"], ["tottenham", "spurs"], ["atletico", "atleti"],
  ["italia", "italy"], ["brasile", "brazil"], ["francia", "france"], ["germania", "germany"], ["spagna", "spain"], ["portogallo", "portugal"],
  ["inghilterra", "england"], ["olanda", "netherlands", "holland"], ["belgio", "belgium"], ["croazia", "croatia"], ["marocco", "morocco"],
  ["messico", "mexico"], ["giappone", "japan"], ["juventus", "juve"], ["manchester united", "man united", "man. united", "man utd"], ["manchester city", "man city"],
  ["milan", "ac milan"], ["bayern", "bayern monaco"], ["retro", "vintage"],
];

const strip = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const lookup = new Map<string, string[]>();
for (const g of ALIASES) for (const t of g) lookup.set(strip(t), g.map(strip));

let cache: SearchItem[] | null = null;
let pending: Promise<SearchItem[]> | null = null;

export function loadIndex(): Promise<SearchItem[]> {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = fetch("/api/search-index")
      .then((r) => r.json())
      .then((rows: any[]) => {
        cache = rows.map(([id, slug, title, price, image, category]) => ({ id, slug, title, price, image, category, norm: strip(String(title) + " " + String(category) + " " + String(slug).replace(/-/g, " ")) }));
        return cache;
      })
      .catch(() => {
        pending = null;
        return [];
      });
  }
  return pending;
}

// Ogni parola deve comparire (con i suoi soprannomi); i titoli che iniziano con la parola vengono prima
export function searchItems(items: SearchItem[], query: string, limit = 60): SearchItem[] {
  const words = strip(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const variants = words.map((w) => lookup.get(w) ?? [w]);
  const out: { it: SearchItem; s: number }[] = [];
  for (const it of items) {
    let score = 0;
    let ok = true;
    for (const vs of variants) {
      const hit = vs.find((v) => it.norm.includes(v));
      if (!hit) {
        ok = false;
        break;
      }
      score += it.norm.startsWith("maglia " + hit) || it.norm.startsWith(hit) ? 3 : 1;
    }
    if (ok) out.push({ it, s: score });
  }
  return out.sort((a, b) => b.s - a.s).slice(0, limit).map((x) => x.it);
}

export function useSearchIndex(active = true) {
  const [items, setItems] = useState<SearchItem[]>(cache ?? []);
  useEffect(() => {
    if (!active) return;
    let on = true;
    loadIndex().then((r) => on && setItems(r));
    return () => { on = false; };
  }, [active]);
  return items;
}
