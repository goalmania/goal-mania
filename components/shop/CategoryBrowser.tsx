"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import ProductGrid from "@/components/ui/ProductGrid";
import TrustBar from "@/components/home/TrustBar";
import { logoFor } from "@/lib/teamLogos";

export interface CatProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  slug?: string;
  team?: string;
  [key: string]: any;
}

type Kind = "tutte" | "attuali" | "retro" | "tute" | "combo";
const KIND_LABEL: Record<Kind, string> = { tutte: "Tutte", attuali: "Maglie attuali", retro: "Retro", tute: "Tute e felpe", combo: "Combo e kit" };

function kindsOf(p: CatProduct): Kind[] {
  const name = (p.name ?? "").toLowerCase();
  const cat = (p.category ?? "").toLowerCase();
  const k: Kind[] = ["tutte"];
  if (cat.includes("retro") || /\b(19[0-9]\d|200[0-9]|201[0-9])\b/.test(name)) k.push("retro");
  if (/tuta|tute|felpa|giacca|tracksuit|hoodie|sweat/.test(name)) k.push("tute");
  if (/combo|\bkit\b|pack|\bset\b|bundle/.test(name)) k.push("combo");
  if (k.length === 1) k.push("attuali");
  return k;
}

// "Maglia Inter Third 26/27" -> "Inter"
function teamName(name: string) {
  const t = name.replace(/^Maglia\s+/i, "");
  return t.split(/\s+(?:Home|Away|Third|Fourth|Retro|Long|Player|Portiere|Training|19\d\d|20\d\d|\d{2}\/\d{2})/i)[0].trim();
}

const SIBLINGS = [
  { href: "/shop/2026/27", label: "Novità 26/27" },
  { href: "/shop/serieA", label: "Serie A" },
  { href: "/shop/premier-league", label: "Premier League" },
  { href: "/shop/worldcup", label: "Mondiali 2026" },
  { href: "/shop/international", label: "Internazionali" },
  { href: "/archivio", label: "Maglie retro" },
  { href: "/shop/mystery-box", label: "Mystery box" },
];

type Sort = "top" | "low" | "high";

