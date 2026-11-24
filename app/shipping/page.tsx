import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Spedizioni — Gratuite in Italia, consegna in 7-10 giorni",
  description:
    "Spedizione gratuita su tutti gli ordini in Italia. Consegna in 7-10 giorni lavorativi con tracking via email. Reso entro 14 giorni.",
  alternates: {
    canonical: "https://goal-mania.it/shipping",
  },
};

const items = [
  {
    h: "Costo",
    p: "La spedizione è gratuita su ogni ordine in Italia, senza importo minimo.",
  },
  {
    h: "Tempi",
    p: "La consegna richiede 7-10 giorni lavorativi dal momento dell'ordine.",
  },
  {
    h: "Tracking",
    p: "Quando l'ordine parte ricevi un'email con il numero di tracking. Puoi seguire la spedizione anche da Account > I miei ordini.",
  },
  {
    h: "Altri paesi",
    p: "Per ordini fuori dall'Italia costi e tempi sono mostrati al checkout. Eventuali dazi o tasse doganali sono a carico del destinatario.",
  },
  {
    h: "Pacco danneggiato o sbagliato",
    p: "Scrivici con una foto entro pochi giorni dalla consegna: sostituiamo la maglia o rimborsiamo, senza costi per te. Tutti i dettagli sono nella pagina Resi e Rimborsi.",
  },
];

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <div className="mx-auto max-w-3xl px-5 py-14 sm:py-20">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#c8f000]">Assistenza</p>
        <h1 className="mb-4 text-4xl font-black sm:text-5xl">Spedizioni</h1>
        <p className="mb-10 text-lg text-white/80">
          Gratuite su tutti gli ordini in Italia. Consegna in 7-10 giorni lavorativi.
        </p>
        <div className="space-y-8">
          {items.map((s) => (
            <section key={s.h} className="border-t border-white/10 pt-6">
              <h2 className="mb-2 text-xl font-bold text-white">{s.h}</h2>
              <p className="leading-relaxed text-white/80">{s.p}</p>
            </section>
          ))}
        </div>
        <p className="mt-12 text-white/80">
          Vuoi restituire una maglia? Leggi <Link href="/resi" className="text-[#c8f000] underline">Resi e Rimborsi</Link>. Altre domande?{" "}
          <Link href="/contact" className="text-[#c8f000] underline">Contattaci</Link>.
        </p>
      </div>
    </main>
  );
}
