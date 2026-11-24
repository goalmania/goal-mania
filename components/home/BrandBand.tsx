import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Il momento del logo: a metà pagina, quando il cliente ha già visto le maglie e sa dove si trova
export default function BrandBand({ retroCount }: { retroCount: number }) {
  const facts = [
    { n: `${retroCount}+`, t: "maglie retro, dal 1970 a oggi" },
    { n: "35€", t: "le maglie della stagione" },
    { n: "14", t: "giorni per il reso dalla consegna" },
  ];
  return (
    <section className="hero-pitch relative overflow-hidden bg-[var(--wall)] py-14 md:py-20">
      <div className="relative z-10 mx-auto grid w-full max-w-[1760px] items-center gap-10 px-5 md:px-10 lg:grid-cols-[1.1fr_1fr] lg:px-16">
        <div>
          <Image
            src="/images/recentUpdate/goalmania-wordmark.png"
            alt="Goal Mania"
            width={1906}
            height={977}
            sizes="(max-width: 1024px) 90vw, 760px"
            className="h-auto w-full max-w-[760px]"
          />
          <p className="mt-5 max-w-[40ch] text-[clamp(1.15rem,1.6vw,1.45rem)] italic leading-snug text-[var(--text-2)]">
            Maglie versione tifoso, dalla stagione in corso fino al 1970. Non sono le ufficiali dei club: Goal Mania non è affiliata a nessuna squadra.
          </p>
          <Link href="/about" className="btn btn-ghost mt-7">
            Chi siamo <ArrowRight className="h-5 w-5" strokeWidth={3} />
          </Link>
        </div>
        <dl className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1 lg:gap-6">
          {facts.map((f) => (
            <div key={f.t} className="flex items-baseline gap-4 border-b-2 border-[var(--line)] pb-4 sm:flex-col sm:gap-1 lg:flex-row lg:gap-5">
              <dt className="pc-price !text-[clamp(3.4rem,7vw,5.6rem)] text-[var(--lime)]">{f.n}</dt>
              <dd className="text-[18px] italic text-[var(--text-2)]">{f.t}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
