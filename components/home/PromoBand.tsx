import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Gift, Truck, History } from "lucide-react";

// Tre banner con le offerte vere del negozio: 3x2, Mystery box, spedizione gratuita sulle retro. Nessun conto alla rovescia.
export default function PromoBand() {
  return (
    <section aria-label="Offerte" className="mx-auto w-full max-w-[1760px] px-5 py-8 md:px-10 md:py-12 lg:px-16">
      <ul className="grid gap-4 lg:grid-cols-3">
        <li>
          <Link href="/shop" className="group relative flex h-full min-h-[190px] flex-col justify-between overflow-hidden rounded-[26px] bg-[var(--lime)] p-6 text-[#0a0a0a] transition-transform hover:-translate-y-1">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#0a0a0a] px-3 py-1.5 text-[13px] font-bold text-[var(--lime)]"><Gift className="h-4 w-4" strokeWidth={2.6} /> Black Friday</span>
            <span>
              <span className="disp block text-[clamp(2.4rem,4vw,3.6rem)] leading-[0.9]">Prendi 3,<br />paghi 2</span>
              <span className="mt-2 block text-[16px] font-semibold">La meno cara è in regalo. Vale per attuali e retro.</span>
            </span>
            <ArrowRight className="absolute right-5 top-5 h-7 w-7 transition-transform group-hover:translate-x-1" strokeWidth={3} />
          </Link>
        </li>
        <li>
          <Link href="/shop/mystery-box" className="group relative flex h-full min-h-[190px] flex-col justify-between overflow-hidden rounded-[26px] bg-[#16161a] p-6 text-white shadow-[inset_0_0_0_1px_var(--line)] transition-transform hover:-translate-y-1">
            <Image src="/mystery/box-current.png" alt="" width={220} height={220} className="pointer-events-none absolute -right-6 -top-4 h-[170px] w-[170px] opacity-90 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105" />
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[13px] font-bold">Maglia a sorpresa</span>
            <span>
              <span className="disp block text-[clamp(2.4rem,4vw,3.6rem)] leading-[0.9]">Mystery box<br /><span className="text-[var(--lime)]">da 35€</span></span>
              <span className="mt-2 block text-[16px] text-[var(--text-2)]">Scegli quante, la taglia e le squadre che non vuoi.</span>
            </span>
          </Link>
        </li>
        <li>
          <Link href="/archivio" className="group relative flex h-full min-h-[190px] flex-col justify-between overflow-hidden rounded-[26px] bg-[var(--paper)] p-6 text-[#0a0a0a] transition-transform hover:-translate-y-1">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#0a0a0a] px-3 py-1.5 text-[13px] font-bold text-white"><History className="h-4 w-4" strokeWidth={2.6} /> Maglie retro</span>
            <span>
              <span className="disp block text-[clamp(2.4rem,4vw,3.6rem)] leading-[0.9]">Dal 1970<br />a 40€</span>
              <span className="mt-2 flex items-center gap-2 text-[16px] font-semibold"><Truck className="h-5 w-5" strokeWidth={2.4} /> Spedizione gratuita in Italia, reso entro 14 giorni.</span>
            </span>
            <ArrowRight className="absolute right-5 top-5 h-7 w-7 transition-transform group-hover:translate-x-1" strokeWidth={3} />
          </Link>
        </li>
      </ul>
    </section>
  );
}
