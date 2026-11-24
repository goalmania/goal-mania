// Stemmi disponibili in /public/team-logos, per nome della squadra come compare nei titoli delle maglie
const FILES: Record<string, string> = {
  inter: "inter", milan: "milan", "ac milan": "milan", juventus: "juventus", juve: "juventus", napoli: "napoli", roma: "roma", lazio: "lazio",
  atalanta: "atalanta", fiorentina: "fiorentina", bologna: "bologna", torino: "torino", udinese: "udinese", monza: "monza", genoa: "genoa",
  lecce: "lecce", cagliari: "cagliari", verona: "verona", "hellas verona": "verona", sassuolo: "sassuolo", empoli: "empoli", parma: "parma", como: "como",
  arsenal: "arsenal", "aston villa": "aston-villa", chelsea: "chelsea", liverpool: "liverpool", "man city": "man-city", "manchester city": "man-city",
  "man. united": "man-utd", "man united": "man-utd", "manchester united": "man-utd", "man utd": "man-utd", tottenham: "tottenham",
  "real madrid": "real-madrid", barcelona: "barcelona", barcellona: "barcelona", atletico: "atletico", "atletico madrid": "atletico", "atlético madrid": "atletico",
  bayern: "bayern", "bayern monaco": "bayern", dortmund: "dortmund", "borussia dortmund": "dortmund", psg: "psg", ajax: "ajax", benfica: "benfica", porto: "porto", sporting: "sporting",
  argentina: "argentina", belgio: "belgio", brasile: "brasile", croazia: "croazia", francia: "francia", germania: "germania", giappone: "giappone",
  inghilterra: "inghilterra", italia: "italia", marocco: "marocco", messico: "messico", olanda: "olanda", portogallo: "portogallo", senegal: "senegal", spagna: "spagna", usa: "usa",
};

export function logoFor(team: string): string | null {
  const k = team.toLowerCase().trim().replace(/\s+/g, " ");
  const f = FILES[k];
  return f ? `/team-logos/${f}.png` : null;
}
