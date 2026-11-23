import Link from "next/link";
import { ChevronRight } from "lucide-react";
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
}: {
  title: string;
  href: string;
  products: RailProduct[];
  priorityFirst?: boolean;
}) {
  if (!products.length) return null;
  return (
    <section className="py-8 md:py-12">
      <div className="mx-auto mb-5 flex max-w-[1280px] items-end justify-between gap-4 px-5 md:px-8">
        <h2 className="display text-[clamp(1.9rem,5vw,3rem)]">{title}</h2>
        <Link href={href} className="flex min-h-[44px] shrink-0 items-center gap-0.5 text-[16px] font-semibold text-[var(--lime)]">
          Vedi tutte <ChevronRight className="h-5 w-5" />
        </Link>
      </div>
      <div className="rail">
        {products.map((p, i) => (
          <div key={p.id} className="w-[66vw] max-w-[290px] md:w-[272px]">
            <ProductCard id={p.id} slug={p.slug} name={p.name} price={p.price} image={p.image} category={p.category} team={p.team} priority={priorityFirst && i < 2} />
          </div>
        ))}
      </div>
    </section>
  );
}
