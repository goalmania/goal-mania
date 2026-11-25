import type { Metadata } from "next";
import { notFound } from "next/navigation";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import CategoryBrowser from "@/components/shop/CategoryBrowser";
import { CLUBS, clubBySlug, clubOfTitle } from "@/lib/clubs";

export const revalidate = 300;

export function generateStaticParams() {
  return CLUBS.filter((c) => !c.href).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = clubBySlug(slug);
  if (!c) return {};
  return {
    title: `Maglie ${c.name}: nuova stagione e retro, da 35€ | Goal Mania`,
    description: `Tutte le maglie ${c.name}: le ultime stagioni e le retro. Versione tifoso, da 35€ le attuali e 40€ le retro, spedizione gratuita in Italia, reso entro 14 giorni.`,
    alternates: { canonical: `https://goal-mania.it/squadre/${c.slug}` },
  };
}

export default async function SquadraPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = clubBySlug(slug);
  if (!c) notFound();
  await connectDB();
  const rows = await Product.find({ isActive: true, isMysteryBox: { $ne: true }, title: { $regex: c.re.source, $options: "i" } })
    .sort({ feature: -1, createdAt: -1 })
    .select("title slug basePrice retroPrice isRetro category images")
    .lean<any[]>();
  const items = rows
    .filter((p) => clubOfTitle(p.title)?.slug === c.slug)
    .map((p) => ({
      id: String(p._id),
      slug: p.slug || "",
      name: p.title,
      price: Number(p.isRetro ? p.retroPrice : p.basePrice) || Number(p.basePrice) || 0,
      image: p.images?.[0] || "/images/image.png",
      category: p.category || "",
    }));
  if (!items.length) notFound();
  return (
    <CategoryBrowser
      products={items}
      title={`Maglie ${c.name}`}
      eyebrow={c.league === "serie-a" ? "Serie A" : c.league === "premier" ? "Premier League" : "Squadre"}
      lead={`Le maglie ${c.name} delle ultime stagioni e le retro. Versione tifoso, non ufficiale: Goal Mania non è affiliata al club.`}
      logo={c.logo || null}
      here={`/squadre/${c.slug}`}
    />
  );
}
