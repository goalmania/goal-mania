/**
 * Seed script — aggiunge la maglia Argentina "ultima partita Messi" (6 ottobre 2026 vs Benin)
 * e l'articolo news collegato (con featuredJerseyId per il box "Shop" automatico).
 * Run: node scripts/add-argentina-messi-addio-2026.mjs
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error("MONGODB_URI not found"); process.exit(1); }

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

const articleImageSchema = new mongoose.Schema({
  id: String, url: String, alt: String, isMain: Boolean,
}, { _id: false });

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  summary: { type: String, required: true },
  image: { type: String, required: true },
  images: { type: [articleImageSchema], default: [] },
  category: { type: String, required: true, enum: ["news", "transferMarket", "serieA", "internationalTeams"] },
  league: String,
  author: { type: String, required: true },
  status: { type: String, required: true, enum: ["draft", "published"], default: "draft" },
  publishedAt: Date,
  slug: { type: String, required: true, unique: true },
  featured: { type: Boolean, default: false },
  featuredJerseyId: String,
  seoKeywords: { type: [String], default: [] },
  views: { type: Number, default: 0 },
}, { timestamps: true });

articleSchema.pre("validate", function (next) {
  if (this.title) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  next();
});
articleSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

const Article = mongoose.models.Article || mongoose.model("Article", articleSchema);

const PLACEHOLDER_IMAGE =
  "https://res.cloudinary.com/goal-mania/image/upload/v1717608995/jersey-placeholder_qclytm.jpg";

const product = {
  title: "Maglia Argentina Ultima Partita Messi 2026",
  description:
    "Il 6 ottobre 2026 Lionel Messi ha giocato la sua ultima partita con la nazionale argentina, contro il Benin, al Monumental di Buenos Aires. Per l'occasione Adidas e AFA hanno presentato una maglia che abbandona le classiche strisce verticali: una fascia bianca centrale su base celeste, il Sol de Mayo dorato su petto e schiena, la M personale di Messi al posto del logo tecnico, nome e numero 10 in oro. Questa è la versione replica da collezione di quella maglia, taglie S-XXL, personalizzabile con nome e numero sul retro.",
  basePrice: 35,
  retroPrice: 35,
  shippingPrice: 0,
  stockQuantity: 25,
  images: [PLACEHOLDER_IMAGE],
  hasShorts: false,
  hasSocks: false,
  hasPlayerEdition: true,
  // true: inquadra il prodotto nel bucket "maglie nazionali" del sito (schema.org category,
  // breadcrumb "Mondiali", /shop/worldcup) e sblocca le keyword automatiche "maglia argentina",
  // "maglia argentina 2026" ecc. in buildProductKeywords — la descrizione resta comunque
  // precisa sul fatto che è la maglia dell'addio, non una maglia del Mondiale 2026.
  isWorldCup: true,
  isRetro: false,
  country: "Argentina",
  nationalTeam: "Argentina",
  adultSizes: ["S", "M", "L", "XL", "XXL"],
  kidsSizes: [],
  category: "Edizioni Limitate",
  allowsNumberOnShirt: true,
  allowsNameOnShirt: true,
  isActive: true,
  feature: true,
};

const articleContent = `
<p>Il 6 ottobre 2026 Lionel Messi ha giocato la sua ultima partita con la nazionale argentina. L'avversario era il Benin, in amichevole al Monumental di Buenos Aires: lo stesso stadio dove nel 2022 l'Albiceleste aveva festeggiato la qualificazione al Mondiale vinto poi in Qatar.</p>
<p>Per l'occasione Adidas e la federazione argentina (AFA) hanno presentato una maglia pensata apposta per l'addio. Il disegno rompe con le classiche strisce verticali: al centro corre un'unica fascia bianca su base celeste, mentre il Sol de Mayo, il sole dorato della bandiera argentina, è stampato su petto e schiena. Al posto del logo tecnico Adidas c'è la M personale di Messi, e sul retro il nome e il numero 10 sono riprodotti in oro.</p>
<p>Messi ha annunciato la maglia su Instagram con una frase breve: "Ultima partita... Una maglia per tutta la vita".</p>
<p>Sul petto resta lo stemma dell'AFA con le tre stelle dei Mondiali vinti nel 1978, nel 1986 e nel 2022. La maglia non sostituisce la prima o la seconda divisa della nazionale: è una tiratura legata solo a questa partita.</p>
<p>Su Goal Mania è disponibile la versione replica da collezione di quella maglia, nelle taglie dalla S alla XXL e personalizzabile con nome e numero.</p>
`.trim();

const article = {
  title: "Messi, l'ultima con l'Argentina: la maglia speciale per l'addio al Monumental",
  summary:
    "Il 6 ottobre Messi gioca la sua ultima partita con l'Argentina, contro il Benin al Monumental. Ecco la maglia speciale disegnata da Adidas per l'occasione.",
  content: articleContent,
  image: PLACEHOLDER_IMAGE,
  category: "news",
  author: "Redazione Goalmania",
  status: "published",
  featured: true,
  seoKeywords: [
    "maglia argentina messi",
    "maglia messi ultima partita",
    "maglia argentina 2026",
    "maglia addio messi argentina",
    "ultima partita messi argentina benin",
    "maglia celebrativa argentina messi",
  ],
};

async function run() {
  await mongoose.connect(MONGODB_URI, { dbName: "GoalMania" });
  console.log("Connesso a MongoDB");

  const productSlug = product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const existingProduct = await Product.findOne({ slug: productSlug });
  if (existingProduct) {
    console.log(`Prodotto già presente con slug ${productSlug}, aggiorno i campi principali.`);
    await Product.updateOne({ slug: productSlug }, { $set: product });
  } else {
    await Product.create({ ...product, slug: productSlug });
    console.log(`Prodotto creato con slug ${productSlug}`);
  }

  const articleSlug = article.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const articleData = { ...article, slug: articleSlug, featuredJerseyId: productSlug, publishedAt: new Date() };
  const existingArticle = await Article.findOne({ slug: articleSlug });
  if (existingArticle) {
    console.log(`Articolo già presente con slug ${articleSlug}, aggiorno i campi principali.`);
    await Article.updateOne({ slug: articleSlug }, { $set: articleData });
  } else {
    await Article.create(articleData);
    console.log(`Articolo creato con slug ${articleSlug}, collegato alla maglia ${productSlug}`);
  }

  await mongoose.disconnect();
  console.log("Fatto.");
}

run().catch((err) => {
  console.error("Errore:", err);
  process.exit(1);
});
