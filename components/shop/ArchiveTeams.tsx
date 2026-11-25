"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import type { TeamSection } from "@/lib/archiveData";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

// "Per squadra" nell'archivio retro: ricerca, campionati, altri club e nazionali, ognuno col suo stemma o la sua bandiera
export default function ArchiveTeams({ sections }: { sections: TeamSection[] }) {
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const s = norm(q.trim());
    return sections.map((sec) => ({ ...sec, teams: s ? sec.teams.filter((t) => norm(t.name).includes(s)) : sec.teams })).filter((sec) => sec.teams.length > 0);
  }, [sections, q]);

  return (
    <div>
      <label className="relative mt-6 flex h-14 max-w-[520px] items-center">
        <Search className="pointer-events-none absolute left-5 h-5 w-5 text-[var(--text-3)]" />
        <span className="sr-only">Cerca una squadra</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} type="search" placeholder="Cerca una squadra o una nazionale" className="h-14 w-full rounded-full bg-[var(--wall-2)] pl-12 pr-5 text-[17px] text-white placeholder:text-[var(--text-3)] shadow-[inset_0_0_0_1px_var(--line)] focus:outline-none focus:shadow-[inset_0_0_0_2px_var(--lime)]" />
      </label>
      {!q && (
        <nav aria-label="Salta alla sezione" className="mt-4 flex flex-wrap gap-2">
          {sections.map((s) => <a key={s.id} href={`#sq-${s.id}`} className="inline-flex h-10 items-center rounded-full px-4 text-[15px] font-semibold text-[var(--text-2)] shadow-[inset_0_0_0_1px_var(--line)] hover:bg-[var(--lime)] hover:text-[#0a0a0a] hover:shadow-none">{s.label}</a>)}
        </nav>
      )}
      <div className="mt-8 space-y-9" aria-live="polite">
        {shown.length === 0 && <p className="text-[18px] italic text-[var(--text-2)]">Nessuna squadra con questo nome.</p>}
        {shown.map((sec) => (
          <section key={sec.id} id={`sq-${sec.id}`} className="scroll-mt-32">
            <h3 className="disp mb-3 text-[clamp(1.8rem,3.4vw,2.6rem)] text-white">{sec.label}</h3>
            <ul className="flex flex-wrap gap-2">
              {sec.teams.map((t) => (
                <li key={t.key}>
                  <Link href={t.href} className="flex h-14 items-center gap-2.5 rounded-full pl-2 pr-5 text-[17px] font-semibold text-white shadow-[inset_0_0_0_1.5px_rgba(244,242,234,0.35)] transition-colors hover:bg-[var(--lime)] hover:text-[#0a0a0a] hover:shadow-none">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full ${t.flag ? "" : "bg-[var(--paper)]"}`}>
                      {t.flag ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.flag} alt="" width={40} height={40} loading="lazy" className="h-full w-full object-cover" />
                      ) : t.logo ? (
                        <Image src={t.logo} alt="" width={32} height={32} className="h-[72%] w-[72%] object-contain" />
                      ) : (
                        <span className="disp text-[18px] text-[#0a0a0a]">{t.name.slice(0, 2).toUpperCase()}</span>
                      )}
                    </span>
                    {t.name} <span className="text-[14px] opacity-60">{t.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
