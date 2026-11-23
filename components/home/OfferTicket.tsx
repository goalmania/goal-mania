import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Il 3x2 e una regola reale, attiva al checkout. Il conto e quello del listino: 35€ a maglia.
export default function OfferTicket() {
  return (
    <section id="offerta" className="px-3 py-8 md:px-6 md:py-14">
      <div className="mx-auto grid max-w-[1280px] gap-8 overflow-hidden rounded-[36px] bg-[var(--lime)] p-7 text-[#0a0a0a] md:grid-cols-[1.2fr_1fr] md:items-center md:gap-12 md:p-14">
        <div>
          <h2 className="display text-[clamp(2.7rem,8vw,5.5rem)] !tracking-[-0.045em]">
            Prendi 3,
            <br />
            ne paghi 2.
          </h2>
          <p className="mt-4 max-w-[32ch] text-[19px] font-medium leading-snug">
            Metti tre maglie nello stesso ordine: la meno cara è gratis. Vale per le attuali e per le retro.
          </p>
          <Link href="/shop" className="btn mt-7 bg-[#0a0a0a] text-white hover:bg-black">
            Scegli le tue 3 <ArrowRight className="h-5 w-5" strokeWidth={2.4} />
          </Link>
        </div>

        {/* Il conto, scritto chiaro */}
        <div className="rounded-[28px] bg-[#0a0a0a]/92 p-6 text-white backdrop-blur-xl md:p-8">
          <dl className="space-y-3.5">
            {["Maglia 1", "Maglia 2"].map((l) => (
              <div key={l} className="flex items-baseline justify-between border-b border-white/12 pb-3.5">
                <dt className="text-[17px] text-white/75">{l}</dt>
                <dd className="num text-[22px]">35€</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between border-b border-white/12 pb-3.5">
              <dt className="text-[17px] text-white/75">Maglia 3</dt>
              <dd className="text-[22px] font-semibold text-[var(--lime)]">Gratis</dd>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <dt className="text-[19px] font-semibold">Paghi</dt>
              <dd className="num text-[52px] text-[var(--lime)]">70€</dd>
            </div>
          </dl>
          <p className="mt-3 text-[14px] text-white/60">Spedizione inclusa. Con le retro (40€) è gratis la meno cara delle tre.</p>
        </div>
      </div>
    </section>
  );
}
