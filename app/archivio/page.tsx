import type { Metadata } from "next";
import Link from "next/link";
import EraChapter from "@/components/era/EraChapter";
import EraDock from "@/components/era/EraDock";
import ProductRail from "@/components/home/ProductRail";
import { getArchiveItems, topTeams } from "@/lib/archiveData";
import { eraOf, isLegend } from "@/lib/archive";
import { pickForEra } from "@/lib/eraPick";
import { ERA_ORDER } from "@/lib/eraTheme";
import { eraFontClasses } from "@/lib/eraFonts";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Archivio maglie retro: per epoca, squadra e leggenda | Goal Mania",
  description: "Oltre 700 maglie da calcio retro a 40€: anni 70, 80, 90, 2000, leggende e squadre. Spedizione gratuita, reso entro 14 giorni.",
  alternates: { canonical: "https://goal-mania.it/archivio" },
};

export default async function ArchivePage() {
  const items = await getArchiveItems();
  const legends = items.filter((it) => isLegend(it.name)).slice(0, 14);
  const teams = topTeams(items, 36);
  const counts = Object.fromEntries(ERA_ORDER.map((s) => [s, items.filter((it) => eraOf(it.year)?.slug === s).length]));
  return (
    <div className={eraFontClasses}>
      <header className="mx-auto w-full max-w-[1760px] px-5 pb-10 pt-10 md:px-10 md:pb-14 md:pt-16 lg:px-16">
        <h1 className="disp text-[clamp(4rem,15vw,15rem)] leading-[0.82] text-white">
          Sei decenni,
          <br />
          <span className="mark"><span>{Math.floor((items.length || 730) / 10) * 10}+ maglie.</span></span>
        </h1>
        <p className="mt-8 max-w-[52ch] text-[clamp(1.1rem,1.6vw,1.4rem)] leading-snug text-[var(--text-2)]">
          Ogni decennio ha un suo aspetto, e qui lo ritrovi. Scorri le ere, scegli quella in cui sei cresciuto: tutte le retro costano 40€, con spedizione gratuita.
        </p>
      </header>

      <div className="relative">
        <EraDock />
        {ERA_ORDER.map((slug, i) => (
          <EraChapter key={slug} slug={slug} count={counts[slug] || 0} jerseys={pickForEra(items, slug, 3)} flip={i % 2 === 1} />
        ))}
      </div>

      <ProductRail
        title="Leggende"
        href="/archivio/leggende"
        lead="Maglie con il nome di chi ha scritto la storia."
        products={legends.map((l) => ({ id: l.id, slug: l.slug, name: l.name, price: l.price, image: l.image, category: "Retro", team: l.year ? String(l.year) : "Retro" }))}
      />

      <section className="mx-auto w-full max-w-[1760px] px-5 py-12 md:px-10 lg:px-16">
        <h2 className="disp text-[clamp(2.6rem,7vw,5.5rem)] text-white">Per squadra</h2>
        <ul className="mt-6 flex flex-wrap gap-2">
          {teams.map((t) => (
            <li key={t.slug}>
              <Link href={`/archivio/${t.slug}`} className="flex h-12 items-center gap-2 border-2 border-white/35 px-4 font-[family-name:var(--font-display)] text-[20px] italic uppercase text-white transition-colors hover:border-[var(--lime)] hover:bg-[var(--lime)] hover:text-[#0a0a0a]">
                {t.name} <span className="num text-[15px] opacity-70">{t.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
