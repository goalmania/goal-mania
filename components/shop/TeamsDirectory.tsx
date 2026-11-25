import Link from "next/link";
import Image from "next/image";
import { LEAGUES, clubHref } from "@/lib/clubs";
import type { ClubCount } from "@/lib/clubCounts";
import { flagForKey } from "@/lib/nations";

export interface NationCount {
  key: string; // nome come salvato nel catalogo (es. Brazil)
  name: string; // nome italiano
  count: number;
}

const initials = (n: string) => n.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

function Tile({ href, name, sub, children }: { href: string; name: string; sub: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center rounded-2xl bg-[var(--wall-2)] px-2 pb-3 pt-4 text-center shadow-[inset_0_0_0_1px_var(--line)] transition-all hover:-translate-y-1 hover:bg-[var(--wall-3,#202024)] hover:shadow-[inset_0_0_0_2px_var(--lime)] active:scale-[0.98]"
    >
      <span className="flex h-[68px] w-[68px] items-center justify-center overflow-hidden rounded-full bg-[var(--paper)] shadow-[0_10px_18px_-10px_rgba(0,0,0,0.9)] md:h-[76px] md:w-[76px]">{children}</span>
      <span className="mt-3 line-clamp-1 w-full text-[16px] font-bold leading-tight text-white md:text-[17px]">{name}</span>
      <span className="mt-0.5 text-[13px] font-semibold text-[var(--text-3)]">{sub}</span>
    </Link>
  );
}

// "Cerca per squadra": solo squadre che hanno davvero maglie, raggruppate nel campionato giusto, con lo stemma vero o la sigla
export default function TeamsDirectory({ clubs, nations }: { clubs: ClubCount[]; nations: NationCount[] }) {
  const groups = LEAGUES.map((l) => ({ ...l, list: clubs.filter((c) => c.league === l.id) })).filter((g) => g.list.length > 0);
  return (
    <section aria-labelledby="teams-h" className="mx-auto w-full max-w-[1760px] px-5 py-12 md:px-10 lg:px-16">
      <p className="text-[14px] font-bold text-[var(--lime)]">Tutte le squadre</p>
      <h2 id="teams-h" className="disp mt-2 text-[clamp(2.4rem,6vw,5rem)] text-white">Cerca per squadra</h2>
      <p className="mt-3 max-w-[52ch] text-[17px] italic text-[var(--text-2)]">Ogni squadra ha le sue maglie attuali e quelle retro. Scegli lo stemma.</p>

      <nav aria-label="Salta al campionato" className="mt-6 flex flex-wrap gap-2">
        {[...groups.map((g) => ({ id: g.id, label: g.label })), ...(nations.length ? [{ id: "nazionali", label: "Nazionali" }] : [])].map((g) => (
          <a key={g.id} href={`#t-${g.id}`} className="inline-flex h-11 items-center rounded-full px-5 text-[16px] font-semibold text-white shadow-[inset_0_0_0_1.5px_rgba(244,242,234,0.3)] transition-colors hover:bg-[var(--lime)] hover:text-[#0a0a0a] hover:shadow-none">{g.label}</a>
        ))}
      </nav>

      <div className="mt-8 space-y-10">
        {groups.map((g) => (
          <div key={g.id} id={`t-${g.id}`} className="scroll-mt-32">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--line)] pb-3">
              <h3 className="disp text-[clamp(1.8rem,3.4vw,2.6rem)] text-white">{g.label}</h3>
              <span className="text-[15px] italic text-[var(--text-3)]">{g.note} · {g.list.length} squadre</span>
            </div>
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9">
              {g.list.map((c) => (
                <li key={c.slug}>
                  <Tile href={clubHref(c)} name={c.name} sub={[c.current ? `${c.current} attuali` : "", c.retro ? `${c.retro} retro` : ""].filter(Boolean).join(" · ")}>
                    {c.logo ? (
                      <Image src={c.logo} alt="" width={64} height={64} className="h-[70%] w-[70%] object-contain" />
                    ) : (
                      <span className="disp text-[28px] text-[#0a0a0a]">{initials(c.name)}</span>
                    )}
                  </Tile>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {nations.length > 0 && (
          <div id="t-nazionali" className="scroll-mt-32">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--line)] pb-3">
              <h3 className="disp text-[clamp(1.8rem,3.4vw,2.6rem)] text-white">Nazionali</h3>
              <Link href="/shop/worldcup" className="text-[15px] font-bold text-[var(--lime)]">Mondiali 2026: tutte le maglie →</Link>
            </div>
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9">
              {nations.map((n) => (
                <li key={n.key}>
                  <Tile href={`/shop/worldcup/${n.key.toLowerCase().replace(/\s+/g, "-")}`} name={n.name} sub={`${n.count} ${n.count === 1 ? "maglia" : "maglie"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={flagForKey(n.key) || ""} alt="" loading="lazy" width={76} height={76} className="h-full w-full object-cover" />
                  </Tile>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
