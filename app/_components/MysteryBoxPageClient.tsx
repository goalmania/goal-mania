"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { Check, Gift, Minus, Plus, ShoppingBag, X } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import TrustBar from "@/components/home/TrustBar";
import { useCartStore } from "@/lib/store/cart";
import { useTrackEvent } from "@/components/analytics/AnalyticsTracker";
import MysteryWheel from "@/components/shop/MysteryWheel";

export interface MysteryBox {
  id: string;
  slug: string;
  name: string;
  image: string;
  kind: "retro" | "current";
  unit: number;
  adultSizes: string[];
  kidsSizes: string[];
}

const TEAMS = ["Inter", "Milan", "Juventus", "Napoli", "Roma", "Real Madrid", "Barcellona", "PSG", "Bayern", "Liverpool", "Manchester United", "Italia"];
const MAX_EXCLUDED = 5;
const MAX_JERSEYS = 12;
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ","));

const STEPS = [
  { t: "Scegli la box", d: "Retro a 40€ a maglia, oppure attuali a 35€." },
  { t: "Quante maglie dentro", d: "Da 1 a 12 maglie. Ogni 3, una è in regalo: la meno cara." },
  { t: "Escludi le squadre", d: "Segna fino a 5 squadre che non vuoi e non te le mettiamo." },
  { t: "Apri il pacco", d: "Spedizione gratuita in Italia, consegna in 7-10 giorni lavorativi." },
];

const FIND = [
  { t: "Retro o attuali", d: "La box retro pesca dalle maglie dal 1970 a oggi, quella attuale da quelle della stagione." },
  { t: "Niente squadre che non vuoi", d: "Le squadre che escludi restano fuori dal pacco, fino a 5." },
  { t: "La taglia giusta", d: "Scegli la taglia di ogni maglia, per adulto o per bambino." },
];

