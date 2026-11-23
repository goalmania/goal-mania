"use client";

import { useState } from "react";
import ProductCard from "@/components/ui/ProductCard";
import type { ArchiveItem } from "@/lib/archive";

const STEP = 24;

// Le maglie si caricano 24 alla volta: la pagina resta leggera anche con 270 maglie
export default function ArchiveGrid({ items }: { items: ArchiveItem[] }) {
  const [n, setN] = useState(STEP);
  return (
    <>
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-9 px-5 md:grid-cols-3 md:px-8 lg:grid-cols-4 lg:gap-x-6">
        {items.slice(0, n).map((p, i) => (
          <ProductCard key={p.id} id={p.id} slug={p.slug} name={p.name} price={p.price} image={p.image} category="Retro" team={p.year ? String(p.year) : "Retro"} priority={i < 4} />
        ))}
      </div>
      {n < items.length && (
        <div className="mt-10 flex justify-center px-5">
          <button onClick={() => setN((v) => v + STEP)} className="btn btn-lime">
            Mostra altre {Math.min(STEP, items.length - n)} maglie
          </button>
        </div>
      )}
    </>
  );
}
