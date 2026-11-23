import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ArchiveGrid from "@/components/shop/ArchiveGrid";
import { getArchiveItems, groupItems } from "@/lib/archiveData";
import { ERAS } from "@/lib/archive";

export const revalidate = 300;

// Epoche e leggende note in anticipo; le squadre si generano alla prima visita e restano in cache
export async function generateStaticParams() {
  return [...ERAS.map((e) => ({ slug: e.slug })), { slug: "leggende" }];
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
  const g = groupItems(await getArchiveItems(), slug);
  if (!g || g.list.length === 0) notFound();
  return (
    <div>
      <header className="mx-auto max-w-7xl px-5 pb-6 pt-8 md:px-8 md:pt-12">
        <Link href="/archivio" className="text-[15px] font-semibold text-[var(--lime)]">← Archivio retro</Link>
        <h1 className="disp mt-3 text-[clamp(3.2rem,11vw,7rem)] text-white">{g.title}</h1>
        <p className="mt-3 max-w-[48ch] text-[19px] leading-snug text-[var(--text-2)]">
          {g.text} <b className="text-white">{g.list.length} maglie a 40€.</b>
        </p>
      </header>
      <ArchiveGrid items={g.list} />
    </div>
  );
}
