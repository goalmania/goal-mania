"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { PATCH_GROUPS, patchById } from "@/lib/patches";

export interface PatchLite { _id: string; category: string; price: number }
export interface Cust {
  name: string;
  number: string;
  includeShorts: boolean;
  includeSocks: boolean;
  selectedPatches: any[];
  isPlayerEdition: boolean;
  [k: string]: any;
}

const COMP_LABEL: Record<string, string> = {
  "champions-league": "Champions League", "europa-league": "Europa League", "conference-league": "Conference League", "serie-a": "Serie A",
  "coppa-italia": "Coppa Italia", "premier-league": "Premier League", "fa-cup": "FA Cup", other: "Altra competizione",
};

// Il retro della maglia come verra stampata: nome sopra, numero grande sotto
function BackPreview({ name, number }: { name: string; number: string }) {
  const n = name || "NOME";
  const num = number || "10";
  return (
    <svg viewBox="0 0 240 260" className="mx-auto w-full max-w-[260px]" role="img" aria-label={`Anteprima: ${n} ${num}`}>
      <path d="M70 14 L20 44 L4 100 L46 116 L46 246 L194 246 L194 116 L236 100 L220 44 L170 14 C160 34 80 34 70 14 Z" fill="#e9e6dc" stroke="#cfcabb" strokeWidth="2" />
      <path d="M70 14 C80 34 160 34 170 14" fill="none" stroke="#cfcabb" strokeWidth="3" />
      <text x="120" y="88" textAnchor="middle" fontFamily="var(--font-anton), Impact, sans-serif" fontSize="25" fill="#0a0a0a" textLength={Math.min(150, Math.max(40, n.length * 17))} lengthAdjust="spacingAndGlyphs">{n}</text>
      <text x="120" y="184" textAnchor="middle" fontFamily="var(--font-anton), Impact, sans-serif" fontSize="104" fill="#0a0a0a">{num}</text>
    </svg>
  );
}

const chip = (on: boolean) => `flex items-center justify-between gap-2 rounded-2xl px-4 py-3 text-left text-[16px] font-semibold transition-all active:scale-[0.98] ${on ? "bg-[var(--lime)] text-[#0a0a0a]" : "bg-[var(--wall-2)] text-white shadow-[inset_0_0_0_1px_var(--line)] hover:bg-white/10"}`;
const input = "h-14 w-full rounded-2xl bg-[var(--wall-2)] px-4 text-[18px] font-bold text-white placeholder:text-[var(--text-3)] shadow-[inset_0_0_0_1px_var(--line)] focus:outline-none focus:shadow-[inset_0_0_0_2px_var(--lime)]";

