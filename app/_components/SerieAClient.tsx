"use client";

import CategoryBrowser from "@/components/shop/CategoryBrowser";
import { Product } from "@/lib/types/product";

// ── Club identity palette ─────────────────────────────────────
interface ClubIdentity {
  accent: string;
  dim: string;
  label: string;
  motto: string;
  logoSlug: string;
}

const CLUB_IDENTITY: Record<string, ClubIdentity> = {
  // ── Serie A ──────────────────────────────────────────────────
  inter:      { accent: "#0068A8", dim: "rgba(0,104,168,0.18)",  label: "F.C. Internazionale", motto: "Fratelli nell'azzurro e nel nero",  logoSlug: "inter" },
  milan:      { accent: "#FB090B", dim: "rgba(251,9,11,0.18)",   label: "A.C. Milan",           motto: "La Casa del Diavolo Rossonero",    logoSlug: "milan" },
  juventus:   { accent: "#E8E8E8", dim: "rgba(220,220,220,0.12)",label: "Juventus F.C.",         motto: "Fino alla fine",                   logoSlug: "juventus" },
  napoli:     { accent: "#12A0D7", dim: "rgba(18,160,215,0.18)", label: "S.S.C. Napoli",        motto: "Il Cielo di Napoli nel cuore",     logoSlug: "napoli" },
  roma:       { accent: "#C5282D", dim: "rgba(197,40,45,0.18)",  label: "A.S. Roma",            motto: "La Lupa dell'Eterna Città",        logoSlug: "roma" },
  lazio:      { accent: "#87CEEB", dim: "rgba(135,206,235,0.15)",label: "S.S. Lazio",           motto: "Biancoceleste per sempre",         logoSlug: "lazio" },
  atalanta:   { accent: "#1C3B7A", dim: "rgba(28,59,122,0.22)",  label: "Atalanta B.C.",        motto: "La Dea di Bergamo",                logoSlug: "atalanta" },
  fiorentina: { accent: "#7B2D8B", dim: "rgba(123,45,139,0.18)", label: "ACF Fiorentina",       motto: "Viola per sempre, viola per fede", logoSlug: "fiorentina" },
  como:       { accent: "#0054A4", dim: "rgba(0,84,164,0.18)",   label: "Como 1907",            motto: "Sul lago, con il cuore",           logoSlug: "como" },
  torino:     { accent: "#8B0000", dim: "rgba(139,0,0,0.18)",    label: "Torino F.C.",          motto: "Il Grande Torino vive",            logoSlug: "torino" },
  bologna:    { accent: "#B22222", dim: "rgba(178,34,34,0.18)",  label: "Bologna F.C. 1909",    motto: "Rossoblu di cuore",                logoSlug: "bologna" },

  // ── Premier League ───────────────────────────────────────────
  "manchester-united": { accent: "#DA291C", dim: "rgba(218,41,28,0.18)",  label: "Manchester United",  motto: "The Theatre of Dreams",           logoSlug: "man-utd" },
  "manchester-city":  { accent: "#6CABDD", dim: "rgba(108,171,221,0.18)", label: "Manchester City",    motto: "Sky Blue forever",                logoSlug: "man-city" },
  liverpool:          { accent: "#C8102E", dim: "rgba(200,16,46,0.18)",   label: "Liverpool F.C.",     motto: "You'll Never Walk Alone",         logoSlug: "liverpool" },
  arsenal:            { accent: "#EF0107", dim: "rgba(239,1,7,0.18)",     label: "Arsenal F.C.",       motto: "North London is Red",             logoSlug: "arsenal" },
  chelsea:            { accent: "#034694", dim: "rgba(3,70,148,0.2)",     label: "Chelsea F.C.",       motto: "The Pride of West London",        logoSlug: "chelsea" },
  newcastle:          { accent: "#E8E8E8", dim: "rgba(220,220,220,0.12)", label: "Newcastle United",   motto: "Toon Army forever",               logoSlug: "newcastle" },
  tottenham:          { accent: "#132257", dim: "rgba(19,34,87,0.25)",    label: "Tottenham Hotspur",  motto: "To Dare is to Do",                logoSlug: "tottenham" },
  "aston-villa":      { accent: "#670E36", dim: "rgba(103,14,54,0.2)",    label: "Aston Villa F.C.",   motto: "Prepared",                        logoSlug: "aston-villa" },

  // ── Club Internazionali ──────────────────────────────────────
  "real-madrid":  { accent: "#FEBE10", dim: "rgba(254,190,16,0.15)",  label: "Real Madrid C.F.",       motto: "Hala Madrid y nada más",          logoSlug: "real-madrid" },
  barcelona:      { accent: "#A50044", dim: "rgba(165,0,68,0.18)",    label: "FC Barcelona",           motto: "Més que un club",                 logoSlug: "barcelona" },
  psg:            { accent: "#004170", dim: "rgba(0,65,112,0.22)",    label: "Paris Saint-Germain",    motto: "Ici c'est Paris",                 logoSlug: "psg" },
  atletico:       { accent: "#CB3524", dim: "rgba(203,53,36,0.18)",   label: "Atlético de Madrid",     motto: "Con el Atleti hasta el final",    logoSlug: "atletico" },
  bayern:         { accent: "#DC052D", dim: "rgba(220,5,45,0.18)",    label: "FC Bayern München",      motto: "Mia san mia",                     logoSlug: "bayern" },
  dortmund:       { accent: "#FFD700", dim: "rgba(255,215,0,0.15)",   label: "Borussia Dortmund",      motto: "Echte Liebe",                     logoSlug: "dortmund" },

  // ── Nazionali — World Cup ────────────────────────────────────
  italy:          { accent: "#0066CC", dim: "rgba(0,102,204,0.18)",   label: "Italia",                 motto: "Forza Azzurri",                   logoSlug: "italia" },
  france:         { accent: "#002395", dim: "rgba(0,35,149,0.2)",     label: "Francia",                motto: "Allez les Bleus",                 logoSlug: "francia" },
  germany:        { accent: "#DD0000", dim: "rgba(221,0,0,0.15)",     label: "Germania",               motto: "Die Mannschaft",                  logoSlug: "germania" },
  spain:          { accent: "#E30613", dim: "rgba(227,6,19,0.18)",    label: "Spagna",                 motto: "La Roja",                         logoSlug: "spagna" },
  brazil:         { accent: "#FBDB17", dim: "rgba(251,219,23,0.15)",  label: "Brasile",                motto: "A Seleção",                       logoSlug: "brasile" },
  argentina:      { accent: "#74ACDF", dim: "rgba(116,172,223,0.18)", label: "Argentina",              motto: "La Albiceleste",                  logoSlug: "argentina" },
  portugal:       { accent: "#E30613", dim: "rgba(227,6,19,0.18)",    label: "Portogallo",             motto: "Selecção das Quinas",             logoSlug: "portogallo" },
  england:        { accent: "#CF2B36", dim: "rgba(207,43,54,0.18)",   label: "Inghilterra",            motto: "Three Lions",                     logoSlug: "inghilterra" },
  netherlands:    { accent: "#FF6300", dim: "rgba(255,99,0,0.18)",    label: "Olanda",                 motto: "Oranje boven",                    logoSlug: "olanda" },
  belgium:        { accent: "#EF2B2D", dim: "rgba(239,43,45,0.18)",   label: "Belgio",                 motto: "Les Diables Rouges",              logoSlug: "belgio" },
  croatia:        { accent: "#FF0000", dim: "rgba(255,0,0,0.15)",     label: "Croazia",                motto: "Vatreni",                         logoSlug: "croazia" },
  morocco:        { accent: "#C1272D", dim: "rgba(193,39,45,0.18)",   label: "Marocco",                motto: "Lions de l'Atlas",                logoSlug: "marocco" },
  usa:            { accent: "#002868", dim: "rgba(0,40,104,0.22)",    label: "USA",                    motto: "The Stars and Stripes",           logoSlug: "usa" },
  mexico:         { accent: "#006847", dim: "rgba(0,104,71,0.18)",    label: "Messico",                motto: "El Tri",                          logoSlug: "messico" },
  senegal:        { accent: "#00853F", dim: "rgba(0,133,63,0.18)",    label: "Senegal",                motto: "Lions de la Teranga",             logoSlug: "senegal" },
  japan:          { accent: "#BC002D", dim: "rgba(188,0,45,0.18)",    label: "Giappone",               motto: "Samurai Blue",                    logoSlug: "giappone" },
};

const DEFAULT_IDENTITY: ClubIdentity = {
  accent: "#c8f000", dim: "rgba(200,240,0,0.12)", label: "", motto: "", logoSlug: "",
};

// ── Category filter logic ────────────────────────────────────
interface SerieAClientProps {
  products: Product[];
  teamSlug?: string;
  leagueName?: string;   // e.g. "Premier League"
  leagueHref?: string;   // e.g. "/shop/premier-league"
}

// Tutte le pagine campionato e squadra passano da qui: cambia solo il titolo, il corpo e' CategoryBrowser
export default function SerieAClient({ products, teamSlug, leagueName = "Serie A", leagueHref = "/shop/serieA" }: SerieAClientProps) {
  const slug = teamSlug?.toLowerCase() ?? "";
  const identity = CLUB_IDENTITY[slug] ?? DEFAULT_IDENTITY;
  const team = identity.label || (slug ? slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ") : "");
  return (
    <CategoryBrowser
      products={products as any}
      title={team ? team : leagueName}
      eyebrow={team ? `${leagueName} · Maglie da calcio` : "Maglie da calcio"}
      logo={identity.logoSlug ? `/team-logos/${identity.logoSlug}.png` : null}
      here={leagueHref}
    />
  );
}
