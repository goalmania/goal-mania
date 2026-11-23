import Link from "next/link";
import { cld } from "@/lib/utils/cloudinary";

export interface EraTile {
  slug: string;
  label: string;
  short: string;
  count: number;
  image: string;
  alt: string;
}

// Archivio per epoca: ogni tessera e un manifesto con il decennio gigante e una maglia vera
export default function EraTiles({ eras }: { eras: EraTile[] }) {
  return (
    <section className="py-8 md:py-14">
      <div className="mx-auto mb-5 max-w-[1280px] px-5 md:px-8">
        <h2 className="disp text-[clamp(2.6rem,8vw,5rem)] text-white">
          L&apos;<span className="mark"><span>archivio</span></span>
        </h2>
        <p className="mt-3 max-w-[48ch] text-[18px] leading-snug text-[var(--text-2)]">
          Oltre 700 maglie retro, dal passato che ricordi. Scegli il decennio in cui sei cresciuto.
        </p>
      </div>
      <ul className="mx-auto grid max-w-[1280px] grid-cols-2 gap-x-4 gap-y-8 px-5 md:grid-cols-3 md:px-8 lg:grid-cols-6">
        {eras.map((e, i) => (
          <li key={e.slug}>
            <Link
              href={`/archivio/${e.slug}`}
              className="poster tape group relative block aspect-[3/4] overflow-hidden"
              style={{ ["--rot" as string]: `${i % 2 ? 1.1 : -1.1}deg` }}
              aria-label={`${e.label}, ${e.count} maglie`}
            >
              <span className="num pointer-events-none absolute -left-1 top-1 select-none text-[clamp(7rem,22vw,11rem)] leading-[0.8] text-[#0a0a0a]" aria-hidden="true">
                {e.short}
              </span>
              {e.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cld(e.image, 420)}
                  alt={e.alt}
                  width={420}
                  height={525}
                  loading="lazy"
                  decoding="async"
                  className="absolute bottom-7 right-[-14%] h-[66%] w-[88%] object-contain transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-[1.08]"
                  style={{ mixBlendMode: "multiply" }}
                />
              )}
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-[#0a0a0a] px-3 py-2 text-white">
                <span className="font-[family-name:var(--font-display)] text-[19px] italic uppercase leading-none">{e.label}</span>
                <span className="num text-[17px] text-[var(--lime)]">{e.count}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