// Personalizzazione sempre visibile: anteprima, nome e numero, patch, kit. Ogni extra dice quanto costa.
export default function PdpCustomize({
  c, set, canName, canNumber, patches, suggested = [], hasShorts, hasSocks, prices, toggle,
}: {
  c: Cust;
  set: (f: (p: any) => any) => void;
  canName: boolean;
  canNumber: boolean;
  patches: any[];
  suggested?: string[];
  hasShorts: boolean;
  hasSocks: boolean;
  prices: { player_edition: number; shorts: number; socks: number };
  toggle: (p: any) => void;
}) {
  const extras =
    (c.isPlayerEdition ? prices.player_edition : 0) + (c.includeShorts ? prices.shorts : 0) + (c.includeSocks ? prices.socks : 0) + c.selectedPatches.reduce((s: number, p: any) => s + (p.price || 0), 0);
  const printed = !!(c.name || c.number);
  // Su telefono la personalizzazione e chiusa: la strada verso l'acquisto resta corta. Su computer e aperta.
  const [open, setOpen] = useState(false);
  useEffect(() => { if (window.matchMedia("(min-width: 1024px)").matches) setOpen(true); }, []);
  const chosen = printed || extras > 0;
  return (
    <section aria-labelledby="pz-h" className="rounded-3xl bg-[var(--wall)] p-5 shadow-[inset_0_0_0_1px_var(--line)] md:p-6">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between gap-3 text-left lg:pointer-events-none">
        <span>
          <span id="pz-h" className="disp block text-[clamp(1.7rem,3vw,2.3rem)] text-white">Personalizza la maglia</span>
          <span className="mt-0.5 block text-[15px] font-semibold text-[var(--text-3)]">{chosen ? `Scelto${extras > 0 ? `: +${extras.toFixed(0)}€` : ""}${printed ? " · nome e numero" : ""}` : "Nome, numero e patch (facoltativo)"}</span>
        </span>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--wall-2)] text-white lg:hidden"><ChevronDown className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`} /></span>
      </button>

      <div className={`mt-5 grid gap-6 md:grid-cols-[220px_1fr] ${open ? "" : "hidden"}`}>
        {(canName || canNumber) && (
          <div className="rounded-2xl bg-[var(--wall-2)] p-4 md:self-start">
            <BackPreview name={c.name} number={c.number} />
            <p className="mt-2 text-center text-[14px] font-semibold text-[var(--text-2)]">Così sarà il retro</p>
          </div>
        )}
        <div className="space-y-5">
          {(canName || canNumber) && (
            <div className="grid grid-cols-[1fr_96px] gap-3">
              {canName && (
                <label className="block">
                  <span className="mb-1.5 block text-[15px] font-bold text-white">Nome</span>
                  <input value={c.name} onChange={(e) => set((p) => ({ ...p, name: e.target.value.toUpperCase().replace(/[^A-Z0-9 .'ÀÈÉÌÒÙ-]/g, "") }))} maxLength={14} placeholder="MARADONA" autoComplete="off" className={input} />
                </label>
              )}
              {canNumber && (
                <label className="block">
                  <span className="mb-1.5 block text-[15px] font-bold text-white">Numero</span>
                  <input value={c.number} onChange={(e) => set((p) => ({ ...p, number: e.target.value.replace(/[^0-9]/g, "").slice(0, 2) }))} inputMode="numeric" maxLength={2} placeholder="10" className={`${input} text-center`} />
                </label>
              )}
            </div>
          )}
          {printed && <p className="rounded-2xl bg-[var(--wall-2)] px-4 py-3 text-[15px] italic text-[var(--text-2)]">Le maglie con nome e numero stampati non si possono restituire.</p>}

          <div>
            <p className="mb-2 text-[15px] font-bold text-white">Tipo di maglia</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" aria-pressed={!c.isPlayerEdition} onClick={() => set((p) => ({ ...p, isPlayerEdition: false }))} className={chip(!c.isPlayerEdition)}>Edizione tifoso{!c.isPlayerEdition && <Check className="h-5 w-5" strokeWidth={3} />}</button>
              <button type="button" aria-pressed={c.isPlayerEdition} onClick={() => set((p) => ({ ...p, isPlayerEdition: true }))} className={chip(c.isPlayerEdition)}><span>Edizione giocatore <span className="opacity-80">+{prices.player_edition}€</span></span>{c.isPlayerEdition && <Check className="h-5 w-5" strokeWidth={3} />}</button>
            </div>
          </div>

          {patches.length > 0 && (
            <div>
              <p className="mb-1 text-[15px] font-bold text-white">Patch</p>
              <p className="mb-3 text-[14px] italic text-[var(--text-3)]">Scegli quelle che vuoi: tutte le coppe europee, il campionato, le coppe nazionali e le competizioni delle nazionali. {patches[0] ? `${Number(patches[0].price).toFixed(0)}€ l'una.` : ""}</p>
              <PatchPicker patches={patches} suggested={suggested} selected={c.selectedPatches} toggle={toggle} />
            </div>
          )}

          {(hasShorts || hasSocks) && (
            <div>
              <p className="mb-2 text-[15px] font-bold text-white">Completa il kit</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {hasShorts && <button type="button" aria-pressed={c.includeShorts} onClick={() => set((p) => ({ ...p, includeShorts: !p.includeShorts }))} className={chip(c.includeShorts)}><span>Pantaloncini <span className="opacity-80">+{prices.shorts}€</span></span>{c.includeShorts && <Check className="h-5 w-5" strokeWidth={3} />}</button>}
                {hasSocks && <button type="button" aria-pressed={c.includeSocks} onClick={() => set((p) => ({ ...p, includeSocks: !p.includeSocks }))} className={chip(c.includeSocks)}><span>Calzettoni <span className="opacity-80">+{prices.socks}€</span></span>{c.includeSocks && <Check className="h-5 w-5" strokeWidth={3} />}</button>}
              </div>
            </div>
          )}

          {extras > 0 && <p className="text-[16px] font-bold text-[var(--lime)]">Extra scelti: +{extras.toFixed(0)}€</p>}
        </div>
      </div>
    </section>
  );
}


function Badge({ id, size = 56 }: { id: string; size?: number }) {
  const d = patchById(id);
  if (!d) return null;
  const fs = d.abbr.length > 3 ? 15 : d.abbr.length > 2 ? 18 : 22;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
      <circle cx="32" cy="32" r="30" fill={d.bg} />
      <circle cx="32" cy="32" r="26" fill="none" stroke={d.ring} strokeWidth="2.5" />
      <text x="32" y={32 + fs * 0.36} textAnchor="middle" fontFamily="var(--font-anton), Impact, sans-serif" fontSize={fs} fill={d.fg}>{d.abbr}</text>
    </svg>
  );
}

// Le patch divise per tipo: in cima "Per te" (quelle della squadra), poi coppe europee, campionati, coppe nazionali, nazionali
function PatchPicker({ patches, suggested, selected, toggle }: { patches: any[]; suggested: string[]; selected: any[]; toggle: (p: any) => void }) {
  const groups = [
    ...(suggested.length ? [{ id: "per-te", label: "Per te" }] : []),
    ...PATCH_GROUPS.map((g) => ({ id: g.id, label: g.label })),
  ];
  const [tab, setTab] = useState(groups[0].id);
  const list = tab === "per-te" ? suggested.map((id) => patches.find((p) => p._id === id)).filter(Boolean) : patches.filter((p) => patchById(p._id)?.group === tab);
  const count = (gid: string) => selected.filter((x: any) => (gid === "per-te" ? suggested.includes(x._id) : patchById(x._id)?.group === gid)).length;
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2" role="tablist" aria-label="Tipo di patch">
        {groups.map((g) => (
          <button key={g.id} type="button" role="tab" aria-selected={tab === g.id} onClick={() => setTab(g.id)} className={`inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[15px] font-semibold transition-colors ${tab === g.id ? "bg-[var(--lime)] text-[#0a0a0a]" : "bg-[var(--wall-2)] text-white shadow-[inset_0_0_0_1px_var(--line)] hover:bg-white/10"}`}>
            {g.label}
            {count(g.id) > 0 && <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[12px] font-bold ${tab === g.id ? "bg-[#0a0a0a] text-[var(--lime)]" : "bg-[var(--lime)] text-[#0a0a0a]"}`}>{count(g.id)}</span>}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="tabpanel">
        {list.map((pt: any) => {
          const on = selected.some((x: any) => x._id === pt._id);
          return (
            <button key={pt._id} type="button" aria-pressed={on} onClick={() => toggle(pt)} className={`relative flex flex-col items-center gap-1.5 rounded-2xl px-2 pb-3 pt-3 text-center transition-all active:scale-[0.98] ${on ? "bg-[var(--lime)] text-[#0a0a0a]" : "bg-[var(--wall-2)] text-white shadow-[inset_0_0_0_1px_var(--line)] hover:bg-white/10"}`}>
              <Badge id={pt._id} />
              <span className="text-[14px] font-bold leading-tight">{pt.title}</span>
              <span className={`text-[13px] font-semibold ${on ? "opacity-80" : "text-[var(--text-3)]"}`}>+{Number(pt.price).toFixed(0)}€</span>
              {on && <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#0a0a0a] text-[var(--lime)]"><Check className="h-4 w-4" strokeWidth={3} /></span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
