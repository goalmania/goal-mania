import { Truck, RotateCcw, ShieldCheck, PackageSearch } from "lucide-react";

// Solo condizioni vere e gia scritte nelle pagine /shipping e /resi.
const ITEMS = [
  { Icon: Truck, title: "Spedizione gratuita", text: "Su ogni ordine in Italia, consegna in 7-10 giorni lavorativi." },
  { Icon: RotateCcw, title: "Reso entro 14 giorni", text: "Maglia non indossata, con cartellino. Rimborso entro 14 giorni dal ricevimento." },
  { Icon: ShieldCheck, title: "Pagamento sicuro", text: "Carta, Apple Pay, Google Pay, PayPal e Klarna." },
  { Icon: PackageSearch, title: "Tracking via email", text: "Quando l'ordine parte ricevi il numero per seguirlo." },
];

export default function TrustBar() {
  return (
    <section className="border-y border-white/10 bg-[#0a0a0a]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map(({ Icon, title, text }) => (
          <div key={title} className="flex items-start gap-4 bg-[#0a0a0a] px-5 py-6 sm:px-6">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[8px] bg-[#c8f000] text-[#0a0a0a]">
              <Icon size={22} strokeWidth={2.2} />
            </span>
            <div>
              <h3 className="text-[19px] font-extrabold uppercase leading-none text-white" style={{ fontFamily: "var(--font-display,'Barlow Condensed',sans-serif)" }}>
                {title}
              </h3>
              <p className="gm-muted mt-1.5 text-[14px] leading-snug" style={{ fontFamily: "var(--font-body,sans-serif)" }}>{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
