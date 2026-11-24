import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ArchiveGrid from "@/components/shop/ArchiveGrid";
import EraHeader from "@/components/era/EraHeader";
import EraNumeral from "@/components/era/EraNumeral";
import { getArchiveItems, groupItems, topTeams, worldCupYearsWithJerseys } from "@/lib/archiveData";
import { eraInfo } from "@/lib/eraPick";
import { ERAS, eraOf } from "@/lib/archive";
import { ERA_ORDER, ERA_THEME } from "@/lib/eraTheme";
import { eraFontClasses } from "@/lib/eraFonts";

export const revalidate = 300;

// Tutto si genera al build: ere, Mondiali, leggende e ogni squadra. Nessuna pagina aspetta il database alla prima visita.
export async function generateStaticParams() {
  const items = await getArchiveItems();
  return [
    ...ERAS.map((e) => ({ slug: e.slug })),
    { slug: "leggende" },
    ...worldCupYearsWithJerseys(items).map((y) => ({ slug: `mondiale-${y}` })),
    ...topTeams(items, 400).map((t) => ({ slug: t.slug })),
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = groupItems(await getArchiveItems(), slug);
  if (!g) return { title: "Archivio | Goal Mania" };
  return {
    title: `Maglie retro ${g.title}: ${g.list.length} maglie a 40€ | Goal Mania`,
    description: `${g.text} Spedizione gratuita e reso entro 14 giorni.`,
    alternates: { canonical: `https://goal-mania.it/archivio/${slug}` },
  };
}

export default async function ArchiveGroupPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const all = await getArchiveItems();
  const g = groupItems(all, slug);
  if (!g || g.list.length === 0) notFound();
  const th = ERA_THEME[slug];

  // Pagine squadra e leggende: stile Goal Mania. Le ere: ognuna col suo mondo.
  if (!th) {
    return (
      <div>
        <header className="mx-auto w-full max-w-[1760px] px-5 pb-4 pt-8 md:px-10 md:pt-14 lg:px-16">
          <Link href="/archivio" className="text-[15px] font-semibold text-[var(--lime)]">← Maglie retro</Link>
          <h1 className="disp mt-3 text-[clamp(3.4rem,11vw,9rem)] text-white">{g.title}</h1>
          <p className="mt-3 max-w-[48ch] text-[19px] leading-snug text-[var(--text-2)]">
            {g.text} <b className="text-white">{g.list.length} maglie a 40€.</b>
          </p>
        </header>
        <div className="era era-20">
          <ArchiveGrid items={g.list} filterTeams={slug === "leggende"} themed />
        </div>
      </div>
    );
  }

  const counts = Object.fromEntries(ERA_ORDER.map((s) => [s, all.filter((it) => eraOf(it.year)?.slug === s).length]));
  return (
    <div className={`era ${th.cls} ${eraFontClasses}`} style={{ background: "var(--e-bg)", color: "var(--e-fg)" }}>
      <EraHeader slug={slug} count={g.list.length} cups={eraInfo(all, slug).cups} />
      <ArchiveGrid items={g.list} filterTeams themed />
      <nav aria-label="Altre ere" className="border-t-2 px-5 py-10 md:px-10 lg:px-16" style={{ borderColor: "var(--e-line)" }}>
        <p className="era-title mb-5 text-[clamp(1.6rem,3vw,2.4rem)]">Cambia decennio</p>
        <ul className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {ERA_ORDER.filter((s) => s !== slug && counts[s] > 0).map((s) => {
            const t = ERA_THEME[s];
            return (
              <li key={s}>
                <Link href={`/archivio/${s}`} className={`era era-scene relative block aspect-[4/3] ${t.cls}`} aria-label={`${t.title}, ${counts[s]} maglie`}>
                  <span className="era-bg" aria-hidden="true" />
                  <EraNumeral cls={t.cls} value={t.numeral} className="absolute left-3 top-4" style={{ ["--num" as string]: "clamp(3.6rem, 9vw, 6.4rem)" }} />
                  <span className="absolute inset-x-0 bottom-0 px-3 py-2 font-[family-name:var(--font-display)] text-[16px] italic uppercase leading-none" style={{ background: "var(--e-ac)", color: "var(--e-ac-ink)" }}>{counts[s]} maglie</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
