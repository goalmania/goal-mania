import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Il 3x2 e una regola reale, attiva al checkout. Il conto e quello del listino: 35€ a maglia.
export default function OfferTicket() {
  return (
    <section className="bg-[#0a0a0a] px-4 py-10 md:px-8 md:py-16">
      <div className="cut cut-lg mx-auto grid max-w-[1280px] bg-[#c8f000] text-[#0a0a0a] md:grid-cols-[1fr_340px]">
        <div className="p-6 md:p-10">
          <h2 className="display text-[clamp(3.2rem,11vw,7rem)]">
            Prendi 3,
            <br />
            ne paghi 2
          </h2>
          <p className="mt-4 max-w-[34ch] text-[18px] font-semibold leading-snug">
            Metti tre maglie nello stesso ordine: la meno cara è gratis. Vale per le attuali e per le retro.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex h-14 items-center gap-3 bg-[#0a0a0a] px-7 text-[20px] font-extrabold uppercase tracking-wide text-[#c8f000] transition-transform active:translate-y-px"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Scegli le tue 3 <ArrowRight className="h-5 w-5" strokeWidth={3} />
          </Link>
        </div>

        {/* Scontrino: il conto scritto chiaro, con la linea di strappo */}
        <div className="border-t-2 border-dashed border-[#0a0a0a]/45 bg-[#0a0a0a] p-6 text-white md:border-l-2 md:border-t-0 md:p-8">
          <dl className="space-y-3 text-[18px]" style={{ fontFamily: "var(--font-display)" }}>
            {["Maglia 1", "Maglia 2"].map((l) => (
              <div key={l} className="flex items-baseline justify-between border-b border-white/15 pb-3">
                <dt className="font-bold uppercase tracking-wide text-white/80">{l}</dt>
                <dd className="num text-[26px]">35€</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between border-b border-white/15 pb-3">
              <dt className="font-bold uppercase tracking-wide text-white/80">Maglia 3</dt>
              <dd className="text-[26px] font-black uppercase text-[#c8f000]">Gratis</dd>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <dt className="text-[22px] font-extrabold uppercase">Paghi</dt>
              <dd className="num text-[56px] text-[#c8f000]">70€</dd>
            </div>
          </dl>
          <p className="mt-3 text-[14px] text-white/65">Spedizione inclusa. Con le retro (40€) è gratis la meno cara delle tre.</p>
        </div>
      </div>
    </section>
  );
}
