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
          {tiles.map((t, i) => (
            <Link
              key={t.href}
              href={t.href}
              className={`tile group relative isolate flex min-h-[250px] flex-col justify-between overflow-hidden rounded-[22px] p-4 md:p-6 ${TONES[t.tone]} ${t.big ? "col-span-2 lg:row-span-2 lg:min-h-[560px]" : i === 1 ? "col-span-2" : "max-md:min-h-[330px]"}`}
              aria-label={`${t.title}: ${t.count} maglie, da ${t.from}€`}
            >
              <span className="tile-lines" aria-hidden="true" />
              <span className={`relative z-[2] block ${t.big ? "max-w-[58%] md:max-w-[70%]" : i === 1 ? "max-w-[56%]" : "max-w-full md:max-w-[58%]"}`}>
                <span className={`disp block ${t.big ? "text-[clamp(2.4rem,4.6vw,4.6rem)]" : "text-[clamp(1.7rem,2.6vw,2.5rem)]"}`}>{t.title}</span>
                <span className="mt-2 block max-w-[20ch] md:max-w-[24ch] text-[15px] font-semibold italic leading-snug opacity-80">{t.sub}</span>
              </span>
              {t.image && (
                <span
                  className={`pc-stage z-[1] block overflow-hidden rounded-2xl shadow-[0_18px_30px_-14px_rgba(0,0,0,0.65)] transition-transform duration-500 group-hover:rotate-0 group-hover:scale-[1.03] ${t.big ? "bottom-[4.75rem] right-4 w-[44%] max-w-[500px] rotate-3 md:bottom-6 md:right-6 md:w-[54%]" : i === 1 ? "right-5 top-1/2 w-[28%] max-w-[210px] -translate-y-1/2 rotate-3" : "right-3 bottom-[4.5rem] w-[40%] rotate-3 md:right-4 md:top-1/2 md:bottom-auto md:w-[42%] md:-translate-y-[46%]"}`}
                  style={{ aspectRatio: "4 / 5", position: "absolute" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cld(t.image, 520)} alt="" width={520} height={650} loading="lazy" decoding="async" className="absolute inset-0 z-[1] h-full w-full object-contain p-3" style={{ mixBlendMode: "multiply" }} />
                </span>
              )}
              <span className="relative z-[2] flex items-center justify-between gap-2">
                <span className="rounded-full bg-[#0a0a0a] px-3.5 py-2 text-[14px] font-bold text-white">
                  {t.count} maglie · da {t.from}€
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0a0a0a] text-[var(--lime)] transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="h-5 w-5" strokeWidth={2.6} />
                </span>
              </span>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
