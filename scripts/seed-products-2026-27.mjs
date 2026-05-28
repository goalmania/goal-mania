/**
 * Seed script — inserisce 63 prodotti stagione 2026/27 su MongoDB
 * Run: node scripts/seed-products-2026-27.mjs
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error("MONGODB_URI not found"); process.exit(1); }

// ─── Schema (mirror del modello reale) ───────────────────────────────────────
const reviewSchema = new mongoose.Schema({
  userId: String, userName: String,
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  basePrice: { type: Number, default: 30 },
  retroPrice: { type: Number, default: 35 },
  shippingPrice: { type: Number, default: 0 },
  stockQuantity: { type: Number, default: 100 },
  images: { type: [String], default: ["/images/image.png"] },
  videos: { type: [String], default: [] },
  hasLongSleeve: { type: Boolean, default: false },
  longSleevePriceAddon: { type: Number, default: 10 },
  hasShorts: { type: Boolean, default: true },
  hasSocks: { type: Boolean, default: true },
  hasPlayerEdition: { type: Boolean, default: true },
  isWorldCup: { type: Boolean, default: false },
  isRetro: { type: Boolean, default: false },
  isMysteryBox: { type: Boolean, default: false },
  country: { type: String, default: "" },
  nationalTeam: { type: String, default: "" },
  adultSizes: { type: [String], default: ["S","M","L","XL","XXL"] },
  kidsSizes: { type: [String], default: [] },
  category: { type: String, required: true },
  allowsNumberOnShirt: { type: Boolean, default: true },
  allowsNameOnShirt: { type: Boolean, default: true },
  slug: { type: String, unique: true, lowercase: true, trim: true },
  isActive: { type: Boolean, default: true },
  feature: { type: Boolean, default: false },
  reviews: { type: [reviewSchema], default: [] },
}, { timestamps: true });

productSchema.pre("validate", function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
  next();
});

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

// ─── Dati squadre ─────────────────────────────────────────────────────────────
const SERIE_A = [
  { name: "Inter",      league: "Serie A", leagueIt: "Serie A", country: "Italia",   category: "SerieA" },
  { name: "Milan",      league: "Serie A", leagueIt: "Serie A", country: "Italia",   category: "SerieA" },
  { name: "Juventus",   league: "Serie A", leagueIt: "Serie A", country: "Italia",   category: "SerieA" },
  { name: "Napoli",     league: "Serie A", leagueIt: "Serie A", country: "Italia",   category: "SerieA" },
  { name: "Roma",       league: "Serie A", leagueIt: "Serie A", country: "Italia",   category: "SerieA" },
  { name: "Lazio",      league: "Serie A", leagueIt: "Serie A", country: "Italia",   category: "SerieA" },
  { name: "Atalanta",   league: "Serie A", leagueIt: "Serie A", country: "Italia",   category: "SerieA" },
  { name: "Fiorentina", league: "Serie A", leagueIt: "Serie A", country: "Italia",   category: "SerieA" },
];

const PREMIER = [
  { name: "Manchester City",   league: "Premier League", leagueIt: "Premier League", country: "Inghilterra", category: "PremierLeague" },
  { name: "Liverpool",         league: "Premier League", leagueIt: "Premier League", country: "Inghilterra", category: "PremierLeague" },
  { name: "Arsenal",           league: "Premier League", leagueIt: "Premier League", country: "Inghilterra", category: "PremierLeague" },
  { name: "Chelsea",           league: "Premier League", leagueIt: "Premier League", country: "Inghilterra", category: "PremierLeague" },
  { name: "Manchester United", league: "Premier League", leagueIt: "Premier League", country: "Inghilterra", category: "PremierLeague" },
  { name: "Tottenham",         league: "Premier League", leagueIt: "Premier League", country: "Inghilterra", category: "PremierLeague" },
  { name: "Newcastle",         league: "Premier League", leagueIt: "Premier League", country: "Inghilterra", category: "PremierLeague" },
  { name: "Aston Villa",       league: "Premier League", leagueIt: "Premier League", country: "Inghilterra", category: "PremierLeague" },
];

const EUROPE = [
  { name: "Real Madrid",       league: "La Liga",       leagueIt: "Liga",        country: "Spagna",     category: "Champions" },
  { name: "Barcelona",         league: "La Liga",       leagueIt: "Liga",        country: "Spagna",     category: "Champions" },
  { name: "Bayern Monaco",     league: "Bundesliga",    leagueIt: "Bundesliga",  country: "Germania",   category: "Champions" },
  { name: "PSG",               league: "Ligue 1",       leagueIt: "Ligue 1",     country: "Francia",    category: "Champions" },
  { name: "Borussia Dortmund", league: "Bundesliga",    leagueIt: "Bundesliga",  country: "Germania",   category: "Champions" },
];

const ALL_TEAMS = [...SERIE_A, ...PREMIER, ...EUROPE];
const KITS = ["Home", "Away", "Third"];

// ─── Generatore descrizione SEO ───────────────────────────────────────────────
function buildDescription(team, kit, league, leagueIt, country) {
  const kitIt = kit === "Home" ? "casa" : kit === "Away" ? "trasferta" : "third";
  const kitDesc = {
    Home: "la divisa ufficiale da casa",
    Away: "la divisa ufficiale da trasferta",
    Third: "la terza divisa ufficiale",
  }[kit];

  return `Acquista la Maglia ${team} ${kit} 2026/27 su Goal Mania a soli €30. ${kitDesc} del ${team} per la stagione ${league} 2026/27. Disponibile in tutte le taglie adulto (S, M, L, XL, XXL). Possibilità di personalizzazione con nome e numero del tuo giocatore preferito. Spedizione gratuita in tutta Italia. Consegna in 3-5 giorni lavorativi. La maglia ${team} ${kitIt} 2026/27 è il regalo perfetto per ogni tifoso.`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.\n");

  let created = 0;
  let skipped = 0;

  for (const team of ALL_TEAMS) {
    for (const kit of KITS) {
      const title = `Maglia ${team.name} ${kit} 2026/27`;
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      const existing = await Product.findOne({ slug });
      if (existing) {
        console.log(`  SKIP  ${title} (già presente)`);
        skipped++;
        continue;
      }

      const description = buildDescription(team.name, kit, team.league, team.leagueIt, team.country);

      await Product.create({
        title,
        description,
        basePrice: 30,
        retroPrice: 35,
        shippingPrice: 0,
        stockQuantity: 100,
        images: ["/images/image.png"],
        category: team.category,
        isRetro: false,
        isWorldCup: false,
        isMysteryBox: false,
        hasShorts: true,
        hasSocks: true,
        hasPlayerEdition: true,
        hasLongSleeve: false,
        longSleevePriceAddon: 10,
        adultSizes: ["S", "M", "L", "XL", "XXL"],
        kidsSizes: [],
        allowsNumberOnShirt: true,
        allowsNameOnShirt: true,
        isActive: true,
        feature: false,
        slug,
        reviews: [],
      });

      console.log(`  OK    ${title}`);
      created++;
    }
  }

  console.log(`\nDone. Creati: ${created}, Saltati (già esistenti): ${skipped}`);
  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
