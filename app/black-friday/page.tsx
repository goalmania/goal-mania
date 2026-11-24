import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import connectDB from "@/lib/db";
import ProductModel from "@/lib/models/Product";
import PageHeader from "@/components/shared/PageHeader";
import ThreeForTwo from "@/components/home/ThreeForTwo";
import ProductRail from "@/components/home/ProductRail";
import TrustBar from "@/components/home/TrustBar";
import FaqShort from "@/components/shared/FaqShort";
import { getArchiveItems } from "@/lib/archiveData";
import { pickHyped, rotationSeed } from "@/lib/hype";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Black Friday maglie da calcio: prendi 3, paghi 2",
  description: "Black Friday su Goal Mania: metti tre maglie nello stesso ordine e la meno cara è in regalo. Maglie a 35€, retro a 40€, spedizione gratuita in Italia, reso entro 14 giorni.",
  alternates: { canonical: "https://goal-mania.it/black-friday" },
};

async function getPool() {
  try {
    await connectDB();
    const rows = await ProductModel.find({ isActive: true, category: { $in: ["2026/27", "2025/26", "World Cup 2026"] } })
      .select({ title: 1, slug: 1, basePrice: 1, category: 1, feature: 1, images: { $slice: 1 } })
      .limit(260)
      .lean();
    return JSON.parse(JSON.stringify(rows)).map((p: any) => ({ id: String(p._id), slug: p.slug || "", name: p.title, price: Number(p.basePrice) || 35, image: p.images?.[0] || "/images/image.png", category: p.category, feature: !!p.feature, isRetro: false }));
  } catch {
    return [];
  }
}

// Pagina del Black Friday: spiega l'unica offerta vera (il 3x2) e porta alle maglie piu cercate. Nessuno sconto inventato, nessun conto alla rovescia.
export default async function BlackFridayPage() {
  const [current, retro] = await Promise.all([getPool(), getArchiveItems()]);
  const pool = [...current, ...retro.map((r) => ({ id: r.id, slug: r.slug, name: r.name, price: r.price, image: r.image, category: "Retro", team: r.year ? String(r.year) : "Retro", feature: false, isRetro: true }))];
  const picks = pickHyped(pool as any[], 12, rotationSeed(15, 5)) as any[];
  const trio = pickHyped(current as any[], 3, rotationSeed(15, 6), 0) as any[];
  return (
    <div>
      <PageHeader eyebrow="Black Friday 2026" title={<>Prendi 3, <span className="mark"><span>paghi 2.</span></span></>} lead="Metti tre maglie nello stesso ordine e la meno cara è in regalo. Vale per le maglie della stagione (35€) e per le retro (40€), con spedizione gratuita.">
        <div className="flex flex-wrap gap-3">
          <Link href="/shop" className="btn btn-lime">Scegli le tue 3 <ArrowRight className="h-5 w-5" strokeWidth={3} /></Link>
          <Link href="/shop/mystery-box" className="btn btn-ghost">Prova la Mystery box</Link>
        </div>
      </PageHeader>
      <ThreeForTwo products={trio} />
      <ProductRail eyebrow="Le più cercate" title="Da dove cominciare" href="/shop" lead="Attuali e retro, quelle che si cercano di più. Cambiano spesso." products={picks} priorityFirst />
      <section className="mx-auto w-full max-w-[1760px] px-5 pb-10 md:px-10 lg:px-16">
        <ul className="grid gap-4 md:grid-cols-3">
          {[
            ["Come funziona", "Aggiungi al carrello tre maglie qualsiasi. Il carrello ti mostra il risparmio prima di pagare."],
            ["Quale è gratis", "La meno cara delle tre. Con quattro, cinque o sei maglie la regola si ripete ogni tre."],
            ["Nessuna sorpresa", "I prezzi sono quelli di sempre: 35€ le attuali, 40€ le retro. Qui l'offerta è il 3x2, non un prezzo barrato."],
          ].map(([t, d]) => (
            <li key={t} className="rounded-3xl bg-[var(--wall)] p-6 shadow-[inset_0_0_0_1px_var(--line)]">
              <p className="text-[22px] font-bold text-white">{t}</p>
              <p className="mt-2 text-[17px] italic leading-snug text-[var(--text-2)]">{d}</p>
            </li>
          ))}
        </ul>
      </section>
      <FaqShort title="Prima di ordinare" />
      <TrustBar />
    </div>
  );
}
