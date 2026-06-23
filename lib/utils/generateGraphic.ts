import sharp from "sharp";
import satori from "satori";
import fs from "fs";
import path from "path";

const W = 1080;
const H = 1920;

const PHOTO_LEFT = Math.round(60.75);
const PHOTO_TOP  = Math.round(268.19);
const PHOTO_W    = Math.round(958.49);
const PHOTO_H    = Math.round(725.20);
const PHOTO_RADIUS = 24;

const TEXT_LEFT  = Math.round(169.97);
const TEXT_TOP   = Math.round(1316.50);
const TEXT_W     = Math.round(740.07);
const TEXT_H     = Math.round(342.31);

const TEXT_COLOR = "#ffffff";
// Font-size nativo dal design Canva (coordinate 1:1 con la risoluzione 1080px)
const FONT_SIZE  = 86;

let _fontCache: ArrayBuffer | null = null;
function getAghartiFont(): ArrayBuffer {
  if (_fontCache) return _fontCache;
  const fontPath = path.join(process.cwd(), "public/fonts/agharti-bold.woff");
  const buf = fs.readFileSync(fontPath);
  _fontCache = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  return _fontCache;
}

// Tronca il titolo a max ~80 caratteri senza spezzare parole
function truncateTitle(text: string, max = 80): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max).lastIndexOf(" ");
  return text.slice(0, cut > 0 ? cut : max) + "…";
}

function calcFontSize(text: string): number {
  const len = text.length;
  if (len <= 25)  return 120;
  if (len <= 35)  return 108;
  if (len <= 45)  return 96;
  if (len <= 55)  return 88;
  if (len <= 65)  return 78;
  if (len <= 75)  return 70;
  return 62;
}

export async function generateGraphic(
  title: string,
  articleImageUrl: string
): Promise<Buffer> {
  const font = getAghartiFont();

  const templatePath = path.join(process.cwd(), "public/templates/goalmania-base.png");
  const templateBuf = fs.readFileSync(templatePath);

  const imgRes = await fetch(articleImageUrl);
  if (!imgRes.ok) throw new Error(`Image fetch failed: ${imgRes.status} ${articleImageUrl}`);
  const imgBuf = Buffer.from(await imgRes.arrayBuffer());

  const articlePhoto = await sharp(imgBuf)
    .resize(PHOTO_W, PHOTO_H, { fit: "cover", position: "attention" })
    .png()
    .toBuffer();

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

  const displayTitle = truncateTitle(title.toUpperCase());
  const fontSize = calcFontSize(displayTitle);

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
              fontWeight: 800,
              fontFamily: "Agharti",
              textAlign: "center",
              lineHeight: 1.2,
              letterSpacing: "0.01em",
              wordBreak: "break-word",
              padding: "0 12px",
            },
            children: displayTitle,
          },
        },
      ],
    },
  } as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  const textSvg = await satori(satoriNode, {
    width: TEXT_W,
    height: TEXT_H,
    fonts: [{ name: "Agharti", data: font, weight: 800, style: "normal" }],
  });

  const textPng = await sharp(Buffer.from(textSvg)).png().toBuffer();

  return sharp(templateBuf)
    .resize(W, H, { fit: "fill" })
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
