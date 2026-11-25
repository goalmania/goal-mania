// Le squadre di club con le maglie in catalogo, raggruppate per campionato.
// Il riconoscimento e dal titolo ("Maglia Inter Home 2026/27"): una squadra compare solo se ha davvero maglie.
export type League = "serie-a" | "premier" | "europa" | "altre";

export interface Club {
  slug: string;
  name: string;
  league: League;
  logo?: string; // /public/team-logos
  re: RegExp; // riconosce la squadra nel titolo
  href?: string; // pagina gia esistente (indicizzata): se manca si usa /squadre/[slug]
}

const L = (s: string) => `/team-logos/${s}.png`;

export const LEAGUES: { id: League; label: string; note: string }[] = [
  { id: "serie-a", label: "Serie A", note: "Le squadre italiane" },
  { id: "premier", label: "Premier League", note: "Le squadre inglesi" },
  { id: "europa", label: "Liga, Bundesliga, Ligue 1", note: "Spagna, Germania e Francia" },
  { id: "altre", label: "Altre squadre", note: "Dal resto d'Europa" },
];

export const CLUBS: Club[] = [
  // Serie A
  { slug: "inter", name: "Inter", league: "serie-a", logo: L("inter"), re: /\b(Inter(?!national)|Int)\b/i, href: "/shop/serieA/inter" },
  { slug: "milan", name: "Milan", league: "serie-a", logo: L("milan"), re: /\bMilan\b/i, href: "/shop/serieA/milan" },
  { slug: "juventus", name: "Juventus", league: "serie-a", logo: L("juventus-dark"), re: /\bJuventus\b/i, href: "/shop/serieA/juventus" },
  { slug: "napoli", name: "Napoli", league: "serie-a", logo: L("napoli"), re: /\bNapoli\b/i, href: "/shop/serieA/napoli" },
  { slug: "roma", name: "Roma", league: "serie-a", logo: L("roma"), re: /\bRoma\b/i, href: "/shop/serieA/roma" },
  { slug: "lazio", name: "Lazio", league: "serie-a", logo: L("lazio"), re: /\bLazio\b/i, href: "/shop/serieA/lazio" },
  { slug: "atalanta", name: "Atalanta", league: "serie-a", logo: L("atalanta"), re: /\bAtalanta\b/i, href: "/shop/serieA/atalanta" },
  { slug: "fiorentina", name: "Fiorentina", league: "serie-a", logo: L("fiorentina"), re: /\bFiorentina\b/i, href: "/shop/serieA/fiorentina" },
  { slug: "bologna", name: "Bologna", league: "serie-a", logo: L("bologna"), re: /\bBologna\b/i, href: "/shop/serieA/bologna" },
  { slug: "como", name: "Como", league: "serie-a", logo: L("como"), re: /\bComo\b/i, href: "/shop/serieA/como" },
  { slug: "torino", name: "Torino", league: "serie-a", logo: L("torino"), re: /\bTorino\b/i, href: "/shop/serieA/torino" },
  { slug: "parma", name: "Parma", league: "serie-a", logo: L("parma"), re: /\bParma\b/i },
  { slug: "genoa", name: "Genoa", league: "serie-a", logo: L("genoa"), re: /\bGenoa\b/i, href: "/shop/serieA/genoa" },
  { slug: "cagliari", name: "Cagliari", league: "serie-a", logo: L("cagliari"), re: /\bCagliari\b/i, href: "/shop/serieA/cagliari" },
  { slug: "udinese", name: "Udinese", league: "serie-a", logo: L("udinese"), re: /\bUdinese\b/i, href: "/shop/serieA/udinese" },
  { slug: "lecce", name: "Lecce", league: "serie-a", logo: L("lecce"), re: /\bLecce\b/i, href: "/shop/serieA/lecce" },
  { slug: "sassuolo", name: "Sassuolo", league: "serie-a", logo: L("sassuolo"), re: /\bSassuolo\b/i, href: "/shop/serieA/sassuolo" },
  { slug: "verona", name: "Hellas Verona", league: "serie-a", logo: L("verona"), re: /\b(Hellas )?Verona\b/i, href: "/shop/serieA/verona" },
  // Premier League
  { slug: "manchester-city", name: "Manchester City", league: "premier", logo: L("man-city"), re: /\b(Manchester City|Man\.? City)\b/i, href: "/shop/premier-league/manchester-city" },
  { slug: "liverpool", name: "Liverpool", league: "premier", logo: L("liverpool"), re: /\bLiverpool\b/i, href: "/shop/premier-league/liverpool" },
  { slug: "arsenal", name: "Arsenal", league: "premier", logo: L("arsenal"), re: /\bArsenal\b/i, href: "/shop/premier-league/arsenal" },
  { slug: "chelsea", name: "Chelsea", league: "premier", logo: L("chelsea"), re: /\bChelsea\b/i, href: "/shop/premier-league/chelsea" },
  { slug: "manchester-united", name: "Manchester United", league: "premier", logo: L("man-utd"), re: /\b(Manchester United|M(an)?\.? United|Man\.? Utd)\b/i, href: "/shop/premier-league/manchester-united" },
  { slug: "tottenham", name: "Tottenham", league: "premier", logo: L("tottenham"), re: /\bTottenham\b/i, href: "/shop/premier-league/tottenham" },
  { slug: "newcastle", name: "Newcastle", league: "premier", logo: L("newcastle"), re: /\bNewcastle\b/i, href: "/shop/premier-league/newcastle" },
  { slug: "aston-villa", name: "Aston Villa", league: "premier", logo: L("aston-villa"), re: /\bAston Villa\b/i, href: "/shop/premier-league/aston-villa" },
  // Spagna, Germania, Francia
  { slug: "real-madrid", name: "Real Madrid", league: "europa", logo: L("real-madrid"), re: /\bReal Madrid\b/i },
  { slug: "barcellona", name: "Barcellona", league: "europa", logo: L("barcelona"), re: /\b(Barcellona|Barcelona)\b/i },
  { slug: "atletico-madrid", name: "Atletico Madrid", league: "europa", logo: L("atletico"), re: /\bAtl[eé]tico\b/i },
  { slug: "bayern-monaco", name: "Bayern Monaco", league: "europa", logo: L("bayern"), re: /\bBayern\b/i },
  { slug: "borussia-dortmund", name: "Borussia Dortmund", league: "europa", logo: L("dortmund"), re: /\b(Borussia Dortmund|Dortmund)\b/i },
  { slug: "psg", name: "PSG", league: "europa", logo: L("psg"), re: /\b(PSG|Paris Saint)\b/i },
  // Altre
  { slug: "galatasaray", name: "Galatasaray", league: "altre", logo: L("galatasaray"), re: /\bGalatasaray\b/i },
  { slug: "coventry-city", name: "Coventry City", league: "altre", logo: L("coventry"), re: /\bCoventry\b/i },
  { slug: "malaga", name: "Malaga", league: "altre", logo: L("malaga"), re: /\bMalaga\b/i },
  { slug: "venezia", name: "Venezia", league: "altre", logo: L("venezia"), re: /\bVenezia\b/i },
  { slug: "ajax", name: "Ajax", league: "altre", logo: L("ajax"), re: /\bAjax\b/i },
  { slug: "benfica", name: "Benfica", league: "altre", logo: L("benfica"), re: /\bBenfica\b/i },
  { slug: "porto", name: "Porto", league: "altre", logo: L("porto"), re: /\bPorto\b/i },
  { slug: "sporting", name: "Sporting CP", league: "altre", logo: L("sporting"), re: /\bSporting\b/i },
  { slug: "celtic", name: "Celtic", league: "altre", logo: L("celtic"), re: /\bCeltic\b/i },
  { slug: "flamengo", name: "Flamengo", league: "altre", logo: L("flamengo"), re: /\bFlamengo\b/i },
  { slug: "boca-juniors", name: "Boca Juniors", league: "altre", logo: L("boca-juniors"), re: /\bBoca\b/i },
  { slug: "river-plate", name: "River Plate", league: "altre", logo: L("river-plate"), re: /\bRiver Plate\b/i },
  { slug: "santos", name: "Santos", league: "altre", logo: L("santos"), re: /\bSantos\b/i },
  { slug: "corinthians", name: "Corinthians", league: "altre", logo: L("corinthians"), re: /\bCorinthians\b/i },
  { slug: "marsiglia", name: "Marsiglia", league: "altre", logo: L("marsiglia"), re: /\b(Marsiglia|Marseille)\b/i },
  { slug: "west-ham", name: "West Ham", league: "altre", logo: L("west-ham"), re: /\bWest Ham\b/i },
  { slug: "chivas", name: "Chivas", league: "altre", logo: L("chivas"), re: /\bChivas\b/i },
  { slug: "schalke", name: "Schalke 04", league: "altre", logo: L("schalke"), re: /\bSchalke\b/i },
  { slug: "palermo", name: "Palermo", league: "altre", logo: L("palermo"), re: /\bPalermo\b/i },
];

export const clubHref = (c: Club) => c.href || `/squadre/${c.slug}`;
export const clubBySlug = (slug: string) => CLUBS.find((c) => c.slug === slug);

// "Maglia Inter Home" -> Inter: prima squadra che il titolo nomina, cosi "Inter" non cattura "Internazionale" e Milan non cattura Inter-Milan
export function clubOfTitle(title: string): Club | null {
  const t = title.replace(/^(Quarta |Terza )?Maglia\s+/i, "");
  return CLUBS.find((c) => c.re.test(t)) || null;
}
