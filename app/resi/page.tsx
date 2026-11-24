import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Resi e Rimborsi | Goal Mania",
  description:
    "Hai 14 giorni dalla consegna per restituire la maglia. Come fare il reso, chi paga la spedizione e quando ricevi il rimborso.",
  alternates: { canonical: "https://goal-mania.it/resi" },
};

const sections = [
  {
    h: "Quanto tempo hai",
    p: "Hai 14 giorni dalla consegna per ripensarci, senza dover spiegare il motivo. Scrivici entro questo termine a goalmaniaofficial@gmail.com con il numero d'ordine e ti diamo l'indirizzo per rispedire la maglia.",
  },
  {
    h: "Come deve tornare la maglia",
    p: "Non indossata, non lavata, con cartellino e nella confezione originale. Le maglie personalizzate con nome e numero non si possono restituire, perché fatte apposta per te (art. 59 del Codice del Consumo).",
  },
  {
    h: "Chi paga la spedizione del reso",
    p: "Per un reso volontario la spedizione di ritorno è a carico tuo. Se la maglia arriva difettosa o diversa dall'ordine, la spedizione la paghiamo noi.",
  },
  {
    h: "Quando ricevi il rimborso",
    p: "Rimborsiamo l'importo pagato, con lo stesso metodo di pagamento, entro 14 giorni da quando riceviamo la maglia e la controlliamo.",
  },
  {
    h: "Maglia difettosa o sbagliata",
    p: "Scrivici entro pochi giorni dalla consegna con una foto. Ti mandiamo la sostituzione o ti rimborsiamo, senza costi per te. Resta valida la garanzia legale di conformità di 24 mesi.",
  },
];

export default function ResiPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-3xl px-5 py-14 sm:py-20">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#c8f000]">Assistenza</p>
        <h1 className="mb-4 text-4xl font-black sm:text-5xl">Resi e Rimborsi</h1>
        <p className="mb-10 text-lg text-white/80">
          Spedizione gratuita su ogni ordine. Se la maglia non ti convince, hai 14 giorni per restituirla.
        </p>
        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.h} className="border-t border-white/10 pt-6">
              <h2 className="mb-2 text-xl font-bold text-white">{s.h}</h2>
              <p className="leading-relaxed text-white/80">{s.p}</p>
            </section>
          ))}
        </div>
        <p className="mt-12 text-white/80">
          Dubbi sull&apos;ordine? Guarda le <Link href="/shipping" className="text-[#c8f000] underline">informazioni di spedizione</Link> o{" "}
          <Link href="/contact" className="text-[#c8f000] underline">contattaci</Link>.
        </p>
      </div>
    </main>
  );
}
