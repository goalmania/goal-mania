/**
 * migrate-images.mjs
 * Trova tutti i prodotti con immagini non-Cloudinary o rotte,
 * le re-uploada su Cloudinary e aggiorna il DB.
 *
 * Uso: node scripts/migrate-images.mjs
 */

import { MongoClient } from "mongodb";
import { createHash } from "crypto";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}
const CLOUDINARY_CLOUD = "do04e87p5";
const CLOUDINARY_UPLOAD_PRESET = "ml_default";
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`;

function isCloudinary(url) {
  return url && url.includes("res.cloudinary.com");
}

async function isAccessible(url) {
  try {
    const fullUrl = url.startsWith("/")
      ? `https://goal-mania.it${url}`
      : url;
    const res = await fetch(fullUrl, { method: "HEAD", signal: AbortSignal.timeout(8000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function uploadToCloudinary(url) {
  const fullUrl = url.startsWith("/") ? `https://goal-mania.it${url}` : url;
  const form = new FormData();
  form.append("file", fullUrl);
  form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  form.append("folder", "goal-mania/products");

  const res = await fetch(UPLOAD_URL, { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudinary upload failed: ${err}`);
  }
  const data = await res.json();
  return data.secure_url;
}

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db("GoalMania");
  const col = db.collection("products");

  const products = await col.find({}, { projection: { _id: 1, title: 1, images: 1 } }).toArray();
  console.log(`\n📦 Trovati ${products.length} prodotti totali\n`);

  let fixed = 0;
  let skipped = 0;
  let errors = 0;

  for (const product of products) {
    const images = product.images || [];
    if (images.length === 0) continue;

    const newImages = [];
    let changed = false;

    for (const img of images) {
      if (!img) { newImages.push(img); continue; }

      if (isCloudinary(img)) {
        newImages.push(img);
        continue;
      }

      // Non è Cloudinary — verifica se è accessibile
      const ok = await isAccessible(img);
      if (ok) {
        // Accessibile ma non Cloudinary — re-upload
        console.log(`⬆️  [${product.title}] Re-upload: ${img.slice(0, 60)}...`);
        try {
          const newUrl = await uploadToCloudinary(img);
          newImages.push(newUrl);
          changed = true;
          console.log(`   ✅ → ${newUrl.slice(0, 60)}...`);
        } catch (e) {
          console.log(`   ❌ Upload fallito: ${e.message}`);
          newImages.push(img);
          errors++;
        }
      } else {
        console.log(`❌ [${product.title}] Immagine inaccessibile: ${img.slice(0, 60)}`);
        newImages.push(img);
        errors++;
      }
    }

    if (changed) {
      await col.updateOne({ _id: product._id }, { $set: { images: newImages } });
      fixed++;
      console.log(`   💾 DB aggiornato\n`);
    } else {
      skipped++;
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Prodotti fixati:   ${fixed}`);
  console.log(`⏭️  Già ok (skip):    ${skipped}`);
  console.log(`❌ Errori:            ${errors}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  await client.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
