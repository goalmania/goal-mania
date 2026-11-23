const ROWS = [
  { k: "Prezzo fisso", v: "35€ le maglie attuali, 40€ le retro. Niente sorprese al checkout." },
  { k: "Spedizione", v: "Gratuita in Italia. Consegna in 7-10 giorni lavorativi, con tracking via email alla partenza." },
  { k: "Reso", v: "14 giorni dalla consegna. Maglia non indossata, con cartellino. Spese di reso a carico tuo." },
  { k: "Pagamento", v: "Carta, Apple Pay, Google Pay, PayPal e Klarna." },
];

// Una lista a righe, non una fila di schede uguali: si legge in cinque secondi
export default function ReasonsList() {
  return (
    <section className="bg-[#0a0a0a] px-4 py-10 md:px-8 md:py-16">
      <div className="mx-auto max-w-[1280px]">
        <h2 className="display text-[clamp(2.4rem,8vw,4.5rem)] text-white">Come funziona</h2>
        <dl className="mt-6">
          {ROWS.map((r) => (
            <div key={r.k} className="grid gap-1 border-t border-white/14 py-5 md:grid-cols-[260px_1fr] md:gap-8">
              <dt className="display text-[30px] text-[#c8f000]">{r.k}</dt>
              <dd className="max-w-[60ch] text-[18px] leading-snug text-white/85">{r.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
