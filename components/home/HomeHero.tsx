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

function Tile({ p, i, eager }: { p: HeroProduct; i: number; eager: boolean }) {
  return (
    <Link
      href={`/products/${p.slug || p.id}`}
      className="poster tape group block w-[168px] shrink-0 sm:w-[210px] lg:w-[250px] xl:w-[270px]"
      style={{ ["--rot" as string]: `${[-2.2, 1.6, -1, 2.4, -1.8][i % 5]}deg`, ["--tape-rot" as string]: `${[4, -5, 2, -3, 5][i % 5]}deg` }}
      aria-label={`${p.name}, ${fmt(p.price)} euro`}
      tabIndex={eager ? 0 : -1}
    >
      <span className="relative block aspect-[4/5] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cld(p.image, 400)}
          alt={p.name}
          width={400}
          height={500}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={eager && i < 3 ? "high" : "auto"}
          className="absolute inset-0 h-full w-full object-contain p-2.5 transition-transform duration-500 group-hover:scale-[1.07]"
          style={{ mixBlendMode: "multiply" }}
        />
      </span>
      <span className="flex items-center justify-between gap-2 px-2.5 pb-2.5 pt-0.5">
        <span className="line-clamp-1 text-[12px] font-semibold uppercase tracking-[0.03em] text-black/75 sm:text-[13px]">{p.name.replace(/^Maglia\s+/i, "")}</span>
        <span className="num marker-line shrink-0 text-[22px] sm:text-[26px]">{fmt(p.price)}€</span>
      </span>
    </Link>
  );
}

// Una fila che scorre: due copie in sequenza, la seconda e solo scenografia
function Row({ items, dur, reverse, eager }: { items: HeroProduct[]; dur: number; reverse?: boolean; eager?: boolean }) {
  return (
    <div className="marquee items-start gap-4 px-2 py-3 lg:gap-6" style={{ ["--dur" as string]: `${dur}s`, animationDirection: reverse ? "reverse" : "normal" }}>
      {[0, 1].map((k) => (
        <div key={k} className="flex shrink-0 gap-4 lg:gap-6" aria-hidden={k === 1 ? true : undefined}>
          {items.map((p, i) => (
            <Tile key={`${k}-${p.id}`} p={p} i={i + (reverse ? 2 : 0)} eager={k === 0 && !!eager && i < 5} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function HomeHero({ products }: { products: HeroProduct[] }) {
  const a = products.slice(0, 10);
  const b = [...products.slice(5, 12), ...products.slice(0, 3)];
  return (
    <section className="relative overflow-hidden pb-6 md:pb-12">
      <div className="mx-auto grid w-full max-w-[1760px] gap-8 px-5 pb-8 pt-8 md:px-10 md:pt-14 lg:grid-cols-12 lg:items-end lg:gap-10 lg:px-16 lg:pb-14">
        <div className="lg:col-span-8">
          <p className="rise inline-block -rotate-2 bg-[var(--lime)] px-3 py-1.5 font-[family-name:var(--font-display)] text-[19px] italic uppercase leading-none text-[#0a0a0a]">
            Black Friday · prendi 3, paghi 2
          </p>
          <h1 className="disp rise mt-5 text-[clamp(4.3rem,11.2vw,11.5rem)] leading-[0.82] text-white" style={{ animationDelay: "70ms" }}>
            Il calcio
            <br />
            si <span className="mark"><span>indossa.</span></span>
          </h1>
        </div>
        <div className="rise lg:col-span-4 lg:pb-3" style={{ animationDelay: "160ms" }}>
          <p className="max-w-[34ch] text-[clamp(1.1rem,1.5vw,1.35rem)] leading-snug text-[var(--text-2)]">
            Maglie da tifoso a <b className="text-white">35€</b>. Le retro a <b className="text-white">40€</b>. Ne prendi tre, ne paghi due. Spedizione gratuita.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/shop" className="btn btn-lime">
              Scegli la tua maglia <ArrowRight className="h-5 w-5" strokeWidth={3} />
            </Link>
            <Link href="/archivio" className="btn btn-ghost">
              Archivio retro
            </Link>
          </div>
        </div>
      </div>

      {a.length >= 5 && (
        <div className="relative -rotate-[1.2deg]" aria-label="Maglie in evidenza">
          <Row items={a} dur={90} eager />
          <div className="-mt-1 md:mt-1">
            <Row items={b.length >= 5 ? b : a} dur={110} reverse />
          </div>
          <span className="sticker spin-slow absolute right-[4%] top-[40%] z-40 hidden h-[124px] w-[124px] text-[46px] md:inline-flex" aria-hidden="true">
            35€
          </span>
        </div>
      )}
    </section>
  );
}
