import { Truck, Clock, RotateCcw, ShieldCheck } from "lucide-react";

// Le quattro cose che un cliente vuole sapere prima di comprare. Sono le regole vere del negozio.
const ITEMS = [
  { Icon: Truck, t: "Spedizione gratuita", d: "In tutta Italia, su ogni ordine" },
  { Icon: Clock, t: "7-10 giorni lavorativi", d: "Per ricevere il pacco a casa" },
  { Icon: RotateCcw, t: "Reso entro 14 giorni", d: "Spedizione di reso a tuo carico" },
  { Icon: ShieldCheck, t: "Pagamento protetto", d: "Carta, Apple Pay, PayPal, Klarna" },
];

export default function TrustBar() {
  return (
    <section aria-label="Come funziona" className="border-y border-[var(--line)] bg-[var(--wall)]">
      <ul className="mx-auto grid w-full max-w-[1760px] grid-cols-2 gap-x-5 gap-y-6 px-5 py-7 md:px-10 lg:grid-cols-4 lg:px-16">
        {ITEMS.map(({ Icon, t, d }) => (
          <li key={t} className="flex items-start gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--lime)] text-[#0a0a0a]">
              <Icon className="h-5 w-5" strokeWidth={2.4} />
            </span>
            <span>
              <span className="block text-[17px] font-bold leading-tight text-white">{t}</span>
              <span className="mt-0.5 block text-[14px] italic leading-snug text-[var(--text-3)]">{d}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
