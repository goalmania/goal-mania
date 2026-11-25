import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cld } from "@/lib/utils/cloudinary";

export interface Tile {
  title: string;
  sub: string;
  href: string;
  image: string;
  count: number;
  from: number;
  tone: "lime" | "paper" | "wall" | "wall2";
  big?: boolean;
}

const TONES = {
  lime: "bg-[var(--lime)] text-[#0a0a0a]",
  paper: "bg-[var(--paper)] text-[#0a0a0a]",
  wall: "bg-[var(--wall-2)] text-white",
  wall2: "bg-[#16261c] text-white",
};

// Quattro porte d'ingresso, ognuna con una maglia vera, quante ce ne sono e da quanto partono
export default function CategoryTiles({ tiles }: { tiles: Tile[] }) {
  return (
    <section aria-labelledby="cat-h" className="py-10 md:py-16">
      <div className="mx-auto w-full max-w-[1760px] px-5 md:px-10 lg:px-16">
        <h2 id="cat-h" className="disp text-[clamp(2.6rem,7vw,6rem)] text-white">
          Da dove vuoi partire?
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4 lg:grid-rows-2">
          {tiles.map((t, i) => {
            const wide = !!t.big || i === 1; // occupa due colonne: testo a sinistra, maglia a destra da md in su
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`tile group relative isolate grid min-w-0 gap-3 overflow-hidden rounded-[22px] p-4 md:p-6 ${TONES[t.tone]} ${
                  t.big
                    ? "col-span-2 grid-cols-1 md:grid-cols-[1.1fr_1fr] md:grid-rows-[auto_1fr_auto] lg:row-span-2"
                    : i === 1
                    ? "col-span-2 grid-cols-1 md:grid-cols-[1.2fr_1fr] md:grid-rows-[auto_1fr_auto]"
                    : "grid-cols-1 grid-rows-[auto_1fr_auto]"
                }`}
                aria-label={`${t.title}: ${t.count} maglie, da ${t.from}€`}
              >
                <span className="tile-lines" aria-hidden="true" />
                <span className={`relative z-[2] block min-w-0 ${wide ? "md:col-start-1 md:row-start-1" : ""}`}>
                  <span className={`disp block [overflow-wrap:anywhere] ${t.big ? "text-[clamp(2.1rem,4.6vw,4.6rem)]" : "text-[clamp(1.5rem,2.6vw,2.5rem)]"}`}>{t.title}</span>
                  <span className="mt-2 block max-w-[30ch] text-[15px] font-semibold italic leading-snug opacity-80">{t.sub}</span>
                </span>
                {t.image && (
                  <span className={`relative z-[1] flex min-h-0 items-center justify-center py-1 ${wide ? "md:col-start-2 md:row-span-3 md:row-start-1" : ""}`}>
                    <span
                      className={`pc-stage relative block w-full overflow-hidden rounded-2xl shadow-[0_18px_30px_-14px_rgba(0,0,0,0.65)] transition-transform duration-500 group-hover:rotate-0 group-hover:scale-[1.03] rotate-2 ${t.big ? "max-w-[230px] md:max-w-[460px]" : i === 1 ? "max-w-[170px] md:max-w-[230px]" : "max-w-[150px] md:max-w-[190px]"}`}
                      style={{ aspectRatio: "4 / 5" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cld(t.image, 520)} alt="" width={520} height={650} loading="lazy" decoding="async" className="absolute inset-0 z-[1] h-full w-full object-contain p-3" style={{ mixBlendMode: "multiply" }} />
                    </span>
                  </span>
                )}
                <span className={`relative z-[2] flex flex-wrap items-center justify-between gap-2 ${wide ? "md:col-start-1 md:row-start-3" : ""}`}>
                  <span className="rounded-full bg-[#0a0a0a] px-3.5 py-2 text-[14px] font-bold text-white">
                    {t.count} maglie · da {t.from}€
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0a0a0a] text-[var(--lime)] transition-transform duration-300 group-hover:rotate-45">
                    <ArrowUpRight className="h-5 w-5" strokeWidth={2.6} />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
