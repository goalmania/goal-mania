"use client";

import Link from "next/link";
import CategoryBrowser from "@/components/shop/CategoryBrowser";
import AutoRail from "@/components/ui/AutoRail";
import { getFlagUrl } from "@/lib/utils/flags";

interface Product {
  _id: string;
  title: string;
  basePrice: number;
  images?: string[];
  category?: string;
  nationalTeam?: string;
  country?: string;
  slug: string;
  [key: string]: any;
}

const IT: Record<string, string> = {
  Brazil: "Brasile", Argentina: "Argentina", France: "Francia", England: "Inghilterra", Portugal: "Portogallo", Germany: "Germania",
  Spain: "Spagna", Italy: "Italia", USA: "USA", Mexico: "Messico", Morocco: "Marocco", Japan: "Giappone",
  Netherlands: "Olanda", Belgium: "Belgio", Croatia: "Croazia", Senegal: "Senegal",
};
const PRIORITY = Object.keys(IT);

// Maglie delle nazionali del Mondiale 2026: una fila di bandiere per saltare alla squadra, poi tutte le maglie con i filtri
export default function WorldCupClient({ products, sortedCountries, groupedProducts }: { products: Product[]; groupedProducts: Record<string, Product[]>; sortedCountries: string[] }) {
  const countries = [...sortedCountries].filter((c) => c !== "Other").sort((a, b) => {
    const ia = PRIORITY.indexOf(a), ib = PRIORITY.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
  });
  const mapped = products.map((p) => ({
    id: String(p._id), slug: p.slug || "", name: p.title, price: p.basePrice, image: p.images?.[0] || "/images/image.png", category: p.category || "World Cup 2026",
  }));
  return (
    <div>
      <CategoryBrowser products={mapped} title="Mondiali 2026" eyebrow="Maglie delle nazionali" lead="Le maglie delle nazionali del Mondiale 2026, a 35€. Scegli la bandiera della tua squadra o cerca nell'elenco." here="/shop/worldcup" />
      {countries.length > 0 && (
        <section aria-label="Scegli la nazionale" className="pb-10">
          <h2 className="disp mx-auto mb-4 w-full max-w-[1760px] px-5 text-[clamp(2rem,5vw,3.6rem)] text-white md:px-10 lg:px-16">Scegli la nazionale</h2>
          <AutoRail label="Nazionali" speed={26}>
            {countries.map((c) => (
              <Link key={c} href={`/shop/worldcup/${c.toLowerCase().replace(/\s+/g, "-")}`} draggable={false} className="group relative block h-[150px] w-[190px] shrink-0 overflow-hidden rounded-2xl shadow-[inset_0_0_0_1px_var(--line)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getFlagUrl(c)} alt="" loading="lazy" draggable={false} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-3">
                  <span className="disp block text-[26px] text-white">{IT[c] ?? c}</span>
                  <span className="text-[14px] font-semibold text-white/80">{groupedProducts[c]?.length ?? 0} maglie</span>
                </span>
              </Link>
            ))}
          </AutoRail>
        </section>
      )}
    </div>
  );
}
