import type { Metadata } from "next";
import Link from "next/link";
import EraTiles from "@/components/home/EraTiles";
import ProductRail from "@/components/home/ProductRail";
import { getArchiveItems, eraTiles, topTeams } from "@/lib/archiveData";
import { isLegend } from "@/lib/archive";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Archivio maglie retro: per epoca, squadra e leggenda | Goal Mania",
  description: "Oltre 700 maglie da calcio retro a 40€: anni 80, 90, 2000, leggende e squadre. Spedizione gratuita, reso entro 14 giorni.",
  alternates: { canonical: "https://goal-mania.it/archivio" },
};

export default async function ArchivePage() {
  const items = await getArchiveItems();
  const legends = items.filter((it) => isLegend(it.name)).slice(0, 12);
  const teams = topTeams(items, 30);
  return (
    <div>
      <header className="mx-auto max-w-[1280px] px-5 pb-2 pt-8 md:px-8 md:pt-14">
        <h1 className="disp text-[clamp(3.4rem,12vw,8rem)] text-white">
          Archivio <span className="mark"><span>retro</span></span>
        </h1>
        <p className="mt-4 max-w-[46ch] text-[20px] leading-snug text-[var(--text-2)]">
          {items.length || 730} maglie a 40€, dalle origini a oggi. Cerca per decennio, per squadra o per giocatore.
        </p>
      </header>

      <EraTiles eras={eraTiles(items)} />

      <ProductRail
        title="Leggende"
        href="/archivio/leggende"
        lead="Maglie con il nome di chi ha scritto la storia."
        products={legends.map((l) => ({ id: l.id, slug: l.slug, name: l.name, price: l.price, image: l.image, category: "Retro", team: l.year ? String(l.year) : "Retro" }))}
      />

      <section className="mx-auto max-w-[1280px] px-5 py-10 md:px-8">
        <h2 className="disp text-[clamp(2.4rem,7vw,4.5rem)] text-white">Per squadra</h2>
        <ul className="mt-5 flex flex-wrap gap-2">
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
