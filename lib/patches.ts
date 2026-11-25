// Patch da applicare sulla maglia: ogni campionato, coppa e competizione per nazionali ha la sua.
// Le chiavi coincidono con le categorie gia usate negli ordini (champions-league, serie-a...); il prezzo lo ricalcola sempre il server.
export type PatchGroup = "europa" | "campionati" | "coppe" | "nazionali";

export interface PatchDef {
  id: string;
  label: string;
  group: PatchGroup;
  abbr: string; // sigla nel badge
  bg: string;
  fg: string;
  ring: string;
  price: number;
}

export const PATCH_GROUPS: { id: PatchGroup; label: string }[] = [
  { id: "europa", label: "Coppe europee" },
  { id: "campionati", label: "Campionati" },
  { id: "coppe", label: "Coppe nazionali" },
  { id: "nazionali", label: "Nazionali" },
];

const P = (id: string, label: string, group: PatchGroup, abbr: string, bg: string, fg: string, ring: string): PatchDef => ({ id, label, group, abbr, bg, fg, ring, price: 3 });

export const PATCHES: PatchDef[] = [
  // Coppe europee: tutte e tre per tutti
  P("champions-league", "Champions League", "europa", "UCL", "#0a1a4a", "#ffffff", "#7fa6ff"),
  P("europa-league", "Europa League", "europa", "UEL", "#f26a10", "#ffffff", "#ffd2a8"),
  P("conference-league", "Conference League", "europa", "UECL", "#0b8a4b", "#ffffff", "#a8f0c8"),
  P("supercoppa-uefa", "Supercoppa UEFA", "europa", "USC", "#1b2a49", "#ffd700", "#ffd700"),
  // Campionati
  P("serie-a", "Serie A", "campionati", "SA", "#0f4c9c", "#ffffff", "#74b9ff"),
  P("premier-league", "Premier League", "campionati", "PL", "#3d195b", "#00ff85", "#c9a6ff"),
  P("la-liga", "LaLiga", "campionati", "LL", "#e30613", "#ffffff", "#ffb3b8"),
  P("bundesliga", "Bundesliga", "campionati", "BL", "#d20515", "#ffffff", "#ffb3b8"),
  P("ligue-1", "Ligue 1", "campionati", "L1", "#091c3e", "#dcf535", "#dcf535"),
  // Coppe nazionali
  P("coppa-italia", "Coppa Italia", "coppe", "CI", "#0b3c8c", "#ffffff", "#9cc4ff"),
  P("supercoppa-italiana", "Supercoppa Italiana", "coppe", "SI", "#102a56", "#f5d000", "#f5d000"),
  P("fa-cup", "FA Cup", "coppe", "FA", "#c8102e", "#ffffff", "#ffb3be"),
  P("efl-cup", "EFL Cup", "coppe", "EFL", "#1f6f3a", "#ffffff", "#aaf0c0"),
  P("copa-del-rey", "Copa del Rey", "coppe", "CR", "#b8860b", "#ffffff", "#ffe08a"),
  P("dfb-pokal", "DFB-Pokal", "coppe", "DFB", "#222222", "#ffcc00", "#ffcc00"),
  P("coupe-de-france", "Coupe de France", "coppe", "CdF", "#002395", "#ffffff", "#a8b8ff"),
  // Nazionali
  P("world-cup-2026", "Mondiali 2026", "nazionali", "WC", "#0a0a0a", "#c8f000", "#c8f000"),
  P("euro", "Europei", "nazionali", "EU", "#0a3a8a", "#ffffff", "#9cc4ff"),
  P("nations-league", "Nations League", "nazionali", "NL", "#1a1a5a", "#ffffff", "#9aa0ff"),
  P("copa-america", "Copa América", "nazionali", "CA", "#0b5cad", "#ffd700", "#ffd700"),
  P("coppa-d-africa", "Coppa d'Africa", "nazionali", "AFCON", "#0a6b3a", "#ffd700", "#ffd700"),
  P("coppa-d-asia", "Coppa d'Asia", "nazionali", "AFC", "#a31621", "#ffffff", "#ffb3b8"),
  P("gold-cup", "Gold Cup", "nazionali", "GC", "#a07800", "#ffffff", "#ffe08a"),
];

export const patchById = (id: string) => PATCHES.find((p) => p.id === id);

// Quali patch consigliare in cima, dalla squadra nel titolo
const CLUB_PATCHES: Record<string, string[]> = {
  inter: ["champions-league", "serie-a", "coppa-italia"], milan: ["champions-league", "serie-a", "coppa-italia"],
  juventus: ["champions-league", "serie-a", "coppa-italia"], napoli: ["champions-league", "serie-a", "coppa-italia", "supercoppa-italiana"],
  lazio: ["europa-league", "serie-a", "coppa-italia"], atalanta: ["champions-league", "serie-a", "coppa-italia"],
  bologna: ["serie-a", "coppa-italia"], roma: ["europa-league", "serie-a", "coppa-italia"], fiorentina: ["conference-league", "serie-a", "coppa-italia"],
  como: ["serie-a", "coppa-italia"], torino: ["serie-a", "coppa-italia"], genoa: ["serie-a", "coppa-italia"], cagliari: ["serie-a", "coppa-italia"],
  udinese: ["serie-a", "coppa-italia"], lecce: ["serie-a", "coppa-italia"], parma: ["serie-a", "coppa-italia"], sassuolo: ["serie-a", "coppa-italia"],
  verona: ["serie-a", "coppa-italia"], palermo: ["coppa-italia"],
  arsenal: ["champions-league", "premier-league", "fa-cup", "efl-cup"], liverpool: ["champions-league", "premier-league", "fa-cup", "efl-cup"],
  "manchester city": ["champions-league", "premier-league", "fa-cup", "efl-cup"], chelsea: ["champions-league", "premier-league", "fa-cup", "efl-cup"],
  newcastle: ["champions-league", "premier-league", "fa-cup", "efl-cup"], "aston villa": ["europa-league", "premier-league", "fa-cup", "efl-cup"],
  "manchester united": ["europa-league", "premier-league", "fa-cup", "efl-cup"], tottenham: ["europa-league", "premier-league", "fa-cup", "efl-cup"],
  "real madrid": ["champions-league", "la-liga", "copa-del-rey"], barcellona: ["champions-league", "la-liga", "copa-del-rey"], barcelona: ["champions-league", "la-liga", "copa-del-rey"],
  atletico: ["champions-league", "la-liga", "copa-del-rey"], malaga: ["la-liga", "copa-del-rey"],
  bayern: ["champions-league", "bundesliga", "dfb-pokal"], dortmund: ["champions-league", "bundesliga", "dfb-pokal"],
  psg: ["champions-league", "ligue-1", "coupe-de-france"],
};

export function suggestedPatches(title: string, isNational: boolean): string[] {
  if (isNational) return ["world-cup-2026", "nations-league", "euro"];
  const t = title.toLowerCase();
  for (const [k, v] of Object.entries(CLUB_PATCHES)) if (t.includes(k)) return v;
  return [];
}
