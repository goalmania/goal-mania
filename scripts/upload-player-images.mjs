/**
 * upload-player-images.mjs
 * Carica le foto dei prodotti "giocatore" trovando la cartella corrispondente
 * nell'archivio rimuovendo il prefisso giocatore dal slug.
 *
 * Uso: node scripts/upload-player-images.mjs [--dry-run]
 */

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env.local") });

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  ADMIN_UPDATE_TOKEN,
} = process.env;

if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !ADMIN_UPDATE_TOKEN) {
  console.error(
    "Variabili mancanti in .env.local: CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, ADMIN_UPDATE_TOKEN"
  );
  process.exit(1);
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME || "do04e87p5",
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const ADMIN_TOKEN = ADMIN_UPDATE_TOKEN;
const SITE_URL = "https://goal-mania.it";
const ARCHIVE_BASE = path.join(
  process.env.HOME,
  "Downloads/maglie_archivio/Squadre"
);
const DRY_RUN = process.argv.includes("--dry-run");

// Prefissi giocatore da rimuovere per trovare la cartella archivio
const PLAYER_PREFIXES = [
  "messi-",
  "zidane-",
  "ronaldinho-",
  "neymar-",
  "baggio-",
  "chicharito-",
  "maradona-",
  "cristiano-ronaldo-cr7-",
  "kaka-",
  "kak-",  // Kaká può avere encoding strano
];

// Correzioni manuali: slug-base → cartella archivio (se il nome differisce)
const MANUAL_OVERRIDES = {
  // Kaká — slug usa "kak-" (à rimosso), archivio usa "Milan" non "AC Milan"
  "maglia-kak-ac-milan-home-2006-07": "Milan/maglia-milan-home-2006-07",
  "maglia-kak-ac-milan-home-2007-08": "Milan/maglia-milan-home-2007-08",
  "maglia-kak-ac-milan-home-long-2007-08": "Milan/maglia-milan-home-long-2007-08",
  "maglia-kak-ac-milan-third-2007-08": "Milan/maglia-milan-third-2007-08",
  "maglia-kak-ac-milan-away-2007-08": "Milan/maglia-milan-away-2007-08",
  "maglia-kak-ac-milan-home-long-2006-07": "Milan/maglia-milan-home-long-2006-07",
  "maglia-kak-ac-milan-away-2006-07-finale-ucl": "Milan/maglia-milan-away-2006-07-finale-ucl",
  "maglia-kak-ac-milan-home-2004-05": "Milan/maglia-milan-home-2004-05",
  "maglia-kak-real-madrid-home-2009-10": "Real Madrid/maglia-real-madrid-home-2013-14",
  "maglia-kak-brasile-home-2002": "Brasile/maglia-brasile-home-2002",
  "maglia-kak-brasile-home-2004": "Brasile/maglia-brasile-home-2004",
  // CR7 Sporting Lisbona
  "maglia-cristiano-ronaldo-cr7-sporting-l-home-2003": "Sporting Lisbona/maglia-sporting-lisbona-home-2003-04",
  // CR7 Real Madrid anni con formato diverso
  "maglia-cristiano-ronaldo-cr7-real-madrid-long-home-2018": "Real Madrid/maglia-real-madrid-home-final-ucl-long-2017-18",
  "maglia-cristiano-ronaldo-cr7-real-madrid-home-2018": "Real Madrid/maglia-real-madrid-home-2017-18",
  "maglia-cristiano-ronaldo-cr7-real-madrid-third-2018": "Real Madrid/maglia-real-madrid-third-2017-18",
  "maglia-cristiano-ronaldo-cr7-real-madrid-away-long-2017": "Real Madrid/maglia-real-madrid-away-long-2017-18",
  "maglia-cristiano-ronaldo-cr7-real-madrid-away-2017": "Real Madrid/maglia-real-madrid-away-2016-17-finale-ucl",
  "maglia-cristiano-ronaldo-cr7-real-madrid-third-2015": "Real Madrid/maglia-real-madrid-third-2014-15",
  "maglia-cristiano-ronaldo-cr7-real-madrid-home-2016": "Real Madrid/maglia-real-madrid-home-white-long-2015-16",
  "maglia-cristiano-ronaldo-cr7-portogallo-away-2012": "Portogallo/maglia-portogallo-away-2012-finale-europei",
  "maglia-cristiano-ronaldo-cr7-portogallo-home-2016": "Portogallo/maglia-portogallo-home-2016-vittoria-europei",
  // CR7 Manchester United
  "maglia-cristiano-ronaldo-cr7-m-united-home-2009": "Man. United/maglia-man-united-home-long-2009-2010",
  "maglia-cristiano-ronaldo-cr7-m-united-away-2008": "Man. United/maglia-man-united-away-2007-08-premier-league",
  "maglia-cristiano-ronaldo-cr7-m-united-home-2008": "Man. United/maglia-man-united-home-2007-08-finale-ucl",
  // Barcellona UCL
  "maglia-messi-barcellona-home-finale-ucl-2010-11": "Barcellona/maglia-barcellona-home-final-ucl-2010-11",
  "maglia-messi-barcellona-home-final-ucl-2014-15": "Barcellona/maglia-barcellona-home-2014-15-finale-ucl",
  "maglia-neymar-barcellona-home-final-ucl-2014-15": "Barcellona/maglia-barcellona-home-2014-15-finale-ucl",
  "maglia-neymar-barcellona-home-long-sleeve-2014-15": "Barcellona/maglia-barcellona-home-long-2014-15",
  // Santos e PSG
  "maglia-neymar-santos-home-2012-13": "Santos/maglia-santos-home-2012-2013",
  "maglia-neymar-psg-fourth-2019-20": "PSG/maglia-psg-away-fourth-2019-20",
  // Maradona Napoli
  "maglia-maradona-napoli-home-1987-88": "Napoli/maglia-napoli-home-1987-88",
  // Baggio
  "maglia-baggio-italia-away-white-1999-00": "Italia/maglia-italia-away-white-1999-00",
  "maglia-baggio-italia-away-1998-99": "Italia/maglia-italia-away-1998-99",
  "maglia-baggio-inter-home-1998-99": "Inter/maglia-inter-home-1998-99",
  "maglia-baggio-milan-home-1995-96": "Milan/maglia-milan-home-1995-96",
  // Ronaldinho
  "maglia-ronaldinho-brasile-home-2002": "Brasile/maglia-brasile-home-2002",
  "maglia-ronaldinho-brasile-home-2004": "Brasile/maglia-brasile-home-2004",
  "maglia-ronaldinho-milan-home-2010-11": "Milan/maglia-milan-home-2010-11",
  // Zidane
  "maglia-zidane-francia-away-1998": "Francia/maglia-francia-away-1998",
};

// Costruisce indice di tutte le sottocartelle dell'archivio
function buildArchiveIndex() {
  const index = {}; // slug → percorso assoluto
  const teams = fs.readdirSync(ARCHIVE_BASE).filter(t =>
    fs.statSync(path.join(ARCHIVE_BASE, t)).isDirectory()
  );
  for (const team of teams) {
    const teamPath = path.join(ARCHIVE_BASE, team);
    const slugs = fs.readdirSync(teamPath).filter(s =>
      fs.statSync(path.join(teamPath, s)).isDirectory()
    );
    for (const slug of slugs) {
      index[slug] = path.join(teamPath, slug);
    }
  }
  return index;
}

// Trova la cartella archivio per un product slug
function findArchiveFolder(productSlug, archiveIndex) {
  // 1. Override manuale
  if (MANUAL_OVERRIDES[productSlug]) {
    const rel = MANUAL_OVERRIDES[productSlug];
    const abs = path.join(ARCHIVE_BASE, rel);
    if (fs.existsSync(abs)) return abs;
  }

  // 2. Rimuovi prefisso giocatore e cerca direttamente
  for (const prefix of PLAYER_PREFIXES) {
    const marker = `maglia-${prefix}`;
    if (productSlug.startsWith(marker)) {
      const baseSlug = "maglia-" + productSlug.slice(marker.length);
      if (archiveIndex[baseSlug]) return archiveIndex[baseSlug];
    }
  }

  // 3. Fallback: cerca per somiglianza parziale (rimuovi parole del giocatore)
  return null;
}

// Raccoglie le immagini dalla cartella (ordinata)
function getImages(folderPath) {
  return fs
    .readdirSync(folderPath)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort()
    .map(f => path.join(folderPath, f));
}

// Carica su Cloudinary
async function uploadToCloudinary(filePath, publicId) {
  return cloudinary.uploader.upload(filePath, {
    public_id: publicId,
    folder: "goal-mania/products/retro",
    overwrite: true,
    resource_type: "image",
  });
}

// Aggiorna il DB via API
async function updateProductImages(slug, images) {
  const res = await fetch(`${SITE_URL}/api/update-product-images`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-token": ADMIN_TOKEN },
    body: JSON.stringify({ updates: [{ slug, images }] }),
  });
  return res.json();
}

