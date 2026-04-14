import Link from "next/link";
import Image from "next/image";
import connectDB from "@/lib/db"; 
import Product from "@/lib/models/Product"; 
import ProductCard from "@/components/ui/ProductCard";
import { getFlagUrl } from "@/lib/utils/flags";

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

export default async function WorldCupHub() {
  const products = await getWorldCupProducts();

  // Group products by country
  const groupedProducts = products.reduce((acc: Record<string, any[]>, p: any) => {
    const country = p.country || p.nationalTeam || "Other";
    if (!acc[country]) acc[country] = [];
    acc[country].push(p);
    return acc;
  }, {});

  // Sort countries alphabetically
  const sortedCountries = Object.keys(groupedProducts).sort();

  return (
    <div className="min-h-screen bg-white font-munish">
      {/* Header Section */}
      <section className="max-w-7xl mx-auto px-6 pt-32 pb-12">
        <div className="flex flex-col items-start gap-2">
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-indigo-600">
            Estate 2026
          </p>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">
            Collezioni <span className="text-transparent [text-stroke:1px_black] [-webkit-text-stroke:1px_black]">Mondiali</span>
          </h1>
          <p className="max-w-xl mt-4 text-sm text-gray-500 leading-relaxed uppercase tracking-wider font-medium">
            Scopri la nostra selezione esclusiva di maglie ufficiali e kit per i Mondiali 2026, divisi per nazionale.
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {products.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-gray-100 rounded-3xl">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
              Nessun kit caricato nel database
            </p>
          </div>
        ) : (
          <div className="space-y-24">
            {sortedCountries.map((country) => (
              <div key={country} className="group/section">
                {/* Country Section Header */}
                <div className="flex items-center gap-4 mb-10 pb-4 border-b border-gray-100">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-sm border border-gray-500/10 transition-transform duration-500 group-hover/section:scale-110">
                    <Image 
                      src={getFlagUrl(country)} 
                      alt={country} 
                      fill 
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">
                      {country}
                    </h2>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-indigo-600 mt-1">
                      Selezione Ufficiale
                    </p>
                  </div>
                  <Link 
                    href={`/shop/worldcup/${country.toLowerCase()}`}
                    className="ml-auto text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-indigo-600 transition-all flex items-center gap-2"
                  >
                    Vedi Tutto <span className="text-lg">→</span>
                  </Link>
                </div>

                {/* Grid for Country Products */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-8 md:gap-y-20">
                  {groupedProducts[country].map((p: any) => (
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
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
