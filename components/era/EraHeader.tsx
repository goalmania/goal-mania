import Link from "next/link";
import "@/app/era.css";
import { ERA_THEME, ERA_RANGE, type WorldCup } from "@/lib/eraTheme";
import EraNumeral from "@/components/era/EraNumeral";

// Intestazione di un'era: occupa tutta la larghezza, la cifra e' protagonista
export default function EraHeader({ slug, count, cups = [] }: { slug: string; count: number; cups?: (WorldCup & { count: number })[] }) {
  const th = ERA_THEME[slug];
  if (!th) return null;
  return (
    <header className="era-scene relative">
      <div className="era-bg" aria-hidden="true" />
      <div className="era-pitch" aria-hidden="true" />
      <div className="mx-auto grid w-full max-w-[1760px] items-end gap-6 px-5 pb-12 pt-8 md:px-10 md:pb-16 md:pt-12 lg:grid-cols-12 lg:px-16">
        <div className="lg:col-span-7">
          <Link href="/archivio" className="inline-flex h-10 items-center text-[15px] font-semibold underline-offset-4 hover:underline" style={{ color: "var(--e-fg)" }}>← Maglie retro</Link>
          <EraNumeral cls={th.cls} value={th.numeral} className="mt-3" style={{ ["--num" as string]: "clamp(9rem, 26vw, 22rem)" }} />
        </div>
        <div className="era-head-text lg:col-span-5 lg:pb-3">
          <p className="text-[13px] font-extrabold uppercase tracking-[0.14em]" style={{ color: "var(--e-fg2)" }}>Maglie retro · {ERA_RANGE[slug]}</p>
          <h1 className="era-title mt-1 text-[clamp(2.6rem,6vw,4.8rem)]">{th.title}</h1>
          <p className="mt-3 max-w-[38ch] text-[clamp(1.1rem,1.4vw,1.3rem)] leading-snug" style={{ color: "var(--e-fg2)" }}>
            {th.line} <b style={{ color: "var(--e-fg)" }}>{count} maglie a 40€.</b>
          </p>
          {cups.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {cups.map((c) => (
                <li key={c.year}>
                  <Link href={`/archivio/mondiale-${c.year}`} className="era-chip era-cup" title={`Mondiale ${c.year}: ${c.count} maglie`}>
                    <span className="num text-[22px]">{c.year}</span>
                    <span className="text-[15px]">{c.host} · vince {c.winner} · {c.count} maglie</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </header>
  );
}
