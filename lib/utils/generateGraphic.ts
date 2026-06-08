/**
 * Genera una grafica story 450×800 che replica il template Canva GoalMania.
 * Sfondo #0f0f0f, foto con angoli arrotondati, box olive con titolo bold uppercase.
 */

import sharp from "sharp";
import satori from "satori";
import fs from "fs";
import path from "path";

const W = 450;
const H = 800;

const PHOTO_X = 22;
const PHOTO_Y = 28;
const PHOTO_W = 406;
const PHOTO_H = 460;
const PHOTO_RADIUS = 18;

const BOX_X = 25;
const BOX_Y = 508;
const BOX_W = 400;
const BOX_H = 242;

const LINE_Y = 772;
const LINE_X1 = 32;
const LINE_X2 = W - 32;
const DOT_CX = 50;
const DOT_CY = LINE_Y;
const DOT_R = 7;

const BG = "#0f0f0f";
const BOX_COLOR = "#5c6234";
const TEXT_COLOR = "#ffffff";
const LINE_COLOR = "#5c6234";

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

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (test.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function generateGraphic(
  title: string,
  articleImageUrl: string
): Promise<Buffer> {
  const font = getOswaldFont();

  // 1. Foto articolo resized + crop
  const imgRes = await fetch(articleImageUrl);
  if (!imgRes.ok) throw new Error(`Image fetch failed: ${imgRes.status} ${articleImageUrl}`);
  const imgBuf = Buffer.from(await imgRes.arrayBuffer());

  const articlePhoto = await sharp(imgBuf)
    .resize(PHOTO_W, PHOTO_H, { fit: "cover", position: "attention" })
    .png()
    .toBuffer();

  // 2. Angoli arrotondati sulla foto tramite maschera SVG
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

  // 3. Calcola font size e wrapping del titolo
  const titleUpper = title.toUpperCase();
  const fontSize = titleUpper.length > 70 ? 24 : titleUpper.length > 50 ? 26 : titleUpper.length > 35 ? 28 : 30;
  const charsPerLine = Math.floor(352 / (fontSize * 0.52));
  const lines = wrapText(titleUpper, charsPerLine);

  // 4. Genera overlay (box + testo + decorazioni) con Satori
  // Satori richiede display:flex su ogni nodo con children
  const overlaySvg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: W,
          height: H,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          background: "transparent",
        },
        children: [
          // Box verde/olive con testo
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                left: BOX_X,
                top: BOX_Y,
                width: BOX_W,
                height: BOX_H,
                background: BOX_COLOR,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                paddingLeft: 20,
                paddingRight: 20,
                paddingTop: 16,
                paddingBottom: 16,
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
                    },
                    children: lines.map((line, i) => ({
                      type: "div",
                      props: {
                        key: i,
                        style: {
                          display: "flex",
                          justifyContent: "center",
                          width: "100%",
                          color: TEXT_COLOR,
                          fontSize,
                          fontWeight: 700,
                          fontFamily: "Oswald",
                          textAlign: "center",
                          lineHeight: 1.3,
                          letterSpacing: "0.03em",
                        },
                        children: line,
                      },
                    })),
                  },
                },
              ],
            },
          },
          // Linea decorativa
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                left: LINE_X1,
                top: LINE_Y - 1,
                width: LINE_X2 - LINE_X1,
                height: 2,
                background: LINE_COLOR,
                display: "flex",
              },
              children: [],
            },
          },
          // Cerchio decorativo
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                left: DOT_CX - DOT_R,
                top: DOT_CY - DOT_R,
                width: DOT_R * 2,
                height: DOT_R * 2,
                borderRadius: "50%",
                background: LINE_COLOR,
                border: `2px solid ${BG}`,
                display: "flex",
              },
              children: [],
            },
          },
        ],
      },
    },
    {
      width: W,
      height: H,
      fonts: [{ name: "Oswald", data: font, weight: 700, style: "normal" }],
    }
  );

  const overlayPng = await sharp(Buffer.from(overlaySvg)).png().toBuffer();

  // 5. Compositing finale: sfondo nero → foto → overlay
  return sharp({
    create: { width: W, height: H, channels: 4, background: BG },
  })
    .composite([
      { input: photoRounded, left: PHOTO_X, top: PHOTO_Y },
      { input: overlayPng, left: 0, top: 0 },
    ])
    .png()
    .toBuffer();
}