// Mystery box: scegli la box, quante maglie, la taglia di ognuna e le squadre che non vuoi.
// Il prezzo e per maglia (35€ attuali, 40€ retro) e ogni 3 maglie una e in regalo: il conto lo rifa il server al pagamento.
export default function MysteryBoxPageClient({ boxes }: { boxes: MysteryBox[] }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const trackEvent = useTrackEvent();
  const [boxId, setBoxId] = useState(boxes[0]?.id ?? "");
  const [count, setCount] = useState(3);
  const [kids, setKids] = useState(false);
  const [sizes, setSizes] = useState<string[]>([]);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [err, setErr] = useState("");

  const box = boxes.find((b) => b.id === boxId) ?? boxes[0];
  const list = box ? (kids ? box.kidsSizes : box.adultSizes) : [];
  const free = Math.floor(count / 3);
  const total = box ? (count - free) * box.unit : 0;
  const full = box ? count * box.unit : 0;
  const slots = useMemo(() => Array.from({ length: count }, (_, i) => sizes[i] ?? ""), [count, sizes]);
  const missing = slots.filter((s) => !s).length;

  if (!box) {
    return (
      <div>
        <PageHeader eyebrow="Maglia a sorpresa" title="Mystery box" lead="Le box non sono disponibili in questo momento. Le maglie del negozio si possono ordinare come sempre." />
        <TrustBar />
      </div>
    );
  }

  const setSize = (i: number, v: string) => setSizes((p) => { const n = [...p]; n[i] = v; return n; });
  const sameSize = (v: string) => setSizes(Array.from({ length: count }, () => v));
  const toggleTeam = (t: string) => setExcluded((p) => (p.includes(t) ? p.filter((x) => x !== t) : p.length >= MAX_EXCLUDED ? p : [...p, t]));
  const addCustom = () => {
    const t = custom.trim();
    if (t.length < 2 || excluded.length >= MAX_EXCLUDED || excluded.some((x) => x.toLowerCase() === t.toLowerCase())) return setCustom("");
    setExcluded((p) => [...p, t]);
    setCustom("");
  };

  // Una riga di carrello per ogni taglia, con la quantita di maglie di quella taglia
  function addToCart(): boolean {
    if (missing > 0) {
      setErr(missing === 1 ? "Scegli la taglia della maglia che manca." : `Scegli la taglia delle ${missing} maglie che mancano.`);
      return false;
    }
    setErr("");
    const bySize = new Map<string, number>();
    slots.forEach((s) => bySize.set(s, (bySize.get(s) || 0) + 1));
    bySize.forEach((qty, size) => {
      const custom = { name: "", number: "", selectedPatches: [], includeShorts: false, includeSocks: false, hasLongSleeve: false, isPlayerEdition: false, size, isKidSize: kids, hasCustomization: false, excludedShirts: excluded };
      const hash = JSON.stringify(custom).split("").reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
      addItem({ id: `${box.id}_${hash}`, slug: box.slug, name: box.name, price: box.unit, image: box.image, category: "Mystery Box", customization: custom, quantity: qty });
    });
    trackEvent("add_to_cart", { productId: box.id, productSlug: box.slug, value: box.unit * count });
    toast.success(count === 1 ? "Box aggiunta al carrello" : `${count} maglie a sorpresa nel carrello`);
    return true;
  }

  return (
    <div>
      <section className="hero-pitch relative overflow-hidden">
        <div className="relative z-10 mx-auto grid w-full max-w-[1760px] items-center gap-10 px-5 pb-10 pt-9 md:px-10 md:pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-16 lg:pb-16">
          <div>
            <p className="text-[14px] font-bold text-[var(--lime)]">Maglia a sorpresa</p>
            <h1 className="disp mt-2 text-[clamp(3.4rem,9vw,8rem)] leading-[0.86] text-white">Mystery <span className="mark"><span>box</span></span></h1>
            <p className="mt-5 max-w-[44ch] text-[clamp(1.1rem,1.5vw,1.35rem)] italic leading-snug text-[var(--text-2)]">Non sai quale maglia ti arriva, ma decidi tutto il resto: quante, che taglia e quali squadre non vuoi.</p>
            <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[17px] font-semibold text-white"><span>35€ le attuali</span><span>40€ le retro</span><span className="text-[var(--lime)]">Ogni 3, una in regalo</span></p>
            <a href="#box" className="btn btn-lime mt-7">Prepara la tua box</a>
          </div>
          <MysteryWheel excluded={excluded} onExclude={(t) => setExcluded((p) => (p.includes(t) || p.length >= MAX_EXCLUDED ? p : [...p, t]))} />
        </div>
      </section>

      <section aria-label="Come funziona" className="mx-auto grid w-full max-w-[1760px] gap-4 px-5 pb-12 md:grid-cols-2 md:px-10 lg:grid-cols-4 lg:px-16">
        {STEPS.map((s, i) => (
          <div key={s.t} className="rounded-3xl bg-[var(--wall)] p-5 shadow-[inset_0_0_0_1px_var(--line)]">
            <span className="pc-price text-[var(--lime)]">{i + 1}</span>
            <p className="mt-1 text-[20px] font-bold text-white">{s.t}</p>
            <p className="mt-1 text-[16px] italic leading-snug text-[var(--text-2)]">{s.d}</p>
          </div>
        ))}
      </section>

      <section id="box" aria-label="Prepara la tua box" className="mx-auto grid w-full max-w-[1760px] scroll-mt-32 gap-8 px-5 pb-14 md:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-16">
        {/* Sinistra: la scelta della box */}
        <div className="lg:sticky lg:top-[calc(var(--bar-h)+var(--head-h)+16px)] lg:self-start">
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Tipo di box">
            {boxes.map((b) => (
              <button key={b.id} type="button" role="radio" aria-checked={b.id === boxId} onClick={() => { setBoxId(b.id); setSizes([]); }} className={`group overflow-hidden rounded-3xl text-left transition-all ${b.id === boxId ? "shadow-[0_0_0_3px_var(--lime)]" : "opacity-70 shadow-[inset_0_0_0_1px_var(--line)] hover:opacity-100"}`}>
                <span className="relative block aspect-[4/5] bg-[var(--wall-2)]">
                  <Image src={b.image} alt={b.name} fill unoptimized sizes="(max-width: 1024px) 45vw, 22vw" className="object-cover" />
                  {b.id === boxId && <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--lime)] text-[#0a0a0a]"><Check className="h-5 w-5" strokeWidth={3} /></span>}
                </span>
                <span className="block bg-[var(--wall)] p-3">
                  <span className="block text-[18px] font-bold text-white">{b.kind === "retro" ? "Maglie retro" : "Maglie attuali"}</span>
                  <span className="text-[15px] font-semibold text-[var(--lime)]">{fmt(b.unit)}€ a maglia</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Destra: il configuratore */}
        <div className="space-y-8">
          <div>
            <h2 className="disp text-[clamp(1.8rem,3.4vw,2.8rem)] text-white">Quante maglie?</h2>
            <div className="mt-4 flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-2 rounded-full bg-[var(--wall)] p-1.5 shadow-[inset_0_0_0_1px_var(--line)]">
                <button type="button" aria-label="Una in meno" onClick={() => setCount((c) => Math.max(1, c - 1))} className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--wall-2)] text-white transition-colors hover:bg-[var(--lime)] hover:text-[#0a0a0a]"><Minus className="h-5 w-5" strokeWidth={3} /></button>
                <span className="pc-price w-14 text-center !text-[40px]" aria-live="polite">{count}</span>
                <button type="button" aria-label="Una in più" onClick={() => setCount((c) => Math.min(MAX_JERSEYS, c + 1))} className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--lime)] text-[#0a0a0a] transition-transform active:scale-95"><Plus className="h-5 w-5" strokeWidth={3} /></button>
              </div>
              <p className="max-w-[34ch] text-[16px] italic leading-snug text-[var(--text-2)]">Ogni 3 maglie, una è in regalo: la meno cara delle tre.</p>
            </div>
            {/* Le maglie nella box: ogni terza e in regalo */}
            <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${count} maglie a sorpresa`}>
              {Array.from({ length: count }).map((_, i) => {
                const gift = (i + 1) % 3 === 0;
                return (
                  <li key={i} className={`relative flex h-[72px] w-[58px] items-center justify-center rounded-2xl text-[34px] font-black ${gift ? "bg-[var(--lime)] text-[#0a0a0a]" : "bg-[var(--wall-2)] text-white shadow-[inset_0_0_0_1px_var(--line)]"}`}>
                    ?
                    {gift && <span className="absolute -bottom-2 rounded-full bg-[#0a0a0a] px-2 py-0.5 text-[11px] font-bold text-[var(--lime)]"><Gift className="mr-1 inline h-3 w-3" />in regalo</span>}
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="disp text-[clamp(1.8rem,3.4vw,2.8rem)] text-white">Le taglie</h2>
              {box.kidsSizes.length > 0 && (
                <div className="flex gap-1 rounded-full bg-[var(--wall)] p-1 shadow-[inset_0_0_0_1px_var(--line)]" role="group" aria-label="Adulto o bambino">
                  {[["Adulto", false], ["Bambino", true]].map(([l, v]) => (
                    <button key={String(l)} type="button" aria-pressed={kids === v} onClick={() => { setKids(v as boolean); setSizes([]); }} className="h-10 rounded-full px-4 text-[15px] font-semibold text-white aria-pressed:bg-[var(--lime)] aria-pressed:text-[#0a0a0a]">{l as string}</button>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-2 text-[15px] text-[var(--text-3)]">Stessa taglia per tutte:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {list.map((s) => (
                <button key={s} type="button" onClick={() => sameSize(s)} className="h-11 min-w-[52px] rounded-full px-4 text-[16px] font-bold text-white shadow-[inset_0_0_0_1.5px_rgba(244,242,234,0.3)] transition-colors hover:bg-[var(--lime)] hover:text-[#0a0a0a] hover:shadow-none">{s}</button>
              ))}
            </div>
            {count > 1 && (
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {slots.map((v, i) => (
                  <label key={i} className="flex items-center justify-between gap-2 rounded-2xl bg-[var(--wall)] px-3 py-2 text-[15px] font-semibold text-[var(--text-2)] shadow-[inset_0_0_0_1px_var(--line)]">
                    Maglia {i + 1}
                    <select value={v} onChange={(e) => setSize(i, e.target.value)} aria-label={`Taglia della maglia ${i + 1}`} className="h-10 rounded-xl bg-[var(--wall-2)] px-2 text-[16px] font-bold text-white">
                      <option value="">—</option>
                      {list.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="disp text-[clamp(1.8rem,3.4vw,2.8rem)] text-white">Cosa non vuoi</h2>
            <p className="mt-2 text-[16px] italic text-[var(--text-2)]">Fino a {MAX_EXCLUDED} squadre da escludere ({excluded.length}/{MAX_EXCLUDED}). Facoltativo.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TEAMS.map((t) => (
                <button key={t} type="button" aria-pressed={excluded.includes(t)} onClick={() => toggleTeam(t)} disabled={!excluded.includes(t) && excluded.length >= MAX_EXCLUDED} className="inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-[16px] font-semibold text-white shadow-[inset_0_0_0_1.5px_rgba(244,242,234,0.3)] transition-colors aria-pressed:bg-[var(--red)] aria-pressed:text-white aria-pressed:shadow-none disabled:opacity-40">
                  {excluded.includes(t) && <X className="h-4 w-4" strokeWidth={3} />}{t}
                </button>
              ))}
              {excluded.filter((t) => !TEAMS.includes(t)).map((t) => (
                <button key={t} type="button" onClick={() => toggleTeam(t)} className="inline-flex h-11 items-center gap-1.5 rounded-full bg-[var(--red)] px-4 text-[16px] font-semibold text-white"><X className="h-4 w-4" strokeWidth={3} />{t}</button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); addCustom(); }} className="mt-3 flex max-w-[420px] gap-2">
              <input value={custom} onChange={(e) => setCustom(e.target.value)} maxLength={30} placeholder="Un'altra squadra o un colore" aria-label="Altra squadra da escludere" className="h-12 min-w-0 flex-1 rounded-full bg-[var(--wall-2)] px-5 text-[16px] text-white placeholder:text-[var(--text-3)] shadow-[inset_0_0_0_1px_var(--line)] focus:outline-none focus:shadow-[inset_0_0_0_2px_var(--lime)]" />
              <button type="submit" className="btn btn-glass !h-12 !px-5 !text-[17px]">Aggiungi</button>
            </form>
          </div>

          {/* Il conto */}
          <div className="rounded-3xl bg-[var(--wall)] p-5 shadow-[inset_0_0_0_1px_var(--line)] md:p-6" aria-live="polite">
            <dl className="space-y-2 text-[17px]">
              <div className="flex justify-between text-[var(--text-2)]"><dt>{count} {count === 1 ? "maglia" : "maglie"} × {fmt(box.unit)}€</dt><dd>{fmt(full)}€</dd></div>
              {free > 0 && <div className="flex justify-between font-semibold text-[var(--lime)]"><dt>{free === 1 ? "1 maglia in regalo (3x2)" : `${free} maglie in regalo (3x2)`}</dt><dd>−{fmt(free * box.unit)}€</dd></div>}
              <div className="flex justify-between text-[var(--text-2)]"><dt>Spedizione</dt><dd>gratuita</dd></div>
            </dl>
            <div className="mt-4 flex items-end justify-between border-t border-dashed border-[var(--line)] pt-4">
              <span className="text-[15px] font-semibold text-[var(--text-3)]">Paghi</span>
              <span className="pc-price !text-[clamp(3rem,6vw,4.4rem)] text-[var(--lime)]">{fmt(total)}€</span>
            </div>
            {err && <p role="alert" className="mt-3 text-[16px] font-semibold text-[var(--red)]">{err}</p>}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => addToCart()} className="btn btn-glass flex-1"><ShoppingBag className="h-5 w-5" /> Aggiungi al carrello</button>
              <button type="button" onClick={() => addToCart() && router.push("/checkout")} className="btn btn-lime flex-1">Compra subito</button>
            </div>
            <p className="mt-3 text-[14px] italic text-[var(--text-3)]">Il totale definitivo si calcola al pagamento, con le stesse regole del resto del negozio.</p>
          </div>
        </div>
      </section>

      <section aria-label="Cosa puoi trovare" className="mx-auto w-full max-w-[1760px] px-5 pb-14 md:px-10 lg:px-16">
        <h2 className="disp text-[clamp(2.2rem,5vw,4rem)] text-white">Cosa trovi nel pacco</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {FIND.map((f) => (
            <div key={f.t} className="rounded-3xl bg-[var(--wall)] p-6 shadow-[inset_0_0_0_1px_var(--line)]">
              <p className="text-[22px] font-bold text-white">{f.t}</p>
              <p className="mt-2 text-[17px] italic leading-snug text-[var(--text-2)]">{f.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-[60ch] text-[17px] leading-relaxed text-[var(--text-2)]">Ogni maglia viene scelta a caso dal catalogo, nella categoria che hai scelto e senza le squadre che hai escluso.</p>
      </section>
      <TrustBar />
    </div>
  );
}
