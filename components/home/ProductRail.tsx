import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";

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
  products,
  priorityFirst = false,
  lead,
}: {
  title: string;
  href: string;
  products: RailProduct[];
  priorityFirst?: boolean;
  lead?: string;
}) {
  if (!products.length) return null;
  return (
    <section className="py-8 md:py-12">
      <div className="mx-auto mb-3 flex max-w-[1280px] items-end justify-between gap-4 px-5 md:px-8">
        <div>
          <h2 className="disp text-[clamp(2.6rem,8vw,5rem)] text-white">{title}</h2>
          {lead && <p className="mt-2 max-w-[44ch] text-[17px] leading-snug text-[var(--text-2)]">{lead}</p>}
        </div>
        <Link href={href} className="btn btn-glass !h-11 shrink-0 !px-4 !text-[18px]">
          Vedi tutte <ArrowRight className="h-4 w-4" strokeWidth={3} />
        </Link>
      </div>
      <div className="rail">
        {products.map((p, i) => (
          <div key={p.id} className="w-[64vw] max-w-[290px] md:w-[272px]">
            <ProductCard id={p.id} slug={p.slug} name={p.name} price={p.price} image={p.image} category={p.category} team={p.team} priority={priorityFirst && i < 2} />
          </div>
        ))}
      </div>
    </section>
  );
}
