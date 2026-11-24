// Condiviso tra la pagina server /shop/2026/27 e il suo client: stessa regola per riconoscere campionato e squadra.
// ─── League detection ──────────────────────────────────────
export const LEAGUE_RULES: { key: string; keywords: string[] }[] = [
  {
    key: "serieA",
    keywords: [
      "inter", "milan", "juventus", "juve", "napoli", "roma", "lazio",
      "bologna", "como", "venezia", "atalanta", "fiorentina", "torino", "genoa",
    ],
  },
  {
    key: "premier",
    keywords: [
      "arsenal", "chelsea", "liverpool", "manchester city", "man city",
      "manchester united", "man united", "tottenham", "newcastle", "aston villa",
    ],
  },
  {
    key: "laliga",
    keywords: ["real madrid", "barcellona", "atletico madrid", "villarreal", "sevilla"],
  },
  {
    key: "nationals",
    keywords: [
      "italia", "brasile", "portogallo", "giappone", "inghilterra",
      "argentina", "francia", "spagna", "germany", "germania",
    ],
  },
];

export function getLeague(title: string): string {
  const t = title.toLowerCase();
  for (const rule of LEAGUE_RULES) {
    if (rule.keywords.some((k) => t.includes(k))) return rule.key;
  }
  return "other";
}

export function extractTeamName(title: string): string {
  // "Maglia Arsenal 25/26 Home" → "Arsenal"
  const cleaned = title
    .replace(/^maglia\s+/i, "")
    .replace(/^quarta\s+maglia\s+/i, "")
    .replace(/\s+(home|away|third|quarta|terza|casa|trasferta|pre\s+gara|allenamento|training|halloween|concept|x\s+\S+)\s*.*/i, "")
    .replace(/\s+\d{2}\/\d{2,4}.*$/i, "")
    .replace(/\s+\d{4}\/\d{2,4}.*$/i, "")
    .replace(/\s+\d{4}-\d{2,4}.*$/i, "")
    .trim();
  return cleaned || title;
}
