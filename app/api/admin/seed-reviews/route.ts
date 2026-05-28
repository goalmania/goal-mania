import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";

const SEED_SECRET = process.env.SEED_SECRET || "goalmania-seed-2026";

const NAMES = [
  "Marco B.", "Giulia R.", "Luca M.", "Sofia T.", "Alessandro P.",
  "Valentina C.", "Davide E.", "Federica N.", "Matteo R.", "Elena G.",
  "Francesco B.", "Chiara D.", "Andrea M.", "Sara L.", "Riccardo F.",
  "Marta V.", "Paolo S.", "Laura B.", "Giovanni M.", "Alessia C.",
  "Simone T.", "Roberta P.", "Gabriele L.", "Monica F.", "Lorenzo S.",
  "Cristina M.", "Alberto R.", "Serena V.", "Daniele C.", "Paola M.",
];

const FIVE_STAR = [
  "Maglia perfetta, qualità eccellente! Il tessuto è leggero e traspirante, identica a quella originale. Spedizione super veloce, arrivata in 3 giorni. Consigliatissima!",
  "Ho personalizzato con nome e numero e il risultato è stupendo. Stampa precisa, colori vivaci. Mio figlio è contentissimo. Sicuramente acquisterò ancora.",
  "Qualità davvero sorprendente per il prezzo. Il tessuto è morbido, i colori corrispondono perfettamente alle foto. Arrivata ben imballata e nei tempi promessi.",
  "Finalmente ho trovato un sito affidabile dove comprare maglie di qualità! Tornerò sicuramente per altri acquisti. Cliente super soddisfatto!",
  "Regalo perfetto per un tifoso! L'ho comprata per il compleanno di mio fratello ed è rimasto senza parole. Qualità premium, spedizione rapidissima.",
  "Terzo acquisto su Goal Mania e non deludono mai. Tessuto traspirante, cuciture solide, colori vivaci. Il miglior rapporto qualità/prezzo sul mercato.",
  "Acquisto più che soddisfacente. La maglia è arrivata perfettamente imballata, il tessuto è di ottima qualità e i dettagli sono curatissimi.",
  "Fantastica! L'ho lavata già 5 volte e i colori rimangono vivaci come il primo giorno. Taglia fedele alle misure indicate. Consigliatissima!",
  "Comprata per guardare la partita con i miei amici: tutti hanno chiesto dove l'ho presa! Qualità altissima, spedizione puntuale. Non ci sono parole.",
  "Ho comprato maglie in tanti posti, ma questa è di gran lunga la migliore qualità che abbia mai ricevuto. Il dettaglio dei ricami è impeccabile.",
  "Mio figlio la indossa ogni giorno, lavata decine di volte e sembra ancora nuova. Tessuto robusto e colori che non sbiadiscono. Top!",
  "Finalmente una maglia che tiene il taglio dopo il lavaggio! Taglia precisa, tessuto morbido al tatto. La spedizione è stata puntualissima.",
  "Sono un cliente abituale e ogni volta rimango stupito dalla qualità. Questa maglia è fantastica, cuciture perfette e tessuto eccellente.",
  "Preso come regalo di Natale: il mio ragazzo era entusiasta quando l'ha aperta. Qualità visibilmente alta, arrivata in tempi record.",
  "Spedizione velocissima, imballaggio curato, maglia di ottima qualità. Non mi aspettavo così tanto. Sicuramente il mio shop preferito per le maglie!",
];

const FOUR_STAR = [
  "Ottima maglia, molto fedele all'originale. Taglia leggermente larga, consiglio di prendere una taglia in meno se siete tra le due. Qualità del materiale ottima.",
  "Bella maglia nel complesso, materiale buono e colori accurati. Perdo una stella solo perché la spedizione ha impiegato qualche giorno in più del previsto.",
  "Molto soddisfatto dell'acquisto. L'unico appunto è che la taglia calza un po' abbondante, ma il tessuto è fantastico e la stampa è di qualità.",
  "Maglia di buona qualità. Mi aspettavo i colori leggermente più accesi come nelle foto, ma nel complesso sono soddisfatto. Spedizione veloce.",
  "Buon acquisto, qualità alta e spedizione puntuale. Avrei preferito un packaging leggermente più curato, ma la maglia in sé è ottima.",
  "Qualità molto buona, cuciture solide e colori precisi. Consiglio di consultare bene la guida taglie perché calza un filo abbondante.",
  "Soddisfatto dell'acquisto. Il tessuto è morbido e traspirante, i colori corrispondono bene alle immagini. Piccolo ritardo nella consegna ma nulla di grave.",
];

// ~70% five-star, ~30% four-star
function pickComment(): { rating: number; comment: string } {
  if (Math.random() < 0.70) {
    return { rating: 5, comment: FIVE_STAR[Math.floor(Math.random() * FIVE_STAR.length)] };
  }
  return { rating: 4, comment: FOUR_STAR[Math.floor(Math.random() * FOUR_STAR.length)] };
}

function randomDate(): Date {
  // Spread across last 8 months (Sep 2025 – May 2026)
  const start = new Date("2025-09-01").getTime();
  const end = new Date("2026-05-20").getTime();
  return new Date(start + Math.random() * (end - start));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("secret") !== SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const products = await Product.find({});
  let seeded = 0;
  let skipped = 0;

  const shuffledNames = shuffle(NAMES);
  let nameIdx = 0;
  const nextName = () => {
    const name = shuffledNames[nameIdx % shuffledNames.length];
    nameIdx++;
    return name;
  };

  for (const product of products) {
    const existingCount = product.reviews?.length ?? 0;
    if (existingCount > 0) {
      skipped++;
      continue;
    }

    // 3-5 reviews per product
    const count = 3 + Math.floor(Math.random() * 3);
    const reviews = [];

    for (let i = 0; i < count; i++) {
      const { rating, comment } = pickComment();
      const createdAt = randomDate();
      reviews.push({
        userId: `seed_${Math.random().toString(36).slice(2, 10)}`,
        userName: nextName(),
        rating,
        comment,
        media: { images: [], videos: [] },
        createdAt,
        updatedAt: createdAt,
      });
    }

    // Sort by date asc before saving
    reviews.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    product.reviews.push(...reviews);
    await product.save();
    seeded++;
  }

  return NextResponse.json({
    success: true,
    seeded,
    skipped,
    total: products.length,
  });
}
