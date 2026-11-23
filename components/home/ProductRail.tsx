import Link from "next/link";
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
    <section className="bg-[#0a0a0a] py-9 md:py-14">
      <div className="mx-auto mb-5 flex max-w-[1280px] items-end justify-between gap-4 px-4 md:px-8">
        <h2 className="display text-[clamp(2.4rem,8vw,4.5rem)] text-white">{title}</h2>
        <Link
          href={href}
          className="cut cut-sm flex h-11 shrink-0 items-center bg-white/10 px-4 text-[16px] font-extrabold uppercase tracking-wide text-white transition-colors hover:bg-[#c8f000] hover:text-[#0a0a0a]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Vedi tutte
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
