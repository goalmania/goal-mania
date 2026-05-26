import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { Metadata } from "next";
import ProductCard from "@/components/ui/ProductCard";
import Link from "next/link";
import Image from "next/image";
import { getFlagUrl } from "@/lib/utils/flags";
import { Trophy, ArrowLeft, ShieldCheck, Truck, RotateCcw } from "lucide-react";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ team: string }>;
}

const TEAM_DISPLAY: Record<string, string> = {
  argentina:  "Argentina",
  brazil:     "Brasile",
  france:     "Francia",
  england:    "Inghilterra",
  portugal:   "Portogallo",
  germany:    "Germania",
  spain:      "Spagna",
  italy:      "Italia",
  usa:        "USA",
  mexico:     "Messico",
  morocco:    "Marocco",
  japan:      "Giappone",
};

const FLAG_SLUG: Record<string, string> = {
  argentina:  "argentina",
  brazil:     "brazil",
  france:     "france",
  england:    "england",
  portugal:   "portugal",
  germany:    "germany",
  spain:      "spain",
  italy:      "italy",
  usa:        "united states",
  mexico:     "mexico",
  morocco:    "morocco",
  japan:      "japan",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { team } = await params;
  const display = TEAM_DISPLAY[team] ?? (team.charAt(0).toUpperCase() + team.slice(1));
  return {
    title: `Maglia ${display} Mondiali 2026 | Goal Mania`,
    description: `Kit ${display} per i Mondiali 2026. Spedizione rapida in Italia.`,
  };
}

export default async function NationalTeamPage({ params }: PageProps) {
  const { team } = await params;
  await connectDB();

  const products: any[] = await Product.find({
    isWorldCup: true,
    $or: [
      { nationalTeam: { $regex: new RegExp(`^${team}$`, "i") } },
      { country:      { $regex: new RegExp(`^${team}$`, "i") } },
    ],
    isActive: true,
  }).lean();

  const serialized = JSON.parse(JSON.stringify(products));
  const display = TEAM_DISPLAY[team.toLowerCase()] ?? (team.charAt(0).toUpperCase() + team.slice(1));
  const flagCountry = FLAG_SLUG[team.toLowerCase()] ?? team.toLowerCase();
  const flagUrl = getFlagUrl(flagCountry);

  return (
    <main className="min-h-screen bg-[#050505] font-munish">

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        {/* Grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,215,0,0.02) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(255,215,0,0.02) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        {/* Flag bg blur */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src={flagUrl}
            alt={display}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "blur(60px) brightness(0.12) saturate(0.6)", transform: "scale(1.2)" }}
          />
        </div>
        {/* Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,215,0,0.06) 0%, transparent 70%)" }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/30 mb-8 font-bold">
            <Link href="/shop/worldcup" className="hover:text-[#FFD700] transition-colors flex items-center gap-1.5">
              <ArrowLeft size={10} />
              World Cup 2026
            </Link>
            <span>/</span>
            <span style={{ color: "#FFD700" }}>{display}</span>
          </nav>

          {/* Nation identity */}
          <div className="flex items-end gap-6 mb-6">
            <div className="relative w-20 h-14 rounded-lg overflow-hidden shadow-2xl flex-shrink-0" style={{ border: "1px solid rgba(255,215,0,0.2)" }}>
              <Image src={flagUrl} alt={display} fill className="object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Trophy size={12} style={{ color: "#FFD700" }} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: "rgba(255,215,0,0.6)" }}>
                  World Cup 2026
                </span>
              </div>
              <h1
                className="font-black italic uppercase leading-none"
                style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)", color: "#fff", letterSpacing: "-0.025em" }}
              >
                {display}
              </h1>
              {serialized.length > 0 && (
                <p className="text-sm text-white/40 mt-2 font-medium">
                  {serialized.length} {serialized.length === 1 ? "kit disponibile" : "kit disponibili"}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Products ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        {serialized.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {serialized.map((p: any) => (
              <ProductCard
                key={p._id}
                id={p._id}
                name={p.title}
                price={p.basePrice}
                image={p.images?.[0] ?? p.Images?.[0] ?? "/placeholder.jpg"}
                category={p.category}
                team={p.nationalTeam ?? p.country}
                isWorldCup={p.isWorldCup}
                hasLongSleeve={p.hasLongSleeve}
                href={`/products/${p.slug}`}
                product={p}
              />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-32 rounded-3xl"
            style={{ border: "1px dashed rgba(255,215,0,0.1)" }}
          >
            <Trophy size={32} className="mx-auto mb-4" style={{ color: "rgba(255,215,0,0.2)" }} />
            <h2 className="text-lg font-black uppercase italic text-white/20 mb-2">
              Kit in arrivo per {display}
            </h2>
            <p className="text-sm text-white/20 mb-6">Torna presto!</p>
            <Link
              href="/shop/worldcup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-black uppercase text-[11px] tracking-widest transition-all active:scale-95"
              style={{ background: "#c8f000", color: "#000" }}
            >
              <ArrowLeft size={12} />
              Tutte le Nazionali
            </Link>
          </div>
        )}
      </section>

      {/* ── Trust strip ── */}
      {serialized.length > 0 && (
        <section
          className="max-w-7xl mx-auto px-4 sm:px-6 py-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          <div className="grid grid-cols-3 gap-4">
            {[
              { Icon: Truck,       title: "Spedizione Rapida", sub: "3-5 gg lavorativi" },
              { Icon: RotateCcw,   title: "Reso Gratuito",     sub: "30 giorni" },
              { Icon: ShieldCheck, title: "Pagamento Sicuro",  sub: "SSL · PayPal" },
            ].map(({ Icon, title, sub }) => (
              <div key={title} className="flex flex-col items-center text-center gap-1.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(255,215,0,0.07)", border: "1px solid rgba(255,215,0,0.1)" }}
                >
                  <Icon size={14} style={{ color: "#FFD700" }} />
                </div>
                <p className="text-[10px] font-black uppercase text-white/60">{title}</p>
                <p className="text-[9px] text-white/25">{sub}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
