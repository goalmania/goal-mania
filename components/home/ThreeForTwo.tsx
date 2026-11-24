import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";
import { cld } from "@/lib/utils/cloudinary";

interface P {
  id: string;
  name: string;
  price: number;
  image: string;
}

// Il 3x2 e una regola reale, attiva al checkout: la meno cara delle tre e gratis.
// Il conto qui sotto si fa con i prezzi veri delle tre maglie che vedi.
export default function ThreeForTwo({ products }: { products: P[] }) {
  const three = products.slice(0, 3);
  if (three.length < 3) return null;
  const total = three.reduce((a, p) => a + p.price, 0);
  const free = Math.min(...three.map((p) => p.price));
  const fmt = (n: number) => String(Number.isInteger(n) ? n : n.toFixed(2).replace(".", ","));
  return (
    <section id="offerta" className="px-5 py-10 md:px-10 md:py-16 lg:px-16">
      <div className="mx-auto grid w-full max-w-[1760px] gap-10 overflow-hidden rounded-[28px] bg-[var(--wall)] p-6 shadow-[inset_0_0_0_1px_var(--line)] md:p-12 lg:grid-cols-[1fr_1.15fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-[var(--lime)] px-3.5 py-1.5 text-[14px] font-bold text-[#0a0a0a]">
            <Gift className="h-4 w-4" strokeWidth={2.6} /> Si applica al checkout
          </p>
          <h2 className="disp mt-5 text-[clamp(2.8rem,7vw,6.2rem)] text-white">
            Tre maglie,
            <br />
            ne paghi <span className="mark"><span>due.</span></span>
          </h2>
          <p className="mt-5 max-w-[38ch] text-[19px] italic leading-snug text-[var(--text-2)]">
            Ogni tre maglie nello stesso ordine, la meno cara è in regalo. Vale per le attuali e per le retro, e nel carrello vedi subito quanto risparmi.
          </p>
          <Link href="/shop" className="btn btn-lime mt-7">
            Scegli le tue tre <ArrowRight className="h-5 w-5" strokeWidth={3} />
          </Link>
        </div>

        <div>
          <ul className="grid grid-cols-3 gap-3 md:gap-5">
            {three.map((p, i) => {
              const isFree = p.price === free && three.findIndex((q) => q.price === free) === i;
              return (
                <li key={p.id} className="relative">
                  <div className="pc-stage overflow-hidden rounded-2xl" style={{ aspectRatio: "4 / 5" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cld(p.image, 360)} alt={p.name} width={360} height={450} loading="lazy" decoding="async" className="absolute inset-0 z-[1] h-full w-full object-contain p-2.5" style={{ mixBlendMode: "multiply" }} />
                    {isFree && <span className="absolute inset-x-0 bottom-0 z-[3] bg-[var(--lime)] py-1.5 text-center text-[13px] font-extrabold uppercase tracking-wide text-[#0a0a0a]">In regalo</span>}
                  </div>
                  <p className="mt-2 text-[13px] font-semibold leading-tight text-[var(--text-2)] line-clamp-1">{p.name.replace(/^Maglia\s+/i, "")}</p>
                  <p className={`pc-price mt-0.5 !text-[26px] ${isFree ? "text-[var(--lime)] line-through decoration-2" : ""}`}>{fmt(p.price)}€</p>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-dashed border-[var(--line)] pt-5">
            <p className="text-[16px] text-[var(--text-2)]">
              {three.map((p) => `${fmt(p.price)}€`).join(" + ")} = <span className="font-bold text-white">{fmt(total)}€</span>
            </p>
            <p className="text-right">
              <span className="block text-[14px] font-semibold text-[var(--text-3)]">Paghi</span>
              <span className="pc-price !text-[clamp(3rem,6vw,4.4rem)] text-[var(--lime)]">{fmt(total - free)}€</span>
              <span className="ml-2 text-[15px] font-bold text-white">risparmi {fmt(free)}€</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
