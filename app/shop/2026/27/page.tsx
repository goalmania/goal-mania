import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import ProductCard from "@/components/ui/ProductCard";
import Link from "next/link";
import type { Metadata } from "next";
import { Zap } from "lucide-react";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Maglie 2026/27 | Goal Mania",
  description: "Scopri le nuove maglie da calcio 2026/27. Tutte le squadre, spedizione gratuita.",
};

async function get2627Products() {
  try {
    await connectDB();
    const products = await Product.find({
      $or: [
        { category: "2026/27" },
        { season: "2026/27" },
        { tags: "2026/27" },
        { title: { $regex: "2026-27", $options: "i" } },
        { title: { $regex: "26/27", $options: "i" } },
        { title: { $regex: "2026.27", $options: "i" } },
      ],
      isActive: true,
    }).sort({ feature: -1, createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(products));
  } catch {
    return [];
  }
}

export default async function Season2627Page() {
  const products = await get2627Products();

  return (
    <main className="min-h-screen bg-[#0a0a0a] font-munish">
      {/* Hero */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(200,240,0,0.025) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(200,240,0,0.025) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(200,240,0,0.06) 0%, transparent 70%)" }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={12} style={{ color: "#c8f000" }} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: "rgba(200,240,0,0.6)" }}>
              Nuova Stagione
            </span>
          </div>
          <h1
            className="font-black italic uppercase leading-none mb-3"
            style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)", color: "#fff", letterSpacing: "-0.025em" }}
          >
            Maglie <span style={{ color: "#c8f000" }}>2026/27</span>
          </h1>
          <p className="text-sm text-white/40 max-w-xl">
            Le nuove uscite della stagione 2026/27. Serie A, Premier League, Champions League e Nazionali.
          </p>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center gap-4 mt-6">
            {["🚚 Spedizione Gratuita", "🔄 Reso 30gg", "🔒 Pagamento Sicuro"].map((t) => (
              <span key={t} className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p: any) => (
              <ProductCard
                key={p._id}
                id={p._id}
                name={p.title}
                price={p.basePrice}
                image={p.images?.[0] ?? "/placeholder.jpg"}
                category={p.category}
                team={p.team}
                isNew={true}
                href={`/products/${p.slug}`}
                product={p}
              />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-32 rounded-3xl"
            style={{ border: "1px dashed rgba(200,240,0,0.1)" }}
          >
            <Zap size={32} className="mx-auto mb-4" style={{ color: "rgba(200,240,0,0.2)" }} />
            <h2 className="text-lg font-black uppercase italic text-white/20 mb-2">
              Nuovi kit in arrivo!
            </h2>
            <p className="text-sm text-white/20 mb-6">
              Le maglie 2026/27 saranno disponibili a breve.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-black uppercase text-[11px] tracking-widest transition-all active:scale-95"
              style={{ background: "#c8f000", color: "#000" }}
            >
              Esplora lo Shop
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
