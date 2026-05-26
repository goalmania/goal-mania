#!/usr/bin/env node
/**
 * Download team logos from api-sports.io CDN to /public/team-logos/
 * Run once: node scripts/download-team-logos.mjs
 */
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "team-logos");

const LOGOS = [
  // ── Serie A ──
  { slug: "inter",        id: 505 },
  { slug: "milan",        id: 489 },
  { slug: "juventus",     id: 496 },
  { slug: "napoli",       id: 492 },
  { slug: "roma",         id: 497 },
  { slug: "lazio",        id: 487 },
  { slug: "atalanta",     id: 499 },
  { slug: "fiorentina",   id: 502 },
  { slug: "bologna",      id: 500 },
  { slug: "torino",       id: 503 },
  { slug: "udinese",      id: 494 },
  { slug: "monza",        id: 867 },
  { slug: "genoa",        id: 495 },
  { slug: "lecce",        id: 867 },
  { slug: "cagliari",     id: 490 },
  { slug: "verona",       id: 504 },
  { slug: "sassuolo",     id: 498 },
  { slug: "empoli",       id: 511 },
  { slug: "parma",        id: 508 },
  { slug: "como",         id: 886 },
  // ── Resto del Mondo ──
  { slug: "real-madrid",  id: 541 },
  { slug: "barcelona",    id: 529 },
  { slug: "atletico",     id: 530 },
  { slug: "liverpool",    id: 40  },
  { slug: "man-city",     id: 50  },
  { slug: "arsenal",      id: 42  },
  { slug: "chelsea",      id: 49  },
  { slug: "man-utd",      id: 33  },
  { slug: "tottenham",    id: 47  },
  { slug: "bayern",       id: 157 },
  { slug: "dortmund",     id: 165 },
  { slug: "psg",          id: 85  },
  { slug: "ajax",         id: 194 },
  { slug: "porto",        id: 212 },
  { slug: "benfica",      id: 211 },
  { slug: "sporting",     id: 228 },
  // ── Nazionali ──
  { slug: "italia",       id: 768 },
  { slug: "francia",      id: 2   },
  { slug: "germania",     id: 25  },
  { slug: "spagna",       id: 9   },
  { slug: "brasile",      id: 6   },
  { slug: "argentina",    id: 26  },
  { slug: "portogallo",   id: 27  },
  { slug: "inghilterra",  id: 10  },
  { slug: "olanda",       id: 1118},
  { slug: "belgio",       id: 1   },
  { slug: "croazia",      id: 3   },
  { slug: "marocco",      id: 32  },
  { slug: "usa",          id: 39  },
  { slug: "messico",      id: 16  },
  { slug: "senegal",      id: 29  },
  { slug: "giappone",     id: 30  },
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", (err) => {
      file.close();
      reject(err);
    });
  });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`📂  Output: ${OUT_DIR}`);
  console.log(`⬇️   Downloading ${LOGOS.length} logos...\n`);

  let ok = 0, fail = 0;
  for (const { slug, id } of LOGOS) {
    const url  = `https://media.api-sports.io/football/teams/${id}.png`;
    const dest = path.join(OUT_DIR, `${slug}.png`);
    try {
      await download(url, dest);
      console.log(`✅  ${slug}.png`);
      ok++;
    } catch (err) {
      console.error(`❌  ${slug}: ${err.message}`);
      fail++;
    }
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 120));
  }

  console.log(`\n✅  ${ok} downloaded  ❌  ${fail} failed`);
}

main().catch(console.error);
