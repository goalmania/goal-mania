import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { Metadata } from "next";
import ProductCard from "@/components/ui/ProductCard";
import Link from "next/link";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ team: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { team } = await params;
  const teamName = team.charAt(0).toUpperCase() + team.slice(1);
  return {
    title: `Maglia ${teamName} Mondiali 2026`,
    description: `Acquista la maglia ufficiale ${teamName} per i Mondiali 2026. Spedizione gratuita in Italia.`,
  };
}

export default async function NationalTeamPage({ params }: PageProps) {
  const { team } = await params;
  await connectDB();

  const products = await Product.find({
    isWorldCup: true,
    $or: [
      { nationalTeam: { $regex: new RegExp(`^${team}$`, "i") } },
      { country: { $regex: new RegExp(`^${team}$`, "i") } }
    ],
    isActive: true
  }).lean();

  return (
    <main className="min-h-screen pb-20 bg-[#0a0a0a]">
      <div className="bg-[#fcfcfc] border-b border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/40 mb-6">
            <Link href="/shop/worldcup" className="hover:text-white transition-colors">World Cup</Link> 
            <span>/</span> 
            <span className="text-[#c8f000] font-bold">{team}</span>
          </nav>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
            {team} <span className="text-transparent [text-stroke:1px_#4f46e5] [-webkit-text-stroke:1px_#4f46e5]">Edition</span>
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-16">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-8 md:gap-y-20">
            {products.map((p: any) => (
              <ProductCard
                key={p._id.toString()}
                id={p._id.toString()}
                name={p.title}
                price={p.basePrice}
                image={p.images?.[0] || p.Images?.[0] || "/placeholder.jpg"}
                category={p.category}
                team={p.nationalTeam || p.country}
                isWorldCup={p.isWorldCup}
                hasLongSleeve={p.hasLongSleeve}
                href={`/products/${p.slug}`}
                product={JSON.parse(JSON.stringify(p))}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-40 border-2 border-dashed border-gray-100 rounded-3xl">
             <h2 className="text-2xl font-black uppercase italic text-white/30">No jerseys found for {team}</h2>
             <Link href="/shop/worldcup" className="mt-4 inline-block text-[#c8f000] font-bold uppercase tracking-widest text-xs">Back to Hub</Link>
          </div>
        )}
      </div>
    </main>
  );
}