// Il corpo di tutte le pagine categoria: titolo, filtri, maglie, e in fondo cosa fare dopo.
export default function CategoryBrowser({
  products,
  title,
  eyebrow = "Maglie da calcio",
  lead = "Maglie a 35€, spedizione gratuita e reso entro 14 giorni.",
  logo,
  here,
  accent,
  children,
  hero,
  teamKey,
  teamIcon,
  teamsWrap = false,
  teamLimit = 18,
}: {
  products: CatProduct[];
  title: string;
  eyebrow?: string;
  lead?: string;
  logo?: string | null;
  here?: string;
  accent?: string;
  children?: React.ReactNode;
  /** Intestazione propria al posto di quella standard (es. Mondiali) */
  hero?: React.ReactNode;
  /** Come si ricava la squadra dal titolo (default: il nome dopo "Maglia") */
  teamKey?: (name: string) => string;
  /** Bandiera/stemma da mostrare nel filtro squadra, se diverso dagli stemmi dei club */
  teamIcon?: (team: string) => string | null;
  /** Le squadre in una griglia visibile (tutte insieme) invece di una riga che scorre */
  teamsWrap?: boolean;
  teamLimit?: number;
}) {
  const tn = teamKey ?? teamName;
  const [kind, setKind] = useState<Kind>("tutte");
  const [team, setTeam] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("top");

  const kinds = useMemo(() => (["tutte", "attuali", "retro", "tute", "combo"] as Kind[]).map((k) => ({ k, n: k === "tutte" ? products.length : products.filter((p) => kindsOf(p).includes(k)).length })).filter((x) => x.n > 0), [products]);
  const teams = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products) {
      const t = tn(p.name);
      if (t) m.set(t, (m.get(t) || 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, teamLimit);
  }, [products, tn, teamLimit]);

  const list = useMemo(() => {
    let l = products;
    if (kind !== "tutte") l = l.filter((p) => kindsOf(p).includes(kind));
    if (team) l = l.filter((p) => tn(p.name) === team);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      l = l.filter((p) => p.name.toLowerCase().includes(s));
    }
    if (sort === "low") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "high") l = [...l].sort((a, b) => b.price - a.price);
    return l;
  }, [products, kind, team, q, sort, tn]);

  const from = products.length ? Math.min(...products.map((p) => p.price || 0).filter(Boolean)) : 35;
  const chip = "inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[15px] font-semibold shadow-[inset_0_0_0_1.5px_rgba(244,242,234,0.3)] transition-colors aria-pressed:bg-[var(--lime)] aria-pressed:text-[#0a0a0a] aria-pressed:shadow-none";

  const teamChip = (t: string, n: number) => {
    const icon = teamIcon ? teamIcon(t) : null;
    const lg = icon || logoFor(t);
    return (
      <button key={t} type="button" aria-pressed={team === t} onClick={() => setTeam(team === t ? "" : t)} className={`${chip} ${lg ? "!pl-1.5" : ""}`} title={t}>
        {lg && (
          <span className={`flex h-8 w-8 items-center justify-center overflow-hidden rounded-full ${icon ? "" : "bg-[var(--paper)]"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {icon ? <img src={icon} alt="" width={32} height={32} loading="lazy" className="h-full w-full object-cover" /> : <Image src={lg} alt="" width={24} height={24} className="h-6 w-6 object-contain" />}
          </span>
        )}
        {t} <span className="text-[13px] opacity-60">{n}</span>
      </button>
    );
  };
  const teamRow = (
    <div className={teamsWrap ? "flex flex-wrap gap-2" : "flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none]"} role="group" aria-label="Squadra">
      <button type="button" aria-pressed={team === ""} onClick={() => setTeam("")} className={chip}>Tutte le squadre</button>
      {teams.map(([t, n]) => teamChip(t, n))}
    </div>
  );

  // Elenco strutturato per Google e per i motori di risposta: le prime maglie della pagina, con indirizzo e prezzo
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: typeof title === "string" ? title : "Maglie da calcio",
    numberOfItems: products.length,
    itemListElement: products.slice(0, 12).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://goal-mania.it/products/${p.slug || p.id}`,
      name: p.name,
    })),
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      {hero ?? <PageHeader
        eyebrow={eyebrow}
        title={
          logo ? (
            <span className="flex items-center gap-4 md:gap-6">
              <span className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full bg-[var(--paper)] shadow-[0_14px_24px_-12px_rgba(0,0,0,0.8)] md:h-[120px] md:w-[120px]">
                <Image src={logo} alt="" width={96} height={96} className="h-[52px] w-[52px] object-contain md:h-[84px] md:w-[84px]" priority />
              </span>
              <span>{title}</span>
            </span>
          ) : (
            title
          )
        }
        lead={lead}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-[var(--lime)] px-4 py-2 text-[14px] font-bold text-[#0a0a0a]">{products.length} maglie · da {from}€</span>
          <span className="text-[15px] font-semibold text-[var(--text-2)]">Spedizione gratuita · Reso entro 14 giorni · 3 maglie, ne paghi 2</span>
        </div>
      </PageHeader>}

      {teamsWrap && teams.length > 1 && (
        <section aria-label="Scegli la squadra" className="mx-auto w-full max-w-[1760px] px-5 pb-6 md:px-10 lg:px-16">{teamRow}</section>
      )}

      {/* Filtri: restano sotto l'header mentre scorri */}
      <div className="sticky top-[calc(var(--bar-h)+var(--head-h))] z-20 border-y border-[var(--line)] bg-[rgba(10,10,11,0.94)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1760px] flex-col gap-3 px-5 py-3 md:px-10 lg:px-16">
          <div className="flex flex-wrap items-center gap-3">
            <label className="relative flex h-11 min-w-0 flex-1 items-center md:max-w-[340px]">
              <Search className="pointer-events-none absolute left-4 h-4 w-4 text-[var(--text-3)]" />
              <input value={q} onChange={(e) => setQ(e.target.value)} type="search" placeholder="Cerca una squadra o un anno" aria-label="Cerca in questa pagina" className="h-11 w-full rounded-full bg-[var(--wall-2)] pl-11 pr-4 text-[16px] text-white placeholder:text-[var(--text-3)] shadow-[inset_0_0_0_1px_var(--line)] focus:outline-none focus:shadow-[inset_0_0_0_2px_var(--lime)]" />
            </label>
            {kinds.length > 2 && (
              <div className="order-last flex w-full gap-2 overflow-x-auto [scrollbar-width:none] md:order-none md:w-auto" role="group" aria-label="Tipo di maglia">
                {kinds.map(({ k, n }) => (
                  <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)} className={chip}>
                    {KIND_LABEL[k]} <span className="text-[13px] opacity-60">{n}</span>
                  </button>
                ))}
              </div>
            )}
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Ordina" className="ml-auto h-11 max-w-[46%] shrink-0 rounded-full bg-[var(--wall-2)] px-3 text-[15px] font-semibold text-white shadow-[inset_0_0_0_1px_var(--line)]">
              <option value="top">In evidenza</option>
              <option value="low">Prezzo: dal più basso</option>
              <option value="high">Prezzo: dal più alto</option>
            </select>
          </div>
          {!teamsWrap && teams.length > 5 && teamRow}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1760px] px-5 py-8 md:px-10 lg:px-16">
        <p className="mb-5 text-[15px] font-semibold text-[var(--text-3)]" aria-live="polite">{list.length} {list.length === 1 ? "maglia" : "maglie"}</p>
        {list.length === 0 ? (
          <div className="rounded-3xl bg-[var(--wall)] px-6 py-16 text-center shadow-[inset_0_0_0_1px_var(--line)]">
            <p className="disp text-[clamp(2rem,5vw,3.4rem)] text-white">Nessuna maglia trovata</p>
            <p className="mt-3 text-[17px] italic text-[var(--text-2)]">Prova con un&apos;altra squadra o togli i filtri.</p>
            <button type="button" onClick={() => { setKind("tutte"); setTeam(""); setQ(""); }} className="btn btn-lime mt-6">Togli i filtri</button>
          </div>
        ) : (
          <ProductGrid products={list as any} gridCols={4} />
        )}
      </div>

      {/* Cosa fare dopo: il 3x2 e le altre porte del negozio */}
      <section className="mx-auto w-full max-w-[1760px] px-5 pb-10 md:px-10 lg:px-16">
        <Link href="/shop" className="group flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[var(--lime)] px-6 py-5 text-[#0a0a0a] md:px-8">
          <span className="disp text-[clamp(1.8rem,4vw,3rem)]">Tre maglie, ne paghi due</span>
          <span className="text-[17px] font-semibold italic">Ogni tre maglie, la meno cara è in regalo →</span>
        </Link>
        <p className="mb-3 mt-10 text-[15px] font-bold text-[var(--text-3)]">Guarda anche</p>
        <ul className="flex flex-wrap gap-2">
          {SIBLINGS.filter((s) => s.href !== here).map((s) => (
            <li key={s.href}>
              <Link href={s.href} className="inline-flex h-11 items-center rounded-full px-5 text-[16px] font-semibold text-white shadow-[inset_0_0_0_1.5px_rgba(244,242,234,0.3)] transition-colors hover:bg-[var(--lime)] hover:text-[#0a0a0a] hover:shadow-none">
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      {children}
      <TrustBar />
    </div>
  );
}
