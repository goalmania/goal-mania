const ROWS = [
  { k: "Prezzo fisso", v: "35€ le maglie attuali, 40€ le retro. Niente sorprese al checkout." },
  { k: "Spedizione", v: "Gratuita in Italia. Consegna in 7-10 giorni lavorativi, con tracking via email alla partenza." },
  { k: "Reso", v: "14 giorni dalla consegna. Maglia non indossata, con cartellino. Spese di reso a carico tuo." },
  { k: "Pagamento", v: "Carta, Apple Pay, Google Pay, PayPal e Klarna." },
];

// Una lista raggruppata, non una fila di schede uguali: si legge in cinque secondi
export default function ReasonsList() {
  return (
    <section className="px-3 py-8 md:px-6 md:py-14">
      <div className="mx-auto max-w-[1280px]">
        <h2 className="display px-2 text-[clamp(1.9rem,5vw,3rem)]">Come funziona</h2>
        <dl className="glass mt-5 divide-y divide-white/10 rounded-[32px]">
          {ROWS.map((r) => (
            <div key={r.k} className="grid gap-1 px-6 py-5 md:grid-cols-[240px_1fr] md:gap-8 md:px-8 md:py-6">
              <dt className="text-[19px] font-semibold">{r.k}</dt>
              <dd className="max-w-[60ch] text-[17px] leading-snug text-[var(--text-2)]">{r.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
