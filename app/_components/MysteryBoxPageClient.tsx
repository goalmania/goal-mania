"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import TrustBar from "@/components/home/TrustBar";
import { Product } from "@/lib/types/home";

const fmt = (n: number) => (Number.isInteger(Number(n)) ? String(Number(n)) : Number(n).toFixed(2).replace(".", ","));

// La scatola misteriosa: una maglia a sorpresa. La scelta delle squadre da evitare si fa nella scheda del prodotto.
export default function MysteryBoxPageClient({ products }: { products: Product[] }) {
  return (
    <div>
      <PageHeader eyebrow="Maglia a sorpresa" title="Scatola misteriosa" lead="Ordini una maglia a sorpresa. Nella scheda indichi le squadre che non vuoi, e quelle le escludiamo." />
      <section className="mx-auto grid w-full max-w-[1760px] gap-6 px-5 pb-12 md:px-10 lg:grid-cols-3 lg:px-16">
        {[
          { n: "1", t: "Scegli la scatola", d: "Apri la scheda e guarda cosa include." },
          { n: "2", t: "Escludi le squadre", d: "Scrivi fino a 5 squadre o colori che non vuoi ricevere." },
          { n: "3", t: "Aspetta il pacco", d: "Spedizione gratuita, consegna in 7-10 giorni lavorativi." },
        ].map((s) => (
          <div key={s.n} className="flex gap-4 rounded-3xl bg-[var(--wall)] p-5 shadow-[inset_0_0_0_1px_var(--line)]">
            <span className="pc-price text-[var(--lime)]">{s.n}</span>
            <span>
              <span className="block text-[19px] font-bold text-white">{s.t}</span>
              <span className="mt-1 block text-[16px] italic text-[var(--text-2)]">{s.d}</span>
            </span>
          </div>
        ))}
      </section>

      <section className="mx-auto w-full max-w-[1760px] px-5 pb-16 md:px-10 lg:px-16" aria-label="Scatole disponibili">
        {products.length === 0 ? (
          <p className="rounded-3xl bg-[var(--wall)] px-6 py-14 text-center text-[18px] italic text-[var(--text-2)] shadow-[inset_0_0_0_1px_var(--line)]">Al momento non ci sono scatole disponibili.</p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <li key={p.id}>
                <Link href={`/products/${(p as any).slug || p.id}`} className="pc group block">
                  <span className="pc-stage" style={{ aspectRatio: "1 / 1" }}>
                    <Image src={p.image} alt={p.name} fill sizes="(max-width: 640px) 90vw, 400px" className="z-[1] object-contain p-6 transition-transform duration-500 group-hover:scale-[1.05]" style={{ mixBlendMode: "multiply" }} />
                  </span>
                  <span className="pc-body">
                    <span className="pc-name block">{p.name}</span>
                    <span className="mt-4 flex items-center justify-between">
                      <span className="pc-price">{fmt(p.price)}€</span>
                      <span className="btn btn-lime !h-11 !px-5 !text-[17px]">Scegli <ArrowRight className="h-4 w-4" strokeWidth={3} /></span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <TrustBar />
    </div>
  );
}
