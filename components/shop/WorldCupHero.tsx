import { Trophy } from "lucide-react";
import { flagSrc } from "@/lib/nations";

// Testata dei Mondiali 2026: i colori dei tre paesi ospitanti, il 2026 gigante, le tre bandiere
export default function WorldCupHero({ count, nations, from }: { count: number; nations: number; from: number }) {
  return (
    <header className="relative isolate overflow-hidden border-b-2 border-[var(--line)] bg-[#07080d]">
      {/* Strisce nei colori di USA, Canada e Messico */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute -left-[10%] top-[-30%] h-[160%] w-[34%] -skew-x-[14deg] bg-gradient-to-b from-[#3c3b6e] via-[#3c3b6e]/70 to-transparent opacity-70" />
        <div className="absolute left-[22%] top-[-30%] h-[160%] w-[34%] -skew-x-[14deg] bg-gradient-to-b from-[#d52b1e] via-[#d52b1e]/60 to-transparent opacity-60" />
        <div className="absolute left-[54%] top-[-30%] h-[160%] w-[34%] -skew-x-[14deg] bg-gradient-to-b from-[#006847] via-[#006847]/70 to-transparent opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,transparent_30%,#07080d_85%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#07080d] to-transparent" />
      </div>
      <div className="mx-auto grid w-full max-w-[1760px] items-end gap-6 px-5 pb-8 pt-9 md:px-10 md:pb-12 md:pt-14 lg:grid-cols-[1.4fr_1fr] lg:px-16">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-[14px] font-bold text-[var(--lime)] backdrop-blur">
            <Trophy className="h-4 w-4" strokeWidth={2.6} /> Maglie delle nazionali
          </p>
          <h1 className="disp mt-3 text-white">
            <span className="block text-[clamp(1.6rem,4vw,3rem)] leading-none">Mondiali</span>
            <span className="block text-[clamp(6rem,24vw,17rem)] leading-[0.8] text-[var(--lime)] [text-shadow:0_6px_0_rgba(0,0,0,0.55)]">2026</span>
          </h1>
          <p className="mt-5 max-w-[48ch] text-[clamp(1.05rem,1.5vw,1.3rem)] italic leading-snug text-[var(--text-2)]">
            Le maglie delle nazionali, a {from}€. Scegli la bandiera della tua squadra qui sotto.
          </p>
        </div>
        <div className="flex flex-col gap-4 lg:items-end">
          <div className="flex items-center gap-3" aria-label="Paesi ospitanti: Stati Uniti, Canada, Messico">
            {["us", "ca", "mx"].map((c) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={c} src={flagSrc(c, 160)} alt="" width={96} height={64} className="h-[44px] w-[66px] rounded-md object-cover shadow-[0_8px_18px_-8px_rgba(0,0,0,0.9)] ring-1 ring-white/20 md:h-[54px] md:w-[81px]" />
            ))}
          </div>
          <ul className="flex flex-wrap gap-2 lg:justify-end">
            <li className="rounded-full bg-[var(--lime)] px-4 py-2 text-[14px] font-bold text-[#0a0a0a]">{count} maglie · {nations} nazionali</li>
            <li className="rounded-full bg-white/10 px-4 py-2 text-[14px] font-semibold text-white">USA · Canada · Messico</li>
            <li className="rounded-full bg-white/10 px-4 py-2 text-[14px] font-semibold text-white">Spedizione gratuita · 3 maglie, ne paghi 2</li>
          </ul>
        </div>
      </div>
    </header>
  );
}
