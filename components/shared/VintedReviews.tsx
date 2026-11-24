import { Star } from "lucide-react";
import AutoRail from "@/components/ui/AutoRail";
import LazyMount from "@/components/ui/LazyMount";
import { VINTED_REVIEWS, vintedStats } from "@/lib/data/vintedReviews";

// Le recensioni vere ricevute su Vinted, prima di questo sito. Sempre con l'etichetta della fonte.
export default function VintedReviews({ compact = false }: { compact?: boolean }) {
  const { count, avg, five, four } = vintedStats;
  // Prima i commenti piu lunghi (si leggono meglio), poi gli altri. Le statistiche sono su tutte e 72.
  const list = [...VINTED_REVIEWS].sort((a, b) => b.text.length - a.text.length);
  const stars = (n: number) => (
    <span className="flex gap-0.5" aria-label={`${n} stelle su 5`}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="h-4 w-4" fill={i <= n ? "var(--lime)" : "transparent"} stroke={i <= n ? "var(--lime)" : "rgba(244,242,234,0.3)"} />)}
    </span>
  );
  return (
    <section aria-labelledby="rev-h" className={compact ? "py-8 md:py-12" : "py-10 md:py-16"}>
      <div className="mx-auto grid w-full max-w-[1760px] gap-6 px-5 md:px-10 lg:grid-cols-[1fr_auto] lg:items-end lg:px-16">
        <div>
          <p className="text-[14px] font-bold text-[var(--lime)]">Prima di questo sito vendevamo su Vinted</p>
          <h2 id="rev-h" className="disp mt-1 text-[clamp(2.4rem,6vw,5rem)] text-white">{count} recensioni su Vinted</h2>
          <p className="mt-3 max-w-[56ch] text-[17px] italic leading-snug text-[var(--text-2)]">Sono le recensioni ricevute sul nostro profilo Vinted, con il nome utente di chi le ha scritte. Non sono acquisti fatti su questo sito.</p>
        </div>
        <div className="flex items-center gap-5 rounded-3xl bg-[var(--wall)] p-5 shadow-[inset_0_0_0_1px_var(--line)]">
          <span className="pc-price !text-[64px] text-[var(--lime)]">{avg.toFixed(1).replace(".", ",")}</span>
          <span className="space-y-1 text-[15px] font-semibold text-[var(--text-2)]">
            {stars(5)}
            <span className="block">su 5, in media</span>
            <span className="block text-[var(--text-3)]">{five} da 5 stelle · {four} da 4</span>
          </span>
        </div>
      </div>
      <div className="mt-6">
        <LazyMount minHeight={220}>
        <AutoRail label="Recensioni ricevute su Vinted" speed={32}>
          {list.map((r) => (
            <figure key={r.name} className="flex w-[78vw] max-w-[340px] shrink-0 flex-col justify-between gap-4 rounded-[20px] bg-[var(--wall)] p-5 shadow-[inset_0_0_0_1px_var(--line)] md:w-[320px]">
              <div>
                {stars(r.rating)}
                <blockquote className="mt-3 text-[18px] leading-snug text-white">“{r.text}”</blockquote>
              </div>
              <figcaption className="flex items-center justify-between text-[14px]">
                <span className="font-bold text-[var(--text-2)]">{r.name}</span>
                <span className="rounded-full bg-[var(--wall-2)] px-2.5 py-1 font-semibold text-[var(--text-3)]">su Vinted</span>
              </figcaption>
            </figure>
          ))}
        </AutoRail>
        </LazyMount>
      </div>
    </section>
  );
}
