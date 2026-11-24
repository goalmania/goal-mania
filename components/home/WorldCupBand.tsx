import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import AutoRail from "@/components/ui/AutoRail";
import { cld } from "@/lib/utils/cloudinary";

export interface CupCard {
  year: number;
  host: string;
  winner: string;
  count: number;
  jerseys: { id: string; image: string; name: string }[];
}

// Un Mondiale compare qui solo se in archivio ci sono davvero le maglie di quell'anno: ogni scheda porta a quelle maglie
export default function WorldCupBand({ cups }: { cups: CupCard[] }) {
  if (!cups.length) return null;
  return (
    <section aria-labelledby="wc-h" className="py-10 md:py-16">
      <div className="mx-auto mb-5 flex w-full max-w-[1760px] flex-wrap items-end justify-between gap-4 px-5 md:px-10 lg:px-16">
        <div>
          <p className="inline-flex items-center gap-2 text-[14px] font-bold text-[var(--lime)]">
            <Trophy className="h-4 w-4" strokeWidth={2.6} /> Maglie retro
          </p>
          <h2 id="wc-h" className="disp mt-2 text-[clamp(2.6rem,7vw,6rem)] text-white">
            I Mondiali, anno per anno
          </h2>
        </div>
        <p className="max-w-[36ch] text-[17px] italic leading-snug text-[var(--text-2)]">Scegli l&apos;anno in cui giocava la tua nazionale e trovi le sue maglie di quel torneo.</p>
      </div>
      <AutoRail label="Mondiali" speed={30}>
        {cups.map((c) => (
          <Link
            key={c.year}
            href={`/archivio/mondiale-${c.year}`}
            className="tile group relative isolate flex w-[78vw] max-w-[380px] shrink-0 flex-col overflow-hidden rounded-[22px] bg-[var(--wall-2)] p-5 text-white shadow-[inset_0_0_0_1px_var(--line)] md:w-[360px]"
            aria-label={`Mondiale ${c.year}: ${c.count} maglie`}
          >
            <span className="tile-lines" aria-hidden="true" />
            <span className="relative z-[2] flex items-start justify-between gap-3">
              <span className="pc-price !text-[clamp(3.4rem,6vw,4.6rem)] text-[var(--lime)]">{c.year}</span>
              <span className="mt-2 rounded-full bg-white/10 px-3 py-1.5 text-[13px] font-bold">{c.count} maglie</span>
            </span>
            <span className="relative z-[2] mt-1 block text-[15px] font-semibold text-[var(--text-2)]">{c.host}</span>
            <span className="relative z-[2] block text-[15px] italic text-[var(--text-3)]">Lo vince: {c.winner}</span>
            <span className="relative z-[2] mt-5 flex items-end justify-center">
              {c.jerseys.slice(0, 3).map((j, i) => (
                <span key={j.id} className="pc-stage -mx-3 block w-[38%] overflow-hidden rounded-xl shadow-[0_12px_22px_-10px_rgba(0,0,0,0.8)] transition-transform duration-300 group-hover:-translate-y-1.5" style={{ aspectRatio: "4 / 5", transform: `rotate(${(i - 1) * 5}deg)`, zIndex: i === 1 ? 2 : 1 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cld(j.image, 280)} alt={j.name} width={280} height={350} loading="lazy" decoding="async" className="absolute inset-0 z-[1] h-full w-full object-contain p-1.5" style={{ mixBlendMode: "multiply" }} />
                </span>
              ))}
            </span>
            <span className="relative z-[2] mt-5 inline-flex items-center gap-2 text-[16px] font-bold text-white">
              Vedi le maglie <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={3} />
            </span>
          </Link>
        ))}
      </AutoRail>
    </section>
  );
}
