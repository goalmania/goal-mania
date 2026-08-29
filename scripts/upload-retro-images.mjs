#!/usr/bin/env node
/**
 * upload-retro-images.mjs
 * Carica le foto delle maglie retro dall'archivio locale su Cloudinary
 * e aggiorna i prodotti tramite l'API /api/update-product-images.
 *
 * Uso: node scripts/upload-retro-images.mjs
 * Dry run: node scripts/upload-retro-images.mjs --dry-run
 * Solo un team: node scripts/upload-retro-images.mjs --team Arsenal
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import FormData from "form-data";
import * as dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.production.local") });

const CLOUDINARY_CLOUD = "do04e87p5";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`;
const CLOUDINARY_API_KEY = "669869849348577";
const CLOUDINARY_API_SECRET = "XGE9WXGv9cUhGrBG5uKepyZLPpU";
const ADMIN_TOKEN = "cc5a27994a86cb80c7b72a7da26cb852";
const SITE_URL = "https://goal-mania.it";

const ARCHIVE_BASE = path.join(process.env.HOME, "Downloads/maglie_archivio/Squadre");
const DRY_RUN = process.argv.includes("--dry-run");
const TEAM_FILTER = (() => {
  const idx = process.argv.indexOf("--team");
  return idx !== -1 ? process.argv[idx + 1] : null;
})();

async function uploadToCloudinary(filePath, slug, idx) {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));
  form.append("folder", "goal-mania/products/retro");
  form.append("public_id", `${slug}_${idx}`);
  form.append("overwrite", "true");

  const credentials = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString("base64");
  const res = await fetch(CLOUDINARY_URL, {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}`, ...form.getHeaders() },
    body: form,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudinary: ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.secure_url;
}

async function updateProductImages(slug, images) {
  const res = await fetch(`${SITE_URL}/api/update-product-images`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-token": ADMIN_TOKEN },
    body: JSON.stringify({ updates: [{ slug, images }] }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data.results?.[0];
}

async function main() {
  console.log(DRY_RUN ? "🔍 DRY RUN — nessuna modifica\n" : "🚀 Upload reale su Cloudinary + DB\n");
  if (TEAM_FILTER) console.log(`🎯 Solo team: ${TEAM_FILTER}\n`);

  // Raccogli slug dall'archivio
  const archiveSlugs = {};
  const teams = fs.readdirSync(ARCHIVE_BASE).filter(t =>
    !TEAM_FILTER || t.toLowerCase() === TEAM_FILTER.toLowerCase()
  );

  for (const team of teams) {
    const teamPath = path.join(ARCHIVE_BASE, team);
    if (!fs.statSync(teamPath).isDirectory()) continue;
    for (const slug of fs.readdirSync(teamPath)) {
      const slugPath = path.join(teamPath, slug);
      if (!fs.statSync(slugPath).isDirectory()) continue;
      const imgs = fs.readdirSync(slugPath)
        .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
        .sort();
      if (imgs.length > 0) {
        archiveSlugs[slug] = { team, path: slugPath, imgs };
      }
    }
  }

  console.log(`📁 Slug archivio trovati: ${Object.keys(archiveSlugs).length}`);

  let uploaded = 0, skipped = 0, errors = 0;
  const errorLog = [];
  const slugList = Object.keys(archiveSlugs);

  for (let i = 0; i < slugList.length; i++) {
    const slug = slugList[i];
    const archive = archiveSlugs[slug];
    const progress = `[${i + 1}/${slugList.length}]`;

    if (DRY_RUN) {
      console.log(`${progress} [DRY] ${slug} — ${archive.imgs.length} foto`);
      skipped++;
      continue;
    }

    console.log(`${progress} 📸 ${slug}`);
    try {
      const newUrls = [];
      for (let j = 0; j < archive.imgs.length; j++) {
        const filePath = path.join(archive.path, archive.imgs[j]);
        const url = await uploadToCloudinary(filePath, slug, j + 1);
        newUrls.push(url);
        process.stdout.write(`   ✅ img${j + 1} caricata\n`);
      }

      const result = await updateProductImages(slug, newUrls);
      if (result?.status === "not_found") {
        console.log(`   ⚠️  Prodotto non trovato nel DB (slug: ${slug})\n`);
        errors++;
        errorLog.push({ slug, error: "not_found" });
      } else {
        console.log(`   💾 DB aggiornato con ${newUrls.length} immagini\n`);
        uploaded++;
      }
    } catch (err) {
      console.error(`   ❌ Errore: ${err.message}\n`);
      errorLog.push({ slug, error: err.message });
      errors++;
    }

    await new Promise(r => setTimeout(r, 400));
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Caricati:   ${uploaded}`);
  console.log(`⏭️  Saltati:   ${skipped}`);
  console.log(`❌ Errori:     ${errors}`);
  if (errorLog.length) {
    console.log("\nSlug con errori:");
    errorLog.forEach(e => console.log(`  ${e.slug}: ${e.error}`));
  }
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
