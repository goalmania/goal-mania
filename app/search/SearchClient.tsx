"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { useSearchIndex, searchItems } from "@/lib/search";
import ProductGrid from "@/components/ui/ProductGrid";

interface Product { _id: string; slug?: string; title: string; images: string[]; basePrice: number; retroPrice?: number; isRetro?: boolean; category: string }
interface Article { _id: string; title: string; summary: string; image: string; category: string; createdAt: string; slug: string }

const SUGGEST = ["Inter", "Milan", "Juventus", "Napoli", "Brasile", "Italia 1990", "Maradona", "Baggio"];

export default function SearchClient({ initialProducts, initialArticles }: { initialProducts: Product[]; initialArticles: Article[]; query: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const q = params?.get("q") || "";
  const [text, setText] = useState(q);
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const index = useSearchIndex(true);
  // Le maglie si cercano nel browser, subito. Solo le notizie chiedono al server.
  const found = q ? searchItems(index, q, 200) : [];
  const loading = !!q && index.length === 0;

  useEffect(() => {
    setText(q);
    if (!q) return;
    let off = false;
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!off && d) setArticles(d.articles || []); })
      .catch(() => {});
    return () => { off = true; };
  }, [q]);

  const go = (v: string) => router.push(`/search?q=${encodeURIComponent(v.trim())}`);
  const cards = found.map((p) => ({ id: p.id, slug: p.slug, name: p.title, price: p.price, image: p.image || "/images/image.png", category: p.category }));
  const none = !!q && !loading && cards.length === 0 && articles.length === 0;

  return (
    <div>
      <PageHeader eyebrow="Cerca nel negozio" title={q ? <>Risultati per “{q}”</> : "Cerca una maglia"} lead="Scrivi una squadra, un giocatore o un anno.">
        <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) go(text); }} role="search" className="flex max-w-[640px] gap-2">
          <label className="relative flex h-14 flex-1 items-center">
            <Search className="pointer-events-none absolute left-5 h-5 w-5 text-[var(--text-3)]" />
            <input value={text} onChange={(e) => setText(e.target.value)} type="search" placeholder="Es. Milan 2006" aria-label="Cerca" className="h-14 w-full rounded-full bg-[var(--wall-2)] pl-14 pr-5 text-[18px] text-white placeholder:text-[var(--text-3)] shadow-[inset_0_0_0_1px_var(--line)] focus:outline-none focus:shadow-[inset_0_0_0_2px_var(--lime)]" />
          </label>
          <button type="submit" className="btn btn-lime !h-14">Cerca</button>
        </form>
        <ul className="mt-4 flex flex-wrap gap-2">
          {SUGGEST.map((s) => (
            <li key={s}>
              <button type="button" onClick={() => go(s)} className="inline-flex h-10 items-center rounded-full px-4 text-[15px] font-semibold text-white shadow-[inset_0_0_0_1.5px_rgba(244,242,234,0.3)] transition-colors hover:bg-[var(--lime)] hover:text-[#0a0a0a] hover:shadow-none">{s}</button>
            </li>
          ))}
        </ul>
      </PageHeader>

      <div className="mx-auto w-full max-w-[1760px] px-5 pb-16 pt-4 md:px-10 lg:px-16">
        {loading && <p className="py-10 text-[18px] italic text-[var(--text-2)]">Cerco…</p>}
        {none && (
          <div className="rounded-3xl bg-[var(--wall)] px-6 py-14 text-center shadow-[inset_0_0_0_1px_var(--line)]">
            <p className="disp text-[clamp(2rem,5vw,3.2rem)] text-white">Nessun risultato</p>
            <p className="mt-3 text-[17px] italic text-[var(--text-2)]">Prova con un&apos;altra parola, oppure sfoglia le categorie.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/shop" className="btn btn-lime">Tutte le maglie</Link>
              <Link href="/archivio" className="btn btn-ghost">Maglie retro</Link>
            </div>
          </div>
        )}
        {cards.length > 0 && (
          <section aria-label="Maglie trovate">
            <h2 className="mb-5 text-[17px] font-bold text-[var(--text-3)]">{cards.length} {cards.length === 1 ? "maglia" : "maglie"}</h2>
            <ProductGrid products={cards as any} gridCols={4} />
          </section>
        )}
        {articles.length > 0 && (
          <section aria-label="Notizie trovate" className="mt-14">
            <h2 className="disp mb-5 text-[clamp(2rem,4vw,3rem)] text-white">Notizie</h2>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => (
                <li key={a._id}>
                  <Link href={`/news/${a.slug}`} className="group block overflow-hidden rounded-[20px] bg-[var(--wall)] shadow-[inset_0_0_0_1px_var(--line)]">
                    <span className="relative block aspect-[16/10] bg-[var(--wall-2)]">
                      <Image src={a.image || "/images/image.png"} alt="" fill sizes="(max-width: 1024px) 90vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                    </span>
                    <span className="block p-4">
                      <span className="line-clamp-2 block text-[19px] font-semibold leading-tight text-white">{a.title}</span>
                      <span className="mt-2 line-clamp-2 block text-[15px] text-[var(--text-2)]">{a.summary}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
