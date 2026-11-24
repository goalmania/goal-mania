import Link from "next/link";
import { ArrowRight } from "lucide-react";
import "@/app/era.css";
import { ERA_THEME, ERA_RANGE, type WorldCup } from "@/lib/eraTheme";
import { cld } from "@/lib/utils/cloudinary";
import EraNumeral from "@/components/era/EraNumeral";
import type { ArchiveItem } from "@/lib/archive";

// Un capitolo a tutta pagina per ogni decennio: gli anni, le squadre, i Mondiali con le loro maglie, e tre maglie che lo raccontano
export default function EraChapter({
  slug,
  count,
  teams,
  cups,
  jerseys,
  flip,
}: {
  slug: string;
  count: number;
  teams: string[];
  cups: (WorldCup & { count: number })[];
  jerseys: ArchiveItem[];
  flip: boolean;
}) {
  const th = ERA_THEME[slug];
  if (!th || count === 0) return null;
  const sizes = ["w-[44%] md:w-[30%]", "w-[50%] md:w-[38%] md:-mb-10", "w-[30%] hidden md:block"];
  const rots = [-4.5, 2.5, 5.5];
  return (
    <section id={slug} className={`era era-scene era-chapter ${th.cls}`} aria-labelledby={`h-${slug}`}>
      <div className="era-bg" aria-hidden="true" />
      <div className="era-pitch" aria-hidden="true" />
      <div className="mx-auto grid w-full max-w-[1760px] items-center gap-10 px-5 py-16 md:px-10 lg:grid-cols-12 lg:gap-8 lg:px-16 lg:py-24">
        <div className={`lg:col-span-5 ${flip ? "lg:order-2 lg:col-start-8" : ""}`}>
          <p className="text-[13px] font-extrabold uppercase tracking-[0.14em]" style={{ color: "var(--e-fg2)" }}>
            Maglie retro · {ERA_RANGE[slug]}
          </p>
          <EraNumeral cls={th.cls} value={th.numeral} className="mt-2" />
          <h2 id={`h-${slug}`} className="era-title mt-6 text-[clamp(2.4rem,5.4vw,4.4rem)]">{th.title}</h2>
          <p className="mt-4 max-w-[40ch] text-[clamp(1.1rem,1.5vw,1.35rem)] italic leading-snug" style={{ color: "var(--e-fg2)" }}>{th.line}</p>
          {teams.length > 0 && (
            <p className="mt-4 max-w-[44ch] text-[16px] font-semibold" style={{ color: "var(--e-fg)" }}>
              Squadre più presenti: {teams.join(", ")}.
            </p>
          )}
          {cups.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-[13px] font-extrabold uppercase tracking-[0.14em]" style={{ color: "var(--e-fg2)" }}>Mondiali, con le maglie delle nazionali</p>
              <ul className="flex flex-wrap gap-2">
                {cups.map((c) => (
                  <li key={c.year}>
                    <Link href={`/archivio/mondiale-${c.year}`} className="era-chip era-cup" title={`Mondiale ${c.year}: ${c.count} maglie`}>
                      <span className="num text-[22px]">{c.year}</span>
                      <span className="text-[15px]">{c.host} · vince {c.winner} · {c.count} maglie</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Link href={`/archivio/${slug}`} className="era-btn mt-8">
            Vedi le {count} maglie <ArrowRight className="h-5 w-5" strokeWidth={3} />
          </Link>
        </div>

        <div className={`flex items-end justify-center gap-3 md:gap-6 lg:col-span-7 ${flip ? "lg:order-1 lg:col-start-1" : ""}`}>
          {jerseys.slice(0, 3).map((j, i) => (
            <Link key={j.id} href={`/products/${j.slug || j.id}`} className={`era-frame ${sizes[i]}`} style={{ ["--rot" as string]: `${rots[i]}deg`, marginBottom: i === 0 ? "3rem" : undefined }} aria-label={j.name}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cld(j.image, 560)} srcSet={`${cld(j.image, 360)} 360w, ${cld(j.image, 560)} 560w, ${cld(j.image, 800)} 800w`} sizes="(max-width: 768px) 45vw, 30vw" alt={j.name} width={560} height={700} loading="lazy" decoding="async" className="aspect-[4/5] w-full object-contain p-2" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
