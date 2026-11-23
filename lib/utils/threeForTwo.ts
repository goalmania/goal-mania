// Testo che spiega quanto manca per la terza maglia gratis (regola "Prendi 3 paghi 2",
// la meno cara e gratis ogni 3 maglie). n = numero di maglie nel carrello.
export function threeForTwoHint(n: number): { text: string; active: boolean } {
  if (n <= 0) return { text: "Tre maglie nello stesso ordine: ne paghi due", active: false };
  const r = n % 3;
  if (r === 0) return { text: "3x2 attivo: la maglia meno cara è gratis", active: true };
  if (r === 2) return { text: "Ancora 1 maglia e la terza è gratis", active: false };
  return { text: n === 1 ? "Altre 2 maglie e la terza è gratis" : "Altre 2 maglie e hai un'altra gratis", active: false };
}
