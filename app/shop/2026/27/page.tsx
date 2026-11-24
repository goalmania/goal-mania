import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import type { Metadata } from "next";
import Season2627Client from "@/app/_components/Season2627Client";
import { buildCollectionSchema } from "@/lib/seo/collectionSchema";
import Link from "next/link";
import { getLeague, extractTeamName } from "@/lib/seasonLeague";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Maglie Serie A 2026/27 e Nuove Maglie Calcio 2026/27 a 35€",
  description:
    "Le maglie Serie A 2026/27 e le nuove maglie della stagione: Inter, Milan, Juventus, Napoli, Roma e i club europei, tutte a 35€. Spedizione gratuita in Italia, reso entro 14 giorni.",
  keywords: [
    "maglie serie a 2026 27",
    "maglie calcio 2026/27",
    "maglie 2026 27",
    "nuove maglie calcio",
    "maglie stagione 2026",
    "maglie Serie A 2026/27",
    "maglie Premier League 2026/27",
    "maglie Real Madrid 2026/27",
    "maglie Bayern Monaco 2026/27",
  ],
  alternates: {
    canonical: "https://goal-mania.it/shop/2026/27",
  },
  openGraph: {
    title: "Maglie Calcio 2026/27 | Goal Mania",
    description:
      "Le nuove maglie della stagione 2026/27. Inter, Milan, Liverpool, Real Madrid, Bayern, PSG a partire da €35. Spedizione gratuita.",
    url: "https://goal-mania.it/shop/2026/27",
    type: "website",
  },
};

async function getCurrentSeasonProducts() {
  try {
    await connectDB();
    const products = await Product.find({
      $or: [
        { category: "2026/27" },
        { title: { $regex: "2026[-/]27", $options: "i" } },
      ],
      isActive: true,
    })
      .sort({ feature: -1, createdAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(products));
  } catch {
    return [];
  }
}

export default async function Season2627Page() {
  const raw = await getCurrentSeasonProducts();

  const products = raw
    .filter((p: any) => p._id && p.title)
    .map((p: any) => ({
      id: String(p._id),
      name: p.title,
      price: p.basePrice ?? 30,
      image: p.images?.[0] ?? "/placeholder.jpg",
      category: p.category ?? "2025/26",
      slug: p.slug ?? "",
      team: p.title,
      feature: !!p.feature,
    }));

  const serieA = products.filter((p: { name: string }) => getLeague(p.name) === "serieA");
  const serieAPrices = serieA.map((p: { price: number }) => Number(p.price)).filter((n: number) => n > 0);
  const minPrice = serieAPrices.length ? Math.min(...serieAPrices) : 0;
  const priceLabel = serieAPrices.every((n: number) => n === minPrice) ? `a ${minPrice}€ l'una` : `da ${minPrice}€`;
  const serieATeams = [...new Set(serieA.map((p: { name: string }) => extractTeamName(p.name)))];

  const collectionSchema = buildCollectionSchema({
    name: "Maglie Calcio 2026/27",
    url: "https://goal-mania.it/shop/2026/27",
    description:
      "Acquista le maglie calcio della stagione 2026/27 a partire da €35. Inter, Milan, Juventus, Napoli, Liverpool, Real Madrid, Bayern Monaco e altri. Spedizione gratuita in Italia.",
    products: raw,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <Season2627Client products={products} />
      {serieA.length > 0 && (
        <section aria-labelledby="sa-2627" className="mx-auto max-w-[1760px] px-5 pb-16 md:px-8">
          <h2 id="sa-2627" className="display text-[clamp(1.6rem,4vw,2.4rem)]">Maglie Serie A 2026/27: le squadre disponibili</h2>
          <p className="mt-3 max-w-[70ch] text-[17px] leading-relaxed text-[var(--text-2)]">
            Abbiamo {serieA.length} maglie di Serie A della stagione 2026/27, di {serieATeams.length} squadre. Sono maglie versione tifoso, {priceLabel}, con nome e numero su richiesta. La spedizione in Italia è gratuita, la consegna richiede 7-10 giorni lavorativi e hai 14 giorni per il reso. Goal Mania non è affiliata ai club: i nomi delle squadre servono solo a dirti quale maglia stai comprando.
          </p>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[16px]">
            {serieA.map((p: { id: string; slug: string; name: string }) => (
              <li key={p.id}>
                <Link href={`/products/${p.slug || p.id}`} className="underline underline-offset-4 hover:text-[var(--lime)]">{p.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
