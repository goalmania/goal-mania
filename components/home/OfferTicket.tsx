import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Il 3x2 e una regola reale, attiva al checkout. Il conto e quello del listino: 35€ a maglia.
export default function OfferTicket() {
  return (
    <section id="offerta" className="px-4 py-10 md:px-8 md:py-16">
      <div className="mx-auto grid max-w-[1280px] gap-8 overflow-hidden bg-[var(--lime)] p-6 text-[#0a0a0a] md:grid-cols-[1.25fr_1fr] md:items-center md:gap-12 md:p-12" style={{ transform: "rotate(-0.6deg)" }}>
        <div>
          <h2 className="disp text-[clamp(3.4rem,11vw,8rem)]">
            Prendi 3,
            <br />
            paghi 2.
          </h2>
          <p className="mt-4 max-w-[30ch] text-[20px] font-semibold leading-snug">
            Tre maglie nello stesso ordine: la meno cara è gratis. Vale per le attuali e per le retro.
          </p>
          <Link href="/shop" className="btn btn-ink mt-7">
            Scegli le tue 3 <ArrowRight className="h-5 w-5" strokeWidth={3} />
          </Link>
        </div>

        {/* Lo scontrino: il conto scritto chiaro */}
        <div className="bg-[#0a0a0a] p-6 text-white md:p-8" style={{ transform: "rotate(1.6deg)" }}>
          <dl className="space-y-3.5">
            {["Maglia 1", "Maglia 2"].map((l) => (
              <div key={l} className="flex items-baseline justify-between border-b-2 border-dashed border-white/25 pb-3.5">
                <dt className="text-[17px] text-white/75">{l}</dt>
                <dd className="num text-[28px]">35€</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between border-b-2 border-dashed border-white/25 pb-3.5">
              <dt className="text-[17px] text-white/75">Maglia 3</dt>
              <dd className="num text-[28px] text-[var(--lime)]">Gratis</dd>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <dt className="font-[family-name:var(--font-display)] text-[26px] italic uppercase">Paghi</dt>
              <dd className="num text-[64px] text-[var(--lime)]">70€</dd>
            </div>
          </dl>
          <p className="mt-3 text-[14px] text-white/65">Spedizione inclusa. Con le retro (40€) è gratis la meno cara delle tre.</p>
        </div>
      </div>
    </section>
  );
}
