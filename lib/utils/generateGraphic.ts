/**
 * Genera grafica GoalMania story 1080×1920 pixel-perfect 1:1 rispetto al template Canva.
 * Strategia: usa il PNG base esportato da Canva (sfondo+green box+decorazioni) come layer fisso,
 * poi composita dinamicamente la foto articolo e il titolo alle coordinate native Canva.
 */

import sharp from "sharp";
import satori from "satori";
import fs from "fs";
import path from "path";

// ─── Dimensioni native template Canva (1080×1920) ───────────────────────────
const W = 1080;
const H = 1920;

// Coordinate esatte dalla transazione MCP su design DAHL_KIbVXc
const PHOTO_LEFT = Math.round(60.75);     // 61
const PHOTO_TOP  = Math.round(268.19);    // 268
const PHOTO_W    = Math.round(958.49);    // 958
const PHOTO_H    = Math.round(725.20);    // 725
const PHOTO_RADIUS = 24;                  // border-radius visibile nel template

const TEXT_LEFT  = Math.round(169.97);   // 170
const TEXT_TOP   = Math.round(1316.50);  // 1317
const TEXT_W     = Math.round(740.07);   // 740
const TEXT_H     = Math.round(342.31);   // 342

const TEXT_COLOR = "#ffffff";

// ─── Font cache ─────────────────────────────────────────────────────────────
let _fontCache: ArrayBuffer | null = null;
function getOswaldFont(): ArrayBuffer {
  if (_fontCache) return _fontCache;
  const fontPath = path.join(
    process.cwd(),
    "node_modules/@fontsource/oswald/files/oswald-latin-700-normal.woff"
  );
  const buf = fs.readFileSync(fontPath);
  _fontCache = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  return _fontCache;
}

// ─── Auto font-size: massimizza la dimensione che non sfora il box ───────────
// Usa una griglia empirica basata sulla lunghezza del testo uppercase
function calcFontSize(text: string): number {
  const len = text.length;
  if (len <= 30)  return 80;
  if (len <= 45)  return 70;
  if (len <= 60)  return 62;
  if (len <= 80)  return 54;
  if (len <= 100) return 46;
  return 40;
}

// ─── Generatore principale ───────────────────────────────────────────────────
export async function generateGraphic(
  title: string,
  articleImageUrl: string
): Promise<Buffer> {
  const font = getOswaldFont();

  // 1. Carica il template base Canva (sfondo texture + green box + decorazioni)
  const templatePath = path.join(process.cwd(), "public/templates/goalmania-base.png");
  const templateBuf = fs.readFileSync(templatePath);

  // 2. Scarica e ridimensiona la foto articolo alle dimensioni native Canva
  const imgRes = await fetch(articleImageUrl);
  if (!imgRes.ok) throw new Error(`Image fetch failed: ${imgRes.status} ${articleImageUrl}`);
  const imgBuf = Buffer.from(await imgRes.arrayBuffer());

  const articlePhoto = await sharp(imgBuf)
    .resize(PHOTO_W, PHOTO_H, { fit: "cover", position: "attention" })
    .png()
    .toBuffer();

  // 3. Maschera angoli arrotondati sulla foto (radius 24px come nel template)
  const roundedMask = Buffer.from(
    `<svg width="${PHOTO_W}" height="${PHOTO_H}">
      <rect x="0" y="0" width="${PHOTO_W}" height="${PHOTO_H}"
            rx="${PHOTO_RADIUS}" ry="${PHOTO_RADIUS}" fill="white"/>
    </svg>`
  );
  const photoRounded = await sharp(articlePhoto)
    .composite([{ input: roundedMask, blend: "dest-in" }])
    .png()
    .toBuffer();

  // 4. Genera il layer testo con Satori (trasparente + testo bianco Oswald Bold)
  const titleUpper = title.toUpperCase();
  const fontSize = calcFontSize(titleUpper);
  const lineHeight = 1.25;

  // satori accetta VDOM grezzo ma TypeScript vuole ReactNode — cast necessario
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const satoriNode = {
    type: "div",
    props: {
      style: {
        width: TEXT_W,
        height: TEXT_H,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              color: TEXT_COLOR,
              fontSize,
              fontWeight: 700,
              fontFamily: "Oswald",
              textAlign: "center",
              lineHeight,
              letterSpacing: "0.02em",
              wordBreak: "break-word",
              padding: "0 16px",
            },
            children: titleUpper,
          },
        },
      ],
    },
  } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const textSvg = await satori(
    satoriNode,
    {
      width: TEXT_W,
      height: TEXT_H,
      fonts: [{ name: "Oswald", data: font, weight: 700, style: "normal" }],
    }
  );

  const textPng = await sharp(Buffer.from(textSvg)).png().toBuffer();

  // 5. Compositing finale:
  //    [template base] → [foto articolo] → [testo titolo]
  return sharp(templateBuf)
    .resize(W, H, { fit: "fill" }) // normalizza se necessario
    .composite([
      {
        input: photoRounded,
        left: PHOTO_LEFT,
        top: PHOTO_TOP,
        blend: "over",
      },
      {
        input: textPng,
        left: TEXT_LEFT,
        top: TEXT_TOP,
        blend: "over",
      },
    ])
    .png()
    .toBuffer();
}
