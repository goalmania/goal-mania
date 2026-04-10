import Link from "next/link";
import connectDB from "@/lib/db"; 
import Product from "@/lib/models/Product"; 
import ProductCard from "@/components/ui/ProductCard";

export const revalidate = 3600; // Revalidate every hour

async function getWorldCupProducts() {
  try {
    await connectDB();
    
    const products = await Product.find({ 
      isWorldCup: true, 
      isActive: true 
    }).sort({ createdAt: -1 }).lean();

    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error("Database failure:", error);
    return [];
  }
}

export default async function WorldCupHub({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const products = await getWorldCupProducts();
  
  const itemsPerPage = 12;
  const currentPage = Number((await searchParams).page) || 1;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-white font-munish">
      <section className="max-w-7xl mx-auto px-6 pt-32 pb-12">
        <div className="flex flex-col items-start gap-2">
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-indigo-600">
            Estate 2026
          </p>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">
            Collezioni <span className="text-transparent [text-stroke:1px_black] [-webkit-text-stroke:1px_black]">Mondiali</span>
          </h1>
          <p className="max-w-xl mt-4 text-sm text-gray-500 leading-relaxed uppercase tracking-wider font-medium">
            Scopri la nostra selezione esclusiva di maglie ufficiali e kit per i Mondiali 2026.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12">
        {products.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-gray-100 rounded-3xl">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
              Nessun kit caricato nel database
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-8 md:gap-y-20">
            {paginatedProducts.map((p: any) => (
              <ProductCard
                key={p._id.toString()}
                id={p._id.toString()}
                name={p.title}
                price={p.basePrice}
                image={p.images?.[0] || "/placeholder.jpg"}
                category={p.category}
                team={p.nationalTeam || p.country}
                isWorldCup={p.isWorldCup}
                hasLongSleeve={p.hasLongSleeve}
                href={`/products/${p.slug}`}
                product={p}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-16 flex justify-center items-center gap-6">
            <Link
              href={`?page=${Math.max(1, currentPage - 1)}`}
              className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest border-2 border-gray-900 transition-all ${
                currentPage === 1 ? "opacity-20 pointer-events-none" : "hover:bg-gray-900 hover:text-white"
              }`}
            >
              Precedente
            </Link>
            <span className="text-xs font-black italic">
              {currentPage} / {totalPages}
            </span>
            <Link
              href={`?page=${Math.min(totalPages, currentPage + 1)}`}
              className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest border-2 border-gray-900 transition-all ${
                currentPage === totalPages ? "opacity-20 pointer-events-none" : "hover:bg-gray-900 hover:text-white"
              }`}
            >
              Successivo
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
