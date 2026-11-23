import Link from "next/link";
import { WORLD_CUP_YEARS } from "@/lib/archive";

// Perche le maglie contano: una dichiarazione, tre numeri veri, e la linea dei Mondiali
export default function Manifesto({ retroCount }: { retroCount: number }) {
  const facts = [
    { n: `${retroCount}+`, t: "maglie retro in archivio" },
    { n: "7-10", t: "giorni lavorativi di consegna" },
    { n: "14", t: "giorni per il reso" },
  ];
  return (
    <section className="bg-[var(--wall)] py-14 md:py-20">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8">
        <p className="disp max-w-[16ch] text-[clamp(2.8rem,9.5vw,7.5rem)] text-white">
          Una maglia è <span className="mark"><span>memoria</span></span> che si indossa.
        </p>
        <p className="mt-6 max-w-[46ch] text-[20px] leading-snug text-[var(--text-2)]">
          Quella del Mondiale in cui eri ragazzino, quella del giocatore che ti ha fatto innamorare. Per questo teniamo un archivio e non solo un negozio.
        </p>

        <dl className="mt-10 grid gap-6 border-t-2 border-[var(--line)] pt-8 sm:grid-cols-3">
          {facts.map((f) => (
            <div key={f.t}>
              <dt className="num text-[clamp(3.6rem,9vw,6rem)] text-[var(--lime)]">{f.n}</dt>
              <dd className="mt-1 text-[17px] text-[var(--text-2)]">{f.t}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12">
          <p className="mb-3 font-[family-name:var(--font-display)] text-[24px] italic uppercase text-white">Le maglie dei Mondiali, anno per anno</p>
          <ul className="flex flex-wrap gap-2">
            {WORLD_CUP_YEARS.map((y) => (
              <li key={y}>
                <Link href={`/search?q=${y}`} className="num flex h-12 items-center border-2 border-white/40 px-5 text-[26px] text-white transition-colors hover:border-[var(--lime)] hover:bg-[var(--lime)] hover:text-[#0a0a0a]">
                  {y}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
