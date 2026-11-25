import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import AutoRail from "@/components/ui/AutoRail";
import { isShowable } from "@/lib/photoFix";

interface RailProduct {
  id: string;
  slug?: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  team?: string;
}

export default function ProductRail({
  title,
  href,
  products: allProducts,
  priorityFirst = false,
  lead,
  eyebrow,
}: {
  title: string;
  href: string;
  products: RailProduct[];
  priorityFirst?: boolean;
  lead?: string;
  eyebrow?: string;
}) {
  const products = allProducts.filter((p) => isShowable(p.id, p.image));
  if (!products.length) return null;
  return (
    <section className="py-8 md:py-12">
      <div className="mx-auto mb-4 flex w-full max-w-[1760px] items-end justify-between gap-4 px-5 md:px-10 lg:px-16">
        <div>
          {eyebrow && <p className="text-[14px] font-bold text-[var(--lime)]">{eyebrow}</p>}
          <h2 className="disp mt-1 text-[clamp(2.6rem,7vw,5.4rem)] text-white">{title}</h2>
          {lead && <p className="mt-2 max-w-[44ch] text-[18px] italic leading-snug text-[var(--text-2)]">{lead}</p>}
        </div>
        <Link href={href} className="btn btn-glass !h-11 shrink-0 !px-4 !text-[18px]">
          Vedi tutte <ArrowRight className="h-4 w-4" strokeWidth={3} />
        </Link>
      </div>
      <AutoRail label={title}>
        {products.map((p, i) => (
          <div key={p.id} className="w-[64vw] max-w-[290px] md:w-[300px] 2xl:w-[330px]">
            <ProductCard id={p.id} slug={p.slug} name={p.name} price={p.price} image={p.image} category={p.category} team={p.team} priority={priorityFirst && i < 2} />
          </div>
        ))}
      </AutoRail>
    </section>
  );
}
