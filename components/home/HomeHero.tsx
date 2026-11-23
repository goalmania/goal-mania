import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cld } from "@/lib/utils/cloudinary";

interface HeroProduct {
  id: string;
  slug?: string;
  name: string;
  price: number;
  image: string;
}

const fmt = (n: number) => (Number.isInteger(Number(n)) ? String(Number(n)) : Number(n).toFixed(2).replace(".", ","));

function Poster({ p, w = 320, priority = false, className = "", style }: { p: HeroProduct; w?: number; priority?: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <Link
      href={`/products/${p.slug || p.id}`}
      className={`poster tape group block overflow-hidden ${className}`}
      style={style}
      aria-label={`${p.name}, ${fmt(p.price)} euro`}
    >
      <span className="relative block aspect-[4/5]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cld(p.image, w)}
          srcSet={`${cld(p.image, 320)} 320w, ${cld(p.image, 480)} 480w, ${cld(p.image, 720)} 720w`}
          sizes="(max-width: 1024px) 56vw, 300px"
          alt={p.name}
          width={480}
          height={600}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          className="absolute inset-0 h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.06]"
          style={{ mixBlendMode: "multiply" }}
        />
      </span>
      <span className="flex items-center justify-between gap-2 px-3 pb-3 pt-1">
        <span className="line-clamp-1 text-[15px] font-semibold uppercase tracking-[0.02em] text-black/80">{p.name.replace(/^Maglia\s+/i, "")}</span>
        <span className="num marker-line shrink-0 text-[26px]">{fmt(p.price)}€</span>
      </span>
    </Link>
  );
}

export default function HomeHero({ products }: { products: HeroProduct[] }) {
  const shelf = products.slice(0, 8);
  const c = shelf.slice(0, 5);
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 pb-6 pt-7 md:px-8 md:pt-12 lg:grid-cols-[1.02fr_1fr] lg:items-center lg:pb-14">
        <div>
          <p className="rise inline-block -rotate-2 bg-[var(--lime)] px-3 py-1.5 font-[family-name:var(--font-display)] text-[19px] italic uppercase leading-none text-[#0a0a0a]">
            Black Friday · prendi 3, paghi 2
          </p>
          <h1 className="disp rise mt-5 text-[clamp(3.9rem,14.5vw,9.5rem)] text-white" style={{ animationDelay: "70ms" }}>
            Il calcio
            <br />
            si <span className="mark"><span>indossa.</span></span>
          </h1>
          <p className="rise mt-6 max-w-[34ch] text-[19px] leading-snug text-[var(--text-2)]" style={{ animationDelay: "140ms" }}>
            Maglie da tifoso a <b className="text-white">35€</b>. Le retro a <b className="text-white">40€</b>. Ne prendi tre, ne paghi due. Spedizione gratuita.
          </p>
          <div className="rise mt-7 flex flex-wrap gap-3" style={{ animationDelay: "210ms" }}>
            <Link href="/shop" className="btn btn-lime">
              Scegli la tua maglia <ArrowRight className="h-5 w-5" strokeWidth={3} />
            </Link>
            <Link href="/archivio" className="btn btn-ghost">
              Archivio retro
            </Link>
          </div>
        </div>

        {/* Desktop: il muro con i manifesti */}
        {c.length >= 5 && (
          <div className="relative mx-auto hidden h-[640px] w-full max-w-[600px] lg:block" aria-label="Maglie in evidenza">
            <Poster p={c[0]} priority className="absolute left-0 top-10 z-10 w-[250px]" style={{ ["--rot" as string]: "-5deg" }} />
            <Poster p={c[1]} priority className="absolute right-4 top-0 z-20 w-[270px]" style={{ ["--rot" as string]: "4deg", ["--tape-rot" as string]: "5deg" }} />
            <Poster p={c[2]} className="absolute left-[120px] top-[250px] z-30 w-[270px]" style={{ ["--rot" as string]: "-1.5deg" }} />
            <Poster p={c[3]} className="absolute bottom-0 right-0 z-10 w-[230px]" style={{ ["--rot" as string]: "5.5deg", ["--tape-rot" as string]: "-6deg" }} />
            <Poster p={c[4]} className="absolute bottom-2 left-0 z-0 w-[210px]" style={{ ["--rot" as string]: "-7deg" }} />
            <span className="sticker spin-slow absolute right-[-6px] top-[300px] z-40 h-[118px] w-[118px] text-[44px]" aria-hidden="true">
              35€
            </span>
          </div>
        )}
      </div>

      {/* Telefono: la scansia scorre di lato, le maglie sono gia sulla prima schermata */}
      {shelf.length > 0 && (
        <div className="rail lg:hidden" aria-label="Maglie in evidenza">
          {shelf.map((p, i) => (
            <Poster key={p.id} p={p} priority={i < 2} className="w-[56vw] max-w-[250px]" style={{ ["--rot" as string]: `${i % 2 ? 1.6 : -1.6}deg` }} />
          ))}
        </div>
      )}
    </section>
  );
}
