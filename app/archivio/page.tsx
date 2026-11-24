import type { Metadata } from "next";
import Link from "next/link";
import EraChapter from "@/components/era/EraChapter";
import EraDock from "@/components/era/EraDock";
import ProductRail from "@/components/home/ProductRail";
import WorldCupBand, { type CupCard } from "@/components/home/WorldCupBand";
import { getArchiveItems, topTeams, worldCupYearsWithJerseys } from "@/lib/archiveData";
import { isLegend, worldCupItems } from "@/lib/archive";
import { eraInfo, pickForEra } from "@/lib/eraPick";
import { ERA_ORDER, WORLD_CUPS } from "@/lib/eraTheme";
import { eraFontClasses } from "@/lib/eraFonts";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Maglie retro: per decennio, Mondiale, squadra e leggenda | Goal Mania",
  description: "Oltre 700 maglie da calcio retro a 40€: anni 70, 80, 90, 2000, i Mondiali, le leggende e le squadre. Spedizione gratuita, reso entro 14 giorni.",
  alternates: { canonical: "https://goal-mania.it/archivio" },
};

const HOW = [
  { href: "#decenni", t: "Per decennio", d: "Dagli anni 70 a oggi" },
  { href: "#mondiali", t: "Per Mondiale", d: "Le nazionali di ogni torneo" },
  { href: "#leggende", t: "Per leggenda", d: "Il nome sulla schiena" },
  { href: "#squadre", t: "Per squadra", d: "Milan, Juve, Inter e altre" },
];

export default async function ArchivePage() {
  const items = await getArchiveItems();
  const legends = items.filter((it) => isLegend(it.name)).slice(0, 14);
  const teams = topTeams(items, 36);
  const infos = Object.fromEntries(ERA_ORDER.map((s) => [s, eraInfo(items, s)]));
  const cups: CupCard[] = worldCupYearsWithJerseys(items).map((y) => {
    const list = worldCupItems(items, y);
    return { year: y, host: WORLD_CUPS[y].host, winner: WORLD_CUPS[y].winner, count: list.length, jerseys: list.slice(0, 3).map((j) => ({ id: j.id, image: j.image, name: j.name })) };
  });
  const total = Math.floor((items.length || 730) / 10) * 10;
  return (
    <div className={eraFontClasses}>
      <header className="mx-auto w-full max-w-[1760px] px-5 pb-8 pt-10 md:px-10 md:pb-12 md:pt-16 lg:px-16">
        <p className="text-[15px] font-bold text-[var(--lime)]">Maglie da calcio retro · 40€ l&apos;una</p>
        <h1 className="disp mt-3 text-[clamp(3.6rem,12vw,12rem)] leading-[0.84] text-white">
          Dal 1970
          <br />a oggi: <span className="mark"><span>{total}+ maglie.</span></span>
        </h1>
        <p className="mt-7 max-w-[54ch] text-[clamp(1.1rem,1.6vw,1.4rem)] italic leading-snug text-[var(--text-2)]">
          Maglie retro di squadre e nazionali, versione tifoso: non sono le ufficiali dei club. Cerca la tua per decennio, per Mondiale, per leggenda o per squadra.
        </p>
        <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {HOW.map((h) => (
            <li key={h.href}>
              <a href={h.href} className="group flex h-full flex-col justify-between rounded-2xl bg-[var(--wall)] p-4 shadow-[inset_0_0_0_1px_var(--line)] transition-colors hover:bg-[var(--lime)] hover:text-[#0a0a0a] md:p-5">
                <span className="disp text-[clamp(1.5rem,2.4vw,2.1rem)]">{h.t}</span>
                <span className="mt-2 block text-[14px] font-semibold italic opacity-75">{h.d}</span>
              </a>
            </li>
          ))}
        </ul>
      </header>

      <div id="decenni" className="relative scroll-mt-32">
        <EraDock />
        {ERA_ORDER.map((slug, i) => (
          <EraChapter key={slug} slug={slug} count={infos[slug].count} teams={infos[slug].teams} cups={infos[slug].cups} jerseys={pickForEra(items, slug, 3)} flip={i % 2 === 1} />
        ))}
      </div>

      <div id="mondiali" className="scroll-mt-32">
        <WorldCupBand cups={cups} />
      </div>

      <div id="leggende" className="scroll-mt-32">
        <ProductRail
          title="Leggende"
          href="/archivio/leggende"
          lead="Maglie con il nome di un campione sulla schiena."
          products={legends.map((l) => ({ id: l.id, slug: l.slug, name: l.name, price: l.price, image: l.image, category: "Retro", team: l.year ? String(l.year) : "Retro" }))}
        />
      </div>

      <section id="squadre" className="mx-auto w-full max-w-[1760px] scroll-mt-32 px-5 py-12 md:px-10 lg:px-16">
        <h2 className="disp text-[clamp(2.6rem,7vw,5.5rem)] text-white">Per squadra</h2>
        <ul className="mt-6 flex flex-wrap gap-2">
          {teams.map((t) => (
            <li key={t.slug}>
              <Link href={`/archivio/${t.slug}`} className="flex h-12 items-center gap-2 rounded-full px-5 text-[17px] font-semibold text-white shadow-[inset_0_0_0_1.5px_rgba(244,242,234,0.35)] transition-colors hover:bg-[var(--lime)] hover:text-[#0a0a0a] hover:shadow-none">
                {t.name} <span className="text-[14px] opacity-60">{t.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
