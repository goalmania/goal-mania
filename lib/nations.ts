// Le nazionali del Mondiale 2026 in catalogo: chiave come salvata nel database (con i suoi refusi), nome italiano e codice bandiera
export const WC_NATIONS: Record<string, { it: string; iso: string }> = {
  Argentina: { it: "Argentina", iso: "ar" },
  Belgium: { it: "Belgio", iso: "be" },
  Brazil: { it: "Brasile", iso: "br" },
  Canada: { it: "Canada", iso: "ca" },
  "Cape Verde": { it: "Capo Verde", iso: "cv" },
  Columbia: { it: "Colombia", iso: "co" },
  Colombia: { it: "Colombia", iso: "co" },
  Croatia: { it: "Croazia", iso: "hr" },
  "Curaçao": { it: "Curaçao", iso: "cw" },
  "Czezch Republic": { it: "Repubblica Ceca", iso: "cz" },
  "Czech Republic": { it: "Repubblica Ceca", iso: "cz" },
  Egypt: { it: "Egitto", iso: "eg" },
  England: { it: "Inghilterra", iso: "gb-eng" },
  France: { it: "Francia", iso: "fr" },
  Germany: { it: "Germania", iso: "de" },
  Ghana: { it: "Ghana", iso: "gh" },
  "Ivory Coast": { it: "Costa d'Avorio", iso: "ci" },
  Italy: { it: "Italia", iso: "it" },
  Japan: { it: "Giappone", iso: "jp" },
  Mexico: { it: "Messico", iso: "mx" },
  Morocco: { it: "Marocco", iso: "ma" },
  Netherlands: { it: "Olanda", iso: "nl" },
  "New Zeland": { it: "Nuova Zelanda", iso: "nz" },
  "New Zealand": { it: "Nuova Zelanda", iso: "nz" },
  Norway: { it: "Norvegia", iso: "no" },
  Portugal: { it: "Portogallo", iso: "pt" },
  "Saudi Arabia": { it: "Arabia Saudita", iso: "sa" },
  Scotland: { it: "Scozia", iso: "gb-sct" },
  Senegal: { it: "Senegal", iso: "sn" },
  "South Africa": { it: "Sudafrica", iso: "za" },
  "South Korea": { it: "Sud Korea", iso: "kr" },
  Spain: { it: "Spagna", iso: "es" },
  Sweden: { it: "Svezia", iso: "se" },
  Turkey: { it: "Turchia", iso: "tr" },
  "United States": { it: "USA", iso: "us" },
  USA: { it: "USA", iso: "us" },
  Uruguay: { it: "Uruguay", iso: "uy" },
};

// Dal titolo italiano ("Maglia Nuova Zelanda Away 2026") alla chiave italiana normalizzata della nazionale
const BY_IT = new Map<string, { it: string; iso: string }>();
for (const v of Object.values(WC_NATIONS)) BY_IT.set(v.it.toLowerCase(), v);
const ALIAS: Record<string, string> = { "stati uniti": "usa", england: "inghilterra", "sud africa": "sudafrica", "costa d'avorio": "costa d'avorio" };

export function nationOfTitle(title: string): { it: string; iso: string } | null {
  const t = title.replace(/^Maglia\s+/i, "").toLowerCase();
  // "EnglandxPalace" e simili: la nazionale e la prima parola riconosciuta
  for (const [alias, to] of Object.entries(ALIAS)) if (t.startsWith(alias)) return BY_IT.get(to) || null;
  const names = [...BY_IT.keys()].sort((a, b) => b.length - a.length);
  for (const n of names) if (t.startsWith(n)) return BY_IT.get(n)!;
  return null;
}

export const flagSrc = (iso: string, w = 160) => `https://flagcdn.com/w${w}/${iso}.png`;
export const flagForKey = (key: string) => (WC_NATIONS[key] ? flagSrc(WC_NATIONS[key].iso) : null);
export const nationItName = (key: string) => WC_NATIONS[key]?.it ?? key;

export const flagForItName = (it: string) => {
  const v = BY_IT.get(it.toLowerCase());
  return v ? flagSrc(v.iso) : null;
};

// Nazionali che compaiono nei titoli delle maglie retro: nome italiano -> codice bandiera (senza codice = sigla al posto della bandiera)
export const RETRO_NATIONS: Record<string, string> = {
  Italia: "it", Brasile: "br", Germania: "de", Argentina: "ar", Francia: "fr", Spagna: "es", Olanda: "nl", Inghilterra: "gb-eng",
  Portogallo: "pt", Giappone: "jp", Messico: "mx", USA: "us", Belgio: "be", Croazia: "hr", Uruguay: "uy", Nigeria: "ng", Camerun: "cm",
  Cile: "cl", Colombia: "co", Danimarca: "dk", Svezia: "se", Romania: "ro", Bulgaria: "bg", Russia: "ru", Corea: "kr", Turchia: "tr",
  Svizzera: "ch", Polonia: "pl", Scozia: "gb-sct", Irlanda: "ie", Ghana: "gh", Marocco: "ma", Senegal: "sn", "Costa d'Avorio": "ci",
  Galles: "gb-wls", Ungheria: "hu", Jugoslavia: "", Norvegia: "no", Grecia: "gr", Australia: "au", Sudafrica: "za", Paraguay: "py",
  Ecuador: "ec", Egitto: "eg", Algeria: "dz", Tunisia: "tn",
};
const RETRO_ALIAS: Record<string, string> = { "stati uniti": "USA" };
const RETRO_RE = new RegExp(`(?<![\\p{L}])(${[...Object.keys(RETRO_NATIONS), ...Object.keys(RETRO_ALIAS)].map((n) => n.replace(/'/g, "['’]")).join("|")})(?![\\p{L}])`, "iu");

// Prima nazionale nominata nel titolo ("Maglia Baggio Italia Home 1994" -> Italia)
export function retroNationOf(title: string): { name: string; iso: string } | null {
  const m = title.match(RETRO_RE);
  if (!m) return null;
  const raw = m[1].toLowerCase();
  const name = RETRO_ALIAS[raw] || Object.keys(RETRO_NATIONS).find((n) => n.toLowerCase().replace(/'/g, "") === raw.replace(/['’]/g, "")) || m[1];
  return { name, iso: RETRO_NATIONS[name] ?? "" };
}
