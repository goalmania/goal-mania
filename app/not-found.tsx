import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";

export default function NotFound() {
  return (
    <div>
      <PageHeader eyebrow="Errore 404" title={<>Fuori <span className="mark"><span>gioco.</span></span></>} lead="Questa pagina non esiste più o l'indirizzo è sbagliato. Da qui riparti dalle maglie.">
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="btn btn-lime">Torna alla home <ArrowRight className="h-5 w-5" strokeWidth={3} /></Link>
          <Link href="/shop" className="btn btn-ghost">Tutte le maglie</Link>
        </div>
      </PageHeader>
      <ul className="mx-auto flex w-full max-w-[1760px] flex-wrap gap-2 px-5 pb-20 md:px-10 lg:px-16">
        {[["Novità 26/27", "/shop/2026/27"], ["Serie A", "/shop/serieA"], ["Premier League", "/shop/premier-league"], ["Mondiali 2026", "/shop/worldcup"], ["Maglie retro", "/archivio"], ["Cerca", "/search"]].map(([l, h]) => (
          <li key={h}>
            <Link href={h} className="inline-flex h-12 items-center rounded-full px-5 text-[17px] font-semibold text-white shadow-[inset_0_0_0_1.5px_rgba(244,242,234,0.3)] transition-colors hover:bg-[var(--lime)] hover:text-[#0a0a0a] hover:shadow-none">{l}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
