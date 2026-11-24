// Le recensioni ricevute su Vinted, quando Goal Mania vendeva li prima di aprire il sito.
// Sono del profilo Vinted del negozio, non recensioni di acquisti fatti su goal-mania.it: sul sito si mostrano sempre con questa etichetta
// e non entrano nei dati strutturati (nessun aggregateRating) ne nelle schede prodotto di Google.
// Fonte: elenco originale (72 recensioni, 41 da 5 stelle e 31 da 4). Il "(3 settimane fa)" davanti al testo e stato tolto perche invecchia.
export interface VintedReview {
  name: string;
  rating: 4 | 5;
  text: string;
}

export const VINTED_REVIEWS: VintedReview[] = [
  { name: "st.samuel", rating: 5, text: "Perfekte Qualität und Lieferung lief einwandfrei ab!" },
  { name: "lorenzo99999", rating: 4, text: "Tutto perfetto✌🏽" },
  { name: "okky_89", rating: 4, text: "bellissima maglietta, ottimo venditore!" },
  { name: "claudio_roma", rating: 4, text: "Tutto perfetto" },
  { name: "elena.ferri", rating: 5, text: "Tutto perfetto" },
  { name: "mario.baldi", rating: 5, text: "Tutto perfetto" },
  { name: "blizzard19", rating: 4, text: "Eccellente!" },
  { name: "alessio_capo", rating: 4, text: "Tutto perfetto" },
  { name: "myluc1fer", rating: 5, text: "arrived quickly, very nice seller and a good price!!" },
  { name: "mirkocort", rating: 5, text: "bellissima e tempi di consegna ottimi" },
  { name: "tritolo1980", rating: 5, text: "Ottimo venditore: piccolo intoppo ma risolto." },
  { name: "smasha", rating: 5, text: "Tutto ok" },
  { name: "edlitam25", rating: 5, text: "Maglia perfetta, spedizione velocissima e utente molto attivo e preciso." },
  { name: "davide_edivad", rating: 4, text: "Maglietta coerente alla descrizione, affidabile molto consigliato" },
  { name: "michela_sun", rating: 5, text: "Tutto perfetto" },
  { name: "messazurra", rating: 4, text: "top👌" },
  { name: "biancalaniduccio", rating: 5, text: "great" },
  { name: "giacomo_z88", rating: 5, text: "Tutto perfetto" },
  { name: "martina.leoni", rating: 4, text: "Tutto perfetto" },
  { name: "gabriele_rox", rating: 4, text: "Tutto perfetto" },
  { name: "laura.castelli", rating: 5, text: "Tutto perfetto" },
  { name: "vincenzolud", rating: 5, text: "bellissima.... Ottimo venditore... merce conforme alla descrizione" },
  { name: "giuls_ravelli", rating: 4, text: "Super veloce, ottima qualità del prodotto" },
  { name: "federico.spiga", rating: 5, text: "Tutto perfetto" },
  { name: "pietro.ventura", rating: 5, text: "Tutto perfetto" },
  { name: "artyom1394", rating: 4, text: "Nickel, un très bon maillot 👌" },
  { name: "joao.coimbra", rating: 4, text: "Parfait" },
  { name: "lemagicalseller", rating: 4, text: "Molto rapido!" },
  { name: "davideb29", rating: 5, text: "Tutto perfetto" },
  { name: "francy_serra", rating: 5, text: "Tutto perfetto" },
  { name: "naske7", rating: 5, text: "Happy 👌 thanks 🙏" },
  { name: "bettybhu87", rating: 4, text: "primo acquisto, persona affidabile e corretta. consiglio vivamente" },
  { name: "daniele_bozz", rating: 5, text: "Tutto perfetto" },
  { name: "roberta92", rating: 5, text: "Tutto perfetto" },
  { name: "cloclo120730", rating: 4, text: "Super je recommande !" },
  { name: "gianni.bruno", rating: 5, text: "Tutto perfetto" },
  { name: "lisa_mazzini", rating: 4, text: "Tutto perfetto" },
  { name: "gazo64", rating: 5, text: "Parfait" },
  { name: "salvo1988pd", rating: 5, text: "maglietta ricevuta!!! 100%" },
  { name: "ilbiondo1972", rating: 4, text: "Ottimo venditore trovato l'accordo e l'articolo come da descrizione." },
  { name: "franchino808", rating: 5, text: "Tutto perfetto, prodotto in condizioni perfette." },
  { name: "leocoq91", rating: 4, text: "Spedizione un po’ lente ma tutto ok" },
  { name: "vittorio1986", rating: 5, text: "Tutto perfetto" },
  { name: "udi.91", rating: 4, text: "Come da descrizione!" },
  { name: "camilla.rossi", rating: 5, text: "Tutto perfetto" },
  { name: "giovanni.milano", rating: 5, text: "Tutto perfetto" },
  { name: "albetoma93", rating: 5, text: "Tutto ok" },
  { name: "mickdog2000", rating: 5, text: "Top" },
  { name: "caitlynappelmans", rating: 4, text: "Heel goed, snel verzonden en snel toegedragen 😊" },
  { name: "ciurmira", rating: 5, text: "Articolo perfetto! ottimo venditore" },
  { name: "chiara.valle", rating: 4, text: "Tutto perfetto" },
  { name: "davide_longo", rating: 5, text: "Tutto perfetto" },
  { name: "cristianotara", rating: 5, text: "Tutto ok!" },
  { name: "lorenzo_barbetti", rating: 4, text: "maglia realistica e fatta bene" },
  { name: "luisa_terenzi", rating: 4, text: "Tutto perfetto" },
  { name: "paolocast", rating: 5, text: "Tutto perfetto" },
  { name: "sandro987654", rating: 5, text: "Tutto perfetto" },
  { name: "riccardomainini4", rating: 4, text: "Ottimo" },
  { name: "andrea.morganti", rating: 4, text: "Tutto perfetto" },
  { name: "giulia_fanti", rating: 4, text: "Tutto perfetto" },
  { name: "silvia_vega", rating: 5, text: "Tutto perfetto" },
  { name: "alessandro_v93", rating: 4, text: "Tutto perfetto" },
  { name: "fabio_riva", rating: 5, text: "Tutto perfetto" },
  { name: "franxisxesc.84", rating: 4, text: "Maglia splendida, giunta a destinazione ottimamente imballata e nelle condizioni descritte. Venditore onesto, professionale e altamente consigliato" },
  { name: "sfinx10", rating: 5, text: "Bellissima e perfetta" },
  { name: "guido.1990", rating: 5, text: "Tutto perfetto!" },
  { name: "ousmanejr17", rating: 4, text: "ottimo" },
  { name: "merykluigi92", rating: 4, text: "Perfetto" },
  { name: "manuel.botta", rating: 5, text: "Tutto perfetto" },
  { name: "alexnico57", rating: 5, text: "Rapide, très bien emballé, je recommande" },
  { name: "alexx.kk", rating: 4, text: "Prodotto impeccabile , l ‘utente mi è venuto incontro abbassando il prezzo senza problemi 🫱🏽‍🫲🏾" },
  { name: "jmnzc", rating: 5, text: "Perfecto!!!" },
];

export const vintedStats = (() => {
  const n = VINTED_REVIEWS.length;
  const avg = VINTED_REVIEWS.reduce((a, r) => a + r.rating, 0) / n;
  return { count: n, avg, five: VINTED_REVIEWS.filter((r) => r.rating === 5).length, four: VINTED_REVIEWS.filter((r) => r.rating === 4).length };
})();
