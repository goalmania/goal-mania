"use client";

import { Check } from "lucide-react";

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
  c, set, canName, canNumber, patches, hasShorts, hasSocks, prices, toggle,
}: {
  c: Cust;
  set: (f: (p: any) => any) => void;
  canName: boolean;
  canNumber: boolean;
  patches: any[];
  hasShorts: boolean;
  hasSocks: boolean;
  prices: { player_edition: number; shorts: number; socks: number };
  toggle: (p: any) => void;
}) {
  const extras =
    (c.isPlayerEdition ? prices.player_edition : 0) + (c.includeShorts ? prices.shorts : 0) + (c.includeSocks ? prices.socks : 0) + c.selectedPatches.reduce((s: number, p: any) => s + (p.price || 0), 0);
  const printed = !!(c.name || c.number);
  return (
    <section aria-labelledby="pz-h" className="rounded-3xl bg-[var(--wall)] p-5 shadow-[inset_0_0_0_1px_var(--line)] md:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="pz-h" className="disp text-[clamp(1.7rem,3vw,2.3rem)] text-white">Personalizza la maglia</h2>
        <span className="text-[15px] font-semibold text-[var(--text-3)]">Facoltativo</span>
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-[220px_1fr]">
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
              <p className="mb-2 text-[15px] font-bold text-white">Patch delle competizioni</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {patches.map((pt) => {
                  const on = c.selectedPatches.some((x: any) => x._id === pt._id);
                  return (
                    <button key={pt._id} type="button" aria-pressed={on} onClick={() => toggle(pt)} className={chip(on)}>
                      <span>{COMP_LABEL[pt.category] || pt.category} <span className="opacity-80">+{Number(pt.price).toFixed(0)}€</span></span>
                      {on && <Check className="h-5 w-5" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
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
