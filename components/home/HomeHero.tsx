import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cld } from "@/lib/utils/cloudinary";
import BoardNumber from "./BoardNumber";

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
      className="group relative block aspect-[4/5] overflow-hidden bg-[#f1f1ec] outline outline-1 -outline-offset-1 outline-white/10"
      aria-label={`${p.name}, ${fmt(p.price)} euro`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cld(p.image, 420)}
        srcSet={`${cld(p.image, 300)} 300w, ${cld(p.image, 420)} 420w, ${cld(p.image, 640)} 640w`}
        sizes="(max-width: 1024px) 44vw, 220px"
        alt={p.name}
        width={420}
        height={525}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className="absolute inset-0 h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.05]"
        style={{ mixBlendMode: "multiply" }}
      />
      <span className="cut cut-sm absolute bottom-0 left-0 bg-[#c8f000] px-3 pb-1 pt-1.5 text-[#0a0a0a]">
        <span className="num text-[30px]">{fmt(p.price)}€</span>
      </span>
    </Link>
  );
}

export default function HomeHero({ products }: { products: HeroProduct[] }) {
  const shelf = products.slice(0, 8);
  return (
    <section className="border-b border-white/12 bg-[#0a0a0a]">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-4 pb-6 pt-5 md:px-8 md:pb-12 md:pt-10 lg:grid-cols-[1.05fr_1fr] lg:items-end">
        <div>
          <h1 className="display text-[clamp(3.6rem,18vw,6rem)] text-white lg:text-[clamp(4.5rem,7vw,6rem)]">
            Maglie
            <br />
            da calcio
          </h1>

          {/* Il tabellone: tre prezzi, un colpo d'occhio */}
          <div className="mt-5 grid grid-cols-3 gap-2" role="list" aria-label="Prezzi e offerta">
            <div role="listitem" className="cut bg-[#c8f000] p-3 text-[#0a0a0a] md:p-4">
              <BoardNumber value="35€" className="num block text-[clamp(2.6rem,12vw,4.8rem)]" />
              <p className="mt-1 text-[13px] font-bold leading-tight md:text-[15px]">Maglie attuali</p>
            </div>
            <div role="listitem" className="cut bg-[#1b1b19] p-3 text-white md:p-4">
              <BoardNumber value="40€" delay={160} className="num block text-[clamp(2.6rem,12vw,4.8rem)]" />
              <p className="mt-1 text-[13px] font-bold leading-tight text-white/80 md:text-[15px]">Maglie retro</p>
            </div>
            <div role="listitem" className="cut bg-[#1b1b19] p-3 text-white md:p-4">
              <BoardNumber value="3×2" delay={320} className="num block text-[clamp(2.6rem,12vw,4.8rem)]" />
              <p className="mt-1 text-[13px] font-bold leading-tight text-white/80 md:text-[15px]">Prendi 3, ne paghi 2</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="/shop"
              className="cut flex h-14 items-center gap-3 bg-[#c8f000] px-7 text-[20px] font-extrabold uppercase tracking-wide text-[#0a0a0a] transition-colors hover:bg-[#d8ff1a] active:bg-[#b5d800]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Scegli la maglia <ArrowRight className="h-5 w-5" strokeWidth={3} />
            </Link>
            <p className="text-[15px] font-semibold text-white/80">Spedizione gratuita · reso entro 14 giorni</p>
          </div>
        </div>

        {/* Desktop: la scansia con le maglie vere */}
        {shelf.length >= 3 && (
          <div className="hidden grid-cols-3 gap-2 lg:grid">
            {shelf.slice(0, 3).map((p, i) => (
              <div key={p.id} className={i === 1 ? "translate-y-6" : ""}>
                <Plate p={p} priority />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Telefono: la scansia scorre di lato, le maglie sono gia sulla prima schermata */}
      {shelf.length > 0 && (
        <div className="rail pb-5 lg:hidden" aria-label="Maglie in evidenza">
          {shelf.map((p, i) => (
            <div key={p.id} className="w-[42vw] max-w-[220px]">
              <Plate p={p} priority={i < 2} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
