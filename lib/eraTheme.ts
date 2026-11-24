// Ogni era ha un suo mondo grafico (colori, motivo, carattere, cornice) e i suoi Mondiali.
// Solo fatti verificabili: sede e vincitrice di ogni Coppa del Mondo.
export interface WorldCup {
  year: number;
  host: string;
  winner: string;
}

export interface EraTheme {
  slug: string;
  cls: string; // era-70 ...
  numeral: string;
  title: string;
  line: string; // una riga che dice come si vestiva il calcio
  cups: WorldCup[];
}

export const ERA_THEME: Record<string, EraTheme> = {
  "anni-70": {
    slug: "anni-70",
    cls: "era-70",
    numeral: "70",
    title: "Anni 70 e prima",
    line: "Cotone, colletti a polo e colori pieni: le maglie di prima del 1980.",
    cups: [
      { year: 1970, host: "Messico", winner: "Brasile" },
      { year: 1974, host: "Germania Ovest", winner: "Germania Ovest" },
      { year: 1978, host: "Argentina", winner: "Argentina" },
    ],
  },
  "anni-80": {
    slug: "anni-80",
    cls: "era-80",
    numeral: "80",
    title: "Anni 80",
    line: "Righe larghe, sponsor grandi sul petto e due Mondiali: Spagna 1982 e Messico 1986.",
    cups: [
      { year: 1982, host: "Spagna", winner: "Italia" },
      { year: 1986, host: "Messico", winner: "Argentina" },
    ],
  },
  "anni-90": {
    slug: "anni-90",
    cls: "era-90",
    numeral: "90",
    title: "Anni 90",
    line: "Maglie larghe, colori forti e tre Mondiali: Italia 1990, Stati Uniti 1994, Francia 1998.",
    cups: [
      { year: 1990, host: "Italia", winner: "Germania Ovest" },
      { year: 1994, host: "Stati Uniti", winner: "Brasile" },
      { year: 1998, host: "Francia", winner: "Francia" },
    ],
  },
  "anni-2000": {
    slug: "anni-2000",
    cls: "era-00",
    numeral: "00",
    title: "Anni 2000",
    line: "Tessuti tecnici e due Mondiali: Corea e Giappone 2002, Germania 2006.",
    cups: [
      { year: 2002, host: "Corea del Sud e Giappone", winner: "Brasile" },
      { year: 2006, host: "Germania", winner: "Italia" },
    ],
  },
  "anni-2010": {
    slug: "anni-2010",
    cls: "era-10",
    numeral: "10",
    title: "Anni 2010",
    line: "Linee pulite e tre Mondiali: Sudafrica 2010, Brasile 2014, Russia 2018.",
    cups: [
      { year: 2010, host: "Sudafrica", winner: "Spagna" },
      { year: 2014, host: "Brasile", winner: "Germania" },
      { year: 2018, host: "Russia", winner: "Francia" },
    ],
  },
  oggi: {
    slug: "oggi",
    cls: "era-20",
    numeral: "20",
    title: "Dal 2020",
    line: "Edizioni speciali, anniversari recenti e il Mondiale in Qatar del 2022.",
    cups: [{ year: 2022, host: "Qatar", winner: "Argentina" }],
  },
};

export const ERA_ORDER = ["anni-70", "anni-80", "anni-90", "anni-2000", "anni-2010", "oggi"];

// Tutti i Mondiali in un solo elenco, per anno
export const WORLD_CUPS: Record<number, WorldCup> = Object.fromEntries(
  Object.values(ERA_THEME).flatMap((t) => t.cups).map((c) => [c.year, c]),
);

// Gli anni coperti da ogni era, scritti come li legge un cliente
export const ERA_RANGE: Record<string, string> = {
  "anni-70": "fino al 1979",
  "anni-80": "1980-1989",
  "anni-90": "1990-1999",
  "anni-2000": "2000-2009",
  "anni-2010": "2010-2019",
  oggi: "dal 2020",
};
