import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cld } from "@/lib/utils/cloudinary";
import AutoRail from "@/components/ui/AutoRail";
import { isShowable } from "@/lib/photoFix";

interface HeroProduct {
  id: string;
  slug?: string;
  name: string;
  price: number;
  image: string;
}

const fmt = (n: number) => (Number.isInteger(Number(n)) ? String(Number(n)) : Number(n).toFixed(2).replace(".", ","));

function Tile({ p, eager }: { p: HeroProduct; eager: boolean }) {
  return (
    <Link
      href={`/products/${p.slug || p.id}`}
      className="pc group block w-full shrink-0"
      aria-label={`${p.name}, ${fmt(p.price)} euro`}
      tabIndex={eager ? 0 : -1}
    >
      <span className="pc-stage" style={{ aspectRatio: "1 / 1" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cld(p.image, 380)}
          alt={p.name}
          width={380}
          height={380}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={eager ? "high" : "auto"}
          className="absolute inset-0 z-[1] h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.06]"
          style={{ mixBlendMode: "multiply" }}
        />
      </span>
      <span className="flex items-center justify-between gap-2 px-3 py-2.5">
        <span className="line-clamp-1 text-[13px] font-semibold text-[var(--text-2)]">{p.name.replace(/^Maglia\s+/i, "")}</span>
        <span className="pc-price shrink-0 !text-[22px]">{fmt(p.price)}€</span>
      </span>
    </Link>
  );
}

// Una fila orizzontale: scorre da sola e a mano
function Row({ items, reverse, speed, eager }: { items: HeroProduct[]; reverse?: boolean; speed: number; eager?: boolean }) {
  return (
    <AutoRail className="rail-tight" label="Maglie in evidenza" reverse={reverse} speed={speed}>
      {items.map((p, i) => (
        <div key={p.id} className="w-[44vw] max-w-[220px] shrink-0 sm:w-[190px] xl:w-[210px]">
          <Tile p={p} eager={!!eager && i < 3} />
        </div>
      ))}
    </AutoRail>
  );
}

export default function HomeHero({ products: all }: { products: HeroProduct[] }) {
  const products = all.filter((p) => isShowable(p.id, p.image));
  const a = products.filter((_, i) => i % 2 === 0);
  const b = products.filter((_, i) => i % 2 === 1);
  const ok = products.length >= 6;
  return (
    <section className="hero-pitch relative overflow-hidden">
      <div className="mx-auto grid w-full max-w-[1760px] items-center gap-8 px-5 pb-10 pt-8 md:px-10 md:pt-12 lg:min-h-[min(82svh,760px)] lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:px-16 lg:pb-14">
        <div className="relative z-10">
          <Link href="/black-friday" className="rise inline-flex items-center gap-2 rounded-full bg-[var(--lime)] px-4 py-2 text-[14px] font-bold text-[#0a0a0a] transition-transform hover:-translate-y-0.5">
            <span className="h-2 w-2 rounded-full bg-[#0a0a0a]" aria-hidden="true" />
            Black Friday: prendi 3, paghi 2
            <ArrowRight className="h-4 w-4" strokeWidth={3} />
          </Link>
          <h1 className="disp rise mt-5 text-[clamp(3.6rem,8.6vw,8.6rem)] leading-[0.84] text-white" style={{ animationDelay: "70ms" }}>
            Il calcio
            <br />
            si <span className="mark"><span>indossa.</span></span>
          </h1>
          <p className="rise mt-6 max-w-[40ch] text-[clamp(1.1rem,1.5vw,1.35rem)] italic leading-snug text-[var(--text-2)]" style={{ animationDelay: "150ms" }}>
            Maglie versione tifoso a <b className="not-italic text-white">35€</b>, le retro a <b className="not-italic text-white">40€</b>. Ogni tre maglie, la meno cara è in regalo.
          </p>
          <div className="rise mt-7 flex flex-wrap gap-3" style={{ animationDelay: "220ms" }}>
            <Link href="/shop" className="btn btn-lime">
              Scegli la tua maglia <ArrowRight className="h-5 w-5" strokeWidth={3} />
            </Link>
            <Link href="/archivio" className="btn btn-ghost">
              Vedi le maglie retro
            </Link>
          </div>
          <ul className="rise mt-8 flex flex-wrap gap-x-7 gap-y-2 text-[15px] font-semibold text-[var(--text-2)]" style={{ animationDelay: "280ms" }}>
            {["Spedizione gratuita in Italia", "Consegna in 7-10 giorni lavorativi", "Reso entro 14 giorni"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--lime)]" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {ok && (
          <div className="relative min-w-0 space-y-4" aria-label="Maglie in evidenza">
            <Row items={a} speed={34} eager />
            <Row items={b} speed={30} reverse />
          </div>
        )}
      </div>
    </section>
  );
}
