import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";

interface P {
  id: string;
  slug?: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  team?: string;
}

// Mosaico: una maglia grande e quattro piccole, non una fila di schede uguali
export default function EditorMosaic({ products }: { products: P[] }) {
  if (products.length < 5) return null;
  const [big, ...rest] = products.slice(0, 5);
  return (
    <section className="py-8 md:py-14">
      <div className="mx-auto mb-5 flex max-w-[1280px] items-end justify-between gap-4 px-5 md:px-8">
        <h2 className="disp text-[clamp(2.6rem,8vw,5rem)] text-white">Dal muro</h2>
        <Link href="/shop" className="btn btn-glass !h-11 shrink-0 !px-4 !text-[18px]">
          Tutto il catalogo <ArrowRight className="h-4 w-4" strokeWidth={3} />
        </Link>
      </div>
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-x-4 gap-y-9 px-5 md:px-8 lg:grid-cols-4 lg:gap-x-6">
        <div className="col-span-2 lg:row-span-2">
          <ProductCard id={big.id} slug={big.slug} name={big.name} price={big.price} image={big.image} category={big.category} team={big.team} priority />
        </div>
        {rest.map((p) => (
          <div key={p.id}>
            <ProductCard id={p.id} slug={p.slug} name={p.name} price={p.price} image={p.image} category={p.category} team={p.team} />
          </div>
        ))}
      </div>
    </section>
  );
}
