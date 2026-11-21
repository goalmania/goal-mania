import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Offerta Black Friday = la regola "Prendi 3, paghi 2", attiva e verificata al checkout.
// Nessuna scadenza dichiarata e nessun prezzo "prima" inventato: i numeri sono quelli del listino (35€).
export default function BlackFridayBand() {
  return (
    <section className="gm-lime-block relative overflow-hidden">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 -top-10 select-none font-black leading-none text-black/10"
        style={{ fontFamily: "var(--font-display,'Barlow Condensed',sans-serif)", fontSize: "clamp(12rem, 34vw, 26rem)" }}
      >
        3x2
      </span>
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 py-12 sm:px-8 md:grid-cols-[1.3fr_1fr] md:py-16">
        <div>
          <p className="mb-3 text-[13px] font-black uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-mono,monospace)" }}>
            Black Friday Goal Mania
          </p>
          <h2
            className="font-black uppercase leading-[0.88] tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-display,'Barlow Condensed',sans-serif)", fontSize: "clamp(3rem, 9vw, 6.5rem)" }}
          >
            Prendi 3,<br />ne paghi 2
          </h2>
          <p className="mt-4 max-w-md text-lg font-semibold leading-snug">
            Metti tre maglie nello stesso ordine: la terza è gratis. Vale per le maglie attuali e per le retro.
          </p>
          <Link
            href="/shop"
            className="mt-7 inline-flex min-h-[52px] items-center gap-3 rounded-[6px] bg-[#0a0a0a] px-7 text-[15px] font-black uppercase tracking-[0.14em] text-[#c8f000] transition-transform hover:translate-x-1 active:translate-y-px"
            style={{ fontFamily: "var(--font-display,sans-serif)" }}
          >
            Scegli le tue 3 maglie <ArrowRight size={18} />
          </Link>
        </div>

        {/* Il conto, scritto chiaro */}
        <div className="rounded-[10px] bg-[#0a0a0a] p-5 text-white shadow-[6px_6px_0_rgba(0,0,0,0.25)] sm:p-6">
          <dl className="space-y-3 text-[17px]" style={{ fontFamily: "var(--font-display,sans-serif)" }}>
            {[1, 2].map((n) => (
              <div key={n} className="flex items-baseline justify-between border-b border-white/10 pb-3">
                <dt className="font-bold uppercase tracking-wide text-white/80">Maglia {n}</dt>
                <dd className="font-extrabold tabular-nums">35€</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
              <dt className="font-bold uppercase tracking-wide text-white/80">Maglia 3</dt>
              <dd className="font-extrabold uppercase text-[#c8f000]">Gratis</dd>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <dt className="text-xl font-extrabold uppercase">Paghi</dt>
              <dd className="text-[40px] font-black leading-none text-[#c8f000] tabular-nums">70€</dd>
            </div>
          </dl>
          <p className="mt-3 text-[12px] text-white/60" style={{ fontFamily: "var(--font-mono,monospace)" }}>
            Spedizione gratuita inclusa. Con maglie retro (40€) risparmi la meno cara delle tre.
          </p>
        </div>
      </div>
    </section>
  );
}
