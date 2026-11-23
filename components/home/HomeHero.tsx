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

function Plate({ p, priority }: { p: HeroProduct; priority?: boolean }) {
  return (
    <Link
      href={`/products/${p.slug || p.id}`}
      className="group relative block aspect-[4/5] w-[58vw] max-w-[270px] overflow-hidden rounded-[28px] bg-[#f5f5f7] md:w-[262px]"
      aria-label={`${p.name}, ${fmt(p.price)} euro`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cld(p.image, 440)}
        srcSet={`${cld(p.image, 320)} 320w, ${cld(p.image, 440)} 440w, ${cld(p.image, 660)} 660w`}
        sizes="(max-width: 768px) 58vw, 262px"
        alt={p.name}
        width={440}
        height={550}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className="absolute inset-0 h-full w-full object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-[1.05]"
        style={{ mixBlendMode: "multiply" }}
      />
      <span className="num absolute bottom-3 left-3 rounded-full bg-black/75 px-3.5 py-2 text-[17px] text-white backdrop-blur-md">
        {fmt(p.price)}€
      </span>
    </Link>
  );
}

export default function HomeHero({ products }: { products: HeroProduct[] }) {
  const shelf = products.slice(0, 8);
  const lead = shelf[0];
  return (
    <section className="relative isolate overflow-hidden">
      {/* Luce ambiente: la foto della prima maglia, sfocata, da' il colore al vetro */}
      {lead && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          aria-hidden="true"
          alt=""
          src={cld(lead.image, 300)}
          className="absolute inset-0 -z-10 h-full w-full scale-[1.5] object-cover opacity-[0.3] blur-[64px] saturate-150"
        />
      )}
      <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-b from-transparent to-[var(--bg)]" />

      <div className="mx-auto max-w-[1280px] px-5 pb-6 pt-8 md:px-8 md:pb-10 md:pt-16">
        <p className="glass rise inline-flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-medium">
          <span className="h-2 w-2 rounded-full bg-[var(--lime)]" aria-hidden="true" />
          Black Friday · prendi 3, ne paghi 2
        </p>
        <h1 className="display rise mt-5 text-[clamp(2.9rem,10vw,6rem)]" style={{ animationDelay: "80ms" }}>
          Maglie da calcio.
          <br />
          <span className="text-white/55">Tutte a 35€.</span>
        </h1>
        <p className="rise mt-5 max-w-[34ch] text-[19px] leading-snug text-[var(--text-2)]" style={{ animationDelay: "160ms" }}>
          Retro a 40€. Spedizione gratuita in Italia e reso entro 14 giorni.
        </p>
        <div className="rise mt-7 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
          <Link href="/shop" className="btn btn-lime">
            Scegli la maglia <ArrowRight className="h-5 w-5" strokeWidth={2.4} />
          </Link>
          <Link href="#offerta" className="btn btn-glass">
            Come funziona il 3×2
          </Link>
        </div>
      </div>

      {shelf.length > 0 && (
        <div className="rail pb-8 md:pb-12" aria-label="Maglie in evidenza">
          {shelf.map((p, i) => (
            <Plate key={p.id} p={p} priority={i < 2} />
          ))}
        </div>
      )}
    </section>
  );
}
