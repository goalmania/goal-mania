// Le domande che un cliente si fa prima di pagare, con le regole vere del negozio.
// Se cambia una regola (tempi, reso), si cambia qui e basta.
export const FAQ_ITEMS = [
  { q: "Quanto ci mette ad arrivare?", a: "Dai 7 ai 10 giorni lavorativi dalla conferma dell'ordine. Quando il pacco parte ricevi un'email con il codice per seguirlo." },
  { q: "La spedizione è gratuita?", a: "Sì, in tutta Italia e su ogni ordine, senza un minimo di spesa." },
  { q: "Sono maglie ufficiali dei club?", a: "No. Sono maglie versione tifoso: Goal Mania non è affiliata ad alcun club o federazione, e i nomi delle squadre servono solo a dirti quale maglia stai comprando." },
  { q: "Posso restituire la maglia?", a: "Sì, entro 14 giorni dalla consegna, con la maglia non indossata e nella confezione originale. La spedizione di ritorno è a tuo carico, salvo maglia difettosa o sbagliata. Le maglie personalizzate con nome e numero non si possono restituire." },
  { q: "Come scelgo la taglia?", a: "Ogni scheda prodotto ha la guida alle taglie con le misure in centimetri. Se sei tra due taglie, prendi quella più grande." },
  { q: "Come funziona il 3x2?", a: "Ogni tre maglie nello stesso ordine, la meno cara è in regalo. Vale per le attuali e per le retro, si applica al checkout e nel carrello vedi subito quanto risparmi." },
  { q: "Come pago?", a: "Con Visa, Mastercard, American Express, Apple Pay, Google Pay, PayPal o Klarna. I dati della carta li gestisce il circuito di pagamento, non noi." },
];

export default function FaqShort({ title = "Prima di ordinare" }: { title?: string }) {
  return (
    <section aria-labelledby="faq-h" className="py-10 md:py-16">
      <div className="mx-auto grid w-full max-w-[1760px] gap-8 px-5 md:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-16">
        <div>
          <h2 id="faq-h" className="disp text-[clamp(2.6rem,6vw,5rem)] text-white">{title}</h2>
          <p className="mt-3 max-w-[34ch] text-[18px] italic leading-snug text-[var(--text-2)]">Spedizione, resi, taglie e pagamenti: quello che ci chiedono prima di ordinare.</p>
        </div>
        <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {FAQ_ITEMS.map((f) => (
            <details key={f.q} className="group py-1">
              <summary className="flex min-h-[60px] cursor-pointer list-none items-center justify-between gap-4 text-[19px] font-semibold text-white [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--wall-2)] text-[22px] leading-none text-[var(--lime)] transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="pb-5 pr-12 text-[17px] leading-relaxed text-[var(--text-2)]">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