// Fetch prodotti senza immagine
async function fetchNoImageProducts() {
  const noImg = [];
  for (let page = 1; page <= 10; page++) {
    const res = await fetch(
      `${SITE_URL}/api/products?category=Retro&limit=100&includeInactive=false&page=${page}`
    );
    const data = await res.json();
    const prods = data.products || [];
    if (!prods.length) break;
    for (const p of prods) {
      const imgs = p.images || [];
      if (!imgs.length || imgs[0] === "/images/image.png" || imgs[0] === "") {
        noImg.push({ slug: p.slug, title: p.title });
      }
    }
    if (prods.length < 100) break;
  }
  return noImg;
}

async function main() {
  console.log(DRY_RUN ? "🔍 DRY RUN" : "🚀 UPLOAD REALE");
  console.log("Costruisco indice archivio...");
  const archiveIndex = buildArchiveIndex();
  console.log(`  ${Object.keys(archiveIndex).length} cartelle trovate\n`);

  console.log("Fetch prodotti senza immagine...");
  const products = await fetchNoImageProducts();
  console.log(`  ${products.length} prodotti da processare\n`);

  let matched = 0, uploaded = 0, notFound = 0, errors = 0;
  const notFoundList = [];

  for (const { slug, title } of products) {
    const folderPath = findArchiveFolder(slug, archiveIndex);

    if (!folderPath) {
      console.log(`❌ NON TROVATO: ${slug}`);
      notFoundList.push({ slug, title });
      notFound++;
      continue;
    }

    const images = getImages(folderPath);
    if (!images.length) {
      console.log(`⚠️  CARTELLA VUOTA: ${slug} → ${folderPath}`);
      notFound++;
      continue;
    }

    matched++;
    console.log(`\n✅ MATCH: ${slug}`);
    console.log(`   📁 ${path.relative(ARCHIVE_BASE, folderPath)}`);
    console.log(`   🖼️  ${images.length} immagini`);

    if (DRY_RUN) continue;

    // Upload immagini
    const cloudinaryUrls = [];
    for (let i = 0; i < images.length; i++) {
      const publicId = `${slug}_${i + 1}`;
      try {
        const result = await uploadToCloudinary(images[i], publicId);
        cloudinaryUrls.push(result.secure_url);
        process.stdout.write(`   ⬆️  Upload ${i + 1}/${images.length}: OK\n`);
      } catch (err) {
        console.error(`   ❌ Upload errore: ${err.message}`);
        errors++;
      }
    }

    if (cloudinaryUrls.length > 0) {
      try {
        await updateProductImages(slug, cloudinaryUrls);
        console.log(`   💾 DB aggiornato`);
        uploaded++;
      } catch (err) {
        console.error(`   ❌ DB errore: ${err.message}`);
        errors++;
      }
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`RISULTATI:`);
  console.log(`  ✅ Match trovati: ${matched}`);
  if (!DRY_RUN) console.log(`  ⬆️  Prodotti aggiornati: ${uploaded}`);
  console.log(`  ❌ Non trovati: ${notFound}`);
  if (errors) console.log(`  ⚠️  Errori: ${errors}`);

  if (notFoundList.length) {
    console.log("\nProdotti senza corrispondenza nell'archivio:");
    notFoundList.forEach(p => console.log(`  - ${p.title} (${p.slug})`));
  }
}

main().catch(console.error);
