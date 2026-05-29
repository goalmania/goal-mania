import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://goalmania_admin:zYgAFNwlwUhaaP7E@goalmania.uaiea.mongodb.net/GoalMania?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  await mongoose.connect(MONGODB_URI);
  const Article = mongoose.connection.db!.collection("articles");

  // Lista tutti gli articoli AI
  const all = await Article.find(
    { author: { $in: ["Goal Mania AI", "Redazione Goalmania"] } },
    { projection: { title: 1, publishedAt: 1, author: 1, slug: 1 } }
  ).sort({ publishedAt: -1 }).toArray();

  console.log(`\n📋 Trovati ${all.length} articoli AI:\n`);
  all.forEach((a, i) => {
    const date = a.publishedAt ? new Date(a.publishedAt).toISOString().slice(0, 10) : "no-date";
    console.log(`${i + 1}. [${date}] ${a.author} | ${String(a.title).slice(0, 65)}`);
  });

  // Parole chiave che indicano articoli non calcistici o da feed stale
  const BAD_KEYWORDS = [
    "goggia", "brignone", "superg", "sci alpino",
    "pugilato", "ring alla vita", "massimo pericolo",
    "razzisti e sciarpe", "derby della mole",     // da Gazzetta 2023
    "esultanze che raccontano",                   // Thuram da Gazzetta 2023
    "anima storica dell'inter: esultanze",
  ];

  const toDelete = all.filter(a => {
    const title = String(a.title).toLowerCase();
    return BAD_KEYWORDS.some(kw => title.includes(kw));
  });

  if (toDelete.length === 0) {
    console.log("\n✅ Nessun articolo da eliminare.");
  } else {
    console.log(`\n🗑️  Articoli da eliminare (${toDelete.length}):`);
    toDelete.forEach(a => console.log("  - " + a.title));

    const ids = toDelete.map(a => a._id);
    const result = await Article.deleteMany({ _id: { $in: ids } });
    console.log(`\n✅ Eliminati ${result.deletedCount} articoli.`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
