import { isLegend, isNational } from "@/lib/archive";
import { RETRO_WEAK_IMAGES } from "@/lib/data/retroWeakImages";

// Le maglie che la gente cerca di piu: grandi club, grandi nazionali, i nomi che hanno fatto la storia.
// Non e un dato di vendita: e una regola editoriale, scritta qui, che si puo cambiare.
const BIG_CLUBS = ["inter", "milan", "juventus", "juve", "napoli", "roma", "real madrid", "barcellona", "barcelona", "psg", "bayern", "liverpool", "manchester city", "man city", "manchester united", "man. united", "man united", "arsenal", "chelsea", "boca", "flamengo"];
const BIG_NATIONS = ["italia", "brasile", "argentina", "francia", "portogallo", "germania", "spagna", "olanda", "inghilterra"];

export function hypeScore(title: string, feature = false): number {
  const t = title.toLowerCase();
  let s = feature ? 2 : 0;
  if (isLegend(title)) s += 3;
  if (BIG_CLUBS.some((c) => t.includes(c))) s += 2;
  if (isNational(title) && BIG_NATIONS.some((n) => t.includes(n))) s += 2;
  if (/vittoria|finale|world cup|mondial|triplete|champions|ucl/.test(t)) s += 1;
  return s;
}

// Rotazione: stesso ordine per 15 minuti, poi cambia. Cosi la vetrina non e mai ferma ma resta stabile mentre la guardi.
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const rotationSeed = (minutes = 15, salt = 0) => Math.floor(Date.now() / (minutes * 60_000)) + salt * 7919;

function shuffle<T>(arr: T[], seed: number): T[] {
  const r = rng(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface Pickable {
  id: string;
  name: string;
  image: string;
  isRetro?: boolean;
  feature?: boolean;
}

// Le n maglie piu hype tra attuali e retro (meta e meta), scelte a rotazione dal gruppo di testa.
export function pickHyped<T extends Pickable>(items: T[], n: number, seed: number, retroShare = 0.5): T[] {
  const withPhoto = items.filter((i) => i.image && !i.image.startsWith("/images/") && !RETRO_WEAK_IMAGES.has(i.id));
  const top = (list: T[], k: number) =>
    shuffle(
      [...list].sort((a, b) => hypeScore(b.name, b.feature) - hypeScore(a.name, a.feature)).slice(0, Math.max(k * 3, 12)),
      seed,
    ).slice(0, k);
  const nRetro = Math.round(n * retroShare);
  const retro = top(withPhoto.filter((i) => i.isRetro), nRetro);
  const current = top(withPhoto.filter((i) => !i.isRetro), n - nRetro);
  // alterna attuale e retro, cosi le due file non hanno blocchi dello stesso tipo
  const out: T[] = [];
  for (let i = 0; i < n; i++) {
    const pick = i % 2 === 0 ? current[i >> 1] ?? retro[i >> 1] : retro[i >> 1] ?? current[(i >> 1) + 1];
    if (pick && !out.includes(pick)) out.push(pick);
  }
  for (const x of [...current, ...retro]) if (out.length < n && !out.includes(x)) out.push(x);
  return out;
}
