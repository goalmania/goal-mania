// Archivio retro: come si naviga la storia. Epoche e leggende si ricavano dal titolo (anno, nome del giocatore).
export interface ArchiveItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  category: string;
  year: number | null;
}

export const ERAS = [
  { slug: "anni-70", label: "Anni 70 e prima", short: "70", from: 1900, to: 1979, blurb: "Le maglie di prima del 1980." },
  { slug: "anni-80", label: "Anni 80", short: "80", from: 1980, to: 1989, blurb: "Righe larghe, colletti e i Mondiali di Spagna e Messico." },
  { slug: "anni-90", label: "Anni 90", short: "90", from: 1990, to: 1999, blurb: "Il decennio dei Mondiali in Italia, USA e Francia." },
  { slug: "anni-2000", label: "Anni 2000", short: "00", from: 2000, to: 2009, blurb: "I Mondiali in Corea e Giappone e in Germania." },
  { slug: "anni-2010", label: "Anni 2010", short: "10", from: 2010, to: 2019, blurb: "Tre Mondiali: Sudafrica, Brasile e Russia." },
  { slug: "oggi", label: "Dal 2020", short: "20", from: 2020, to: 2099, blurb: "Edizioni speciali, anniversari recenti e il Mondiale 2022." },
] as const;

// Giocatori che compaiono nei titoli delle maglie retro
export const LEGENDS = [
  "Messi", "Zidane", "Kaká", "Baggio", "Ronaldinho", "Cristiano Ronaldo", "CR7", "Pelé", "Maradona", "Suarez", "Del Piero", "Totti",
  "Beckham", "Cantona", "Henry", "Neymar", "Ibrahimovic", "Pirlo", "Maldini", "Cruyff", "Platini", "Van Basten", "Gullit", "Romário",
  "Batistuta", "Zola", "Vieri", "Shevchenko", "Figo", "Raúl", "Gerrard", "Lampard", "Rooney", "Chicharito", "Ronaldo",
];

export const WORLD_CUP_YEARS = [1990, 1994, 1998, 2002, 2006, 2010, 2014, 2018, 2022];

// Alcune schede hanno ancora il segnaposto con il logo al posto della foto: non devono rappresentare un'era
export const hasPhoto = (image: string) => !!image && !image.startsWith("/images/");

export function yearOf(title: string): number | null {
  const m = title.match(/(19[0-9]\d|20[0-2]\d)/);
  return m ? Number(m[1]) : null;
}

export function isLegend(title: string): boolean {
  return LEGENDS.some((n) => new RegExp(`\\b${n}\\b`, "i").test(title));
}

export function teamOf(title: string): string {
  const t = title.replace(/^Maglia\s+/i, "");
  return t.split(/\s+(?:Home|Away|Third|Fourth|Retro|Long|Player|19\d\d|20\d\d)/)[0].trim();
}

export function eraOf(year: number | null) {
  if (year == null) return null;
  return ERAS.find((e) => year >= e.from && year <= e.to) || null;
}

export function toItem(p: any): ArchiveItem {
  return {
    id: String(p._id),
    slug: p.slug || "",
    name: p.title || "Maglia",
    price: Number(p.isRetro ? p.retroPrice : p.basePrice) || Number(p.basePrice) || 0,
    image: p.images?.[0] || "",
    category: p.category || "Retro",
    year: yearOf(p.title || ""),
  };
}

// Nazionali: servono per riconoscere le maglie di un Mondiale (anno + squadra nazionale nel titolo)
export const NATIONS = [
  "Italia", "Brasile", "Germania", "Argentina", "Francia", "Spagna", "Olanda", "Inghilterra", "Portogallo", "Giappone", "Messico", "USA",
  "Stati Uniti", "Belgio", "Croazia", "Uruguay", "Nigeria", "Camerun", "Cile", "Colombia", "Danimarca", "Svezia", "Romania", "Bulgaria",
  "Russia", "Corea", "Turchia", "Svizzera", "Polonia", "Scozia", "Irlanda", "Ghana", "Marocco", "Senegal", "Costa d'Avorio", "Galles",
  "Ungheria", "Jugoslavia", "Norvegia", "Grecia", "Australia", "Sudafrica", "Paraguay", "Ecuador", "Egitto", "Algeria", "Tunisia",
];
const NATION_RE = new RegExp(`\\b(${NATIONS.join("|")})\\b`, "i");

export const isNational = (title: string) => NATION_RE.test(title);

// Le maglie delle nazionali dell'anno di un Mondiale
export function worldCupItems(items: ArchiveItem[], year: number) {
  return items.filter((it) => it.year === year && isNational(it.name));
}
