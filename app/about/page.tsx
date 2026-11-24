import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import TrustBar from "@/components/home/TrustBar";

export const metadata: Metadata = {
  title: "Chi siamo | Goal Mania",
  description: "Goal Mania vende maglie da calcio: le attuali a 35€ e le retro a 40€, con spedizione gratuita in Italia e reso entro 14 giorni.",
  alternates: { canonical: "https://goal-mania.it/about" },
};

const POINTS = [
  { t: "Prezzi chiari", d: "Le maglie della stagione costano 35€, le retro 40€. Il prezzo che vedi è quello che paghi, con la spedizione compresa." },
  { t: "Tre maglie, ne paghi due", d: "Se metti tre maglie nello stesso ordine, la meno cara è in regalo. Lo vedi nel carrello prima di pagare." },
  { t: "Un archivio vero", d: "Dalle stagioni di adesso fino agli anni 70: maglie di club e nazionali, ordinate per decennio, Mondiale, squadra e leggenda." },
  { t: "Pacchi che puoi vedere", d: "Preparati e spediti da noi. Sul sito trovi le foto e i video dei pacchi veri che escono ogni giorno." },
];

export default function AboutPage() {
  return (
    <div>
      <PageHeader eyebrow="Chi siamo" title={<>Maglie da calcio, <span className="mark"><span>senza giri.</span></span></>} lead="Goal Mania è un negozio online di maglie da calcio. Qui sotto trovi come lavoriamo e a cosa puoi contare." />
      <section className="mx-auto grid w-full max-w-[1760px] gap-5 px-5 pb-14 md:grid-cols-2 md:px-10 lg:px-16">
        {POINTS.map((p, i) => (
          <article key={p.t} className="rounded-3xl bg-[var(--wall)] p-6 shadow-[inset_0_0_0_1px_var(--line)] md:p-8">
            <span className="pc-price text-[var(--lime)]">{String(i + 1).padStart(2, "0")}</span>
            <h2 className="disp mt-2 text-[clamp(1.8rem,3vw,2.6rem)] text-white">{p.t}</h2>
            <p className="mt-3 max-w-[48ch] text-[18px] leading-relaxed text-[var(--text-2)]">{p.d}</p>
          </article>
        ))}
      </section>
      <section className="mx-auto flex w-full max-w-[1760px] flex-wrap items-center justify-between gap-6 px-5 pb-16 md:px-10 lg:px-16">
        <Image src="/images/recentUpdate/goalmania-wordmark.png" alt="Goal Mania" width={1906} height={977} className="h-auto w-[min(86vw,420px)]" />
        <div className="flex flex-wrap gap-3">
          <Link href="/shop" className="btn btn-lime">Vai alle maglie <ArrowRight className="h-5 w-5" strokeWidth={3} /></Link>
          <Link href="/contact" className="btn btn-ghost">Scrivici</Link>
        </div>
      </section>
      <TrustBar />
    </div>
  );
}
