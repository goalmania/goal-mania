/**
 * Carica i video della galleria "Ordini reali" su Cloudinary.
 *
 *   node scripts/upload-gallery-to-cloudinary.mjs [file1.mp4 file2.mp4 ...]
 *
 * Senza argomenti: carica tutti i public/gallery/video-*.mp4
 * Con argomenti: carica i file passati (usati per i blocchi nuovi partendo
 * dagli originali non compressi -> ci pensa Cloudinary con q_auto).
 *
 * public_id: goalmania/gallery/video-XX   (overwrite: true, idempotente)
 * Le credenziali arrivano da CLOUDINARY_URL in .env.production.local
 */
import { v2 as cloudinary } from "cloudinary";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, basename } from "node:path";

const root = resolve(import.meta.dirname, "..");

// --- credenziali ---------------------------------------------------------
const envRaw = readFileSync(resolve(root, ".env.production.local"), "utf8");
const cldUrl = envRaw
  .split("\n")
  .find((l) => l.startsWith("CLOUDINARY_URL="))
  ?.slice("CLOUDINARY_URL=".length)
  .trim()
  .replace(/^["']|["']$/g, "");

if (!cldUrl) {
  console.error("CLOUDINARY_URL non trovata in .env.production.local");
  process.exit(1);
}
const u = new URL(cldUrl.replace("cloudinary://", "https://"));
cloudinary.config({
  cloud_name: u.hostname,
  api_key: u.username,
  api_secret: u.password,
  secure: true,
});
console.log("cloud:", u.hostname);

// --- file da caricare --------------------------------------------------
const args = process.argv.slice(2);
let files;
if (args.length) {
  files = args.map((a) => resolve(a));
} else {
  const dir = resolve(root, "public/gallery");
  files = readdirSync(dir)
    .filter((f) => /^video-\d+\.mp4$/.test(f))
    .sort()
    .map((f) => resolve(dir, f));
}

if (!files.length) {
  console.error("nessun file da caricare");
  process.exit(1);
}

// mappa nome file -> numero (video-07.mp4 -> 7 ; document_...560.mp4 -> chiedi)
function publicIdFor(file) {
  const name = basename(file);
  const m = name.match(/video-(\d+)\.mp4$/);
  if (m) return `goalmania/gallery/video-${String(+m[1]).padStart(2, "0")}`;
  // fallback: usa il nome del file senza estensione
  return `goalmania/gallery/${name.replace(/\.mp4$/, "")}`;
}

let ok = 0;
for (const file of files) {
  const public_id = publicIdFor(file);
  process.stdout.write(`↑ ${basename(file)} -> ${public_id} ... `);
  try {
    const res = await cloudinary.uploader.upload(file, {
      resource_id: undefined,
      public_id,
      resource_type: "video",
      overwrite: true,
      invalidate: true,
      // niente audio nella galleria
      // (le trasformazioni di delivery le mettiamo nell'URL del manifest)
    });
    console.log(`${res.width}x${res.height} ${(res.bytes / 1e6).toFixed(1)}MB`);
    ok++;
  } catch (e) {
    console.log("ERRORE");
    console.error(e?.message || e);
  }
}
console.log(`\nFatto: ${ok}/${files.length} caricati.`);
