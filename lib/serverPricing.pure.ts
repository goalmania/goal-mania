// Parte pura (nessun database): testabile da sola.
// Gli stessi extra mostrati nella scheda prodotto (ProductDetailClient)
export const EXTRAS = { playerEdition: 5, longSleeve: 10, shorts: 11, socks: 17 };
export const DEFAULT_PATCH_PRICE = 3;

export const round2 = (n: number) => Math.round(n * 100) / 100;

export type Customization = {
  selectedPatches?: Array<string | { category?: string; id?: string; price?: number }>;
  includeShorts?: boolean;
  includeSocks?: boolean;
  hasLongSleeve?: boolean;
  isPlayerEdition?: boolean;
};

export function patchCategories(c?: Customization): string[] {
  return (c?.selectedPatches || [])
    .map((p) => (typeof p === "string" ? p : p?.category || p?.id || ""))
    .filter(Boolean);
}

// Funzione pura (testata): prezzo di UNA maglia dal prezzo di listino e dalle scelte del cliente
export function unitPriceFor(base: number, c: Customization | undefined, patchPrices: Record<string, number>): number {
  const extras =
    (c?.isPlayerEdition ? EXTRAS.playerEdition : 0) +
    (c?.hasLongSleeve ? EXTRAS.longSleeve : 0) +
    (c?.includeShorts ? EXTRAS.shorts : 0) +
    (c?.includeSocks ? EXTRAS.socks : 0);
  const patches = patchCategories(c).reduce((s, cat) => s + (patchPrices[cat] ?? DEFAULT_PATCH_PRICE), 0);
  return round2(base + extras + patches);
}

export const baseProductId = (itemId: string) => String(itemId).split("_")[0];

