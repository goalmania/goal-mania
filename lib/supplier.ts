import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { patchById } from "@/lib/patches";
import Order from "@/models/Order";

const baseId = (id: string) => String(id || "").split("_")[0];
const yes = (v: unknown) => (v ? "YES" : "no");

// Il messaggio per il fornitore: cosa produrre, in che taglia, con quali personalizzazioni, la foto e dove spedire. In inglese, semplice.
export async function buildSupplierPackage(order: any): Promise<{ message: string; images: string[] }> {
  await connectDB();
  const ids = Array.from(new Set((order.items || []).map((i: any) => baseId(i.productId)).filter(Boolean)));
  const prods = ids.length ? await Product.find({ _id: { $in: ids } }).select({ title: 1, slug: 1, images: 1, isMysteryBox: 1 }).lean<any[]>() : [];
  const byId = new Map(prods.map((p) => [String(p._id), p]));

  const lines: string[] = [];
  const images: string[] = [];
  const code = String(order._id).slice(-6).toUpperCase();
  lines.push(`NEW ORDER #${code}`);
  lines.push(`Date: ${new Date(order.createdAt || Date.now()).toLocaleString("en-GB", { timeZone: "Europe/Rome" })}`);
  lines.push("");

  (order.items || []).forEach((it: any, i: number) => {
    const c = it.customization || {};
    const p = byId.get(baseId(it.productId));
    lines.push(`--- ITEM ${i + 1} ---`);
    lines.push(`${it.name}  x${it.quantity}`);
    if (c.size) lines.push(`Size: ${c.size}${c.isKidSize ? " (KIDS)" : ""}`);
    lines.push(`Version: ${c.isPlayerEdition ? "PLAYER edition" : "FAN version"}`);
    if (c.hasLongSleeve) lines.push("Long sleeve: YES");
    if (c.name || c.number) lines.push(`Back print: name "${c.name || "-"}" number "${c.number || "-"}"`);
    const patches = (c.selectedPatches || []).map((x: any) => patchById(x.id || x.name)?.label || x.name || x.id).filter(Boolean);
    if (patches.length) lines.push(`Patches: ${patches.join(", ")}`);
    if (c.includeShorts) lines.push("Add shorts: YES");
    if (c.includeSocks) lines.push("Add socks: YES");
    if (p?.isMysteryBox || /mystery|mistery/i.test(it.name || "")) {
      lines.push("MYSTERY BOX: pick a random jersey from your stock.");
      if (c.excludedShirts?.length) lines.push(`Do NOT send: ${c.excludedShirts.join(", ")}`);
    }
    const img = (p?.images || []).find((u: string) => /^https?:/.test(u));
    if (img) { lines.push(`Photo: ${img}`); images.push(img); }
    if (p?.slug) lines.push(`Page: https://goal-mania.it/products/${p.slug}`);
    lines.push("");
  });

  const a = order.shippingAddress || {};
  lines.push("--- SHIP TO ---");
  if (a.fullName) lines.push(a.fullName);
  const street = a.street || a.addressLine1;
  if (street) lines.push(street + (a.addressLine2 ? `, ${a.addressLine2}` : ""));
  lines.push([a.postalCode, a.city, a.state].filter(Boolean).join(" "));
  if (a.country) lines.push(a.country);
  if (a.phone) lines.push(`Phone: ${a.phone}`);
  lines.push("");
  lines.push("Please confirm and send the tracking number when shipped. Thank you!");
  return { message: lines.join("\n").replace(/\n{3,}/g, "\n\n"), images };
}

export const buildSupplierMessage = async (order: any) => (await buildSupplierPackage(order)).message;

// Il messaggio arriva a te su Telegram (stesso bot e stessa chat delle grafiche): testo completo e poi la foto di ogni maglia
export async function sendSupplierTelegram(order: any): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || "8649572632";
  if (!token) return { ok: false, error: "TELEGRAM_BOT_TOKEN non impostato" };
  try {
    const { message, images } = await buildSupplierPackage(order);
    const api = `https://api.telegram.org/bot${token}`;
    const r = await fetch(`${api}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message.slice(0, 4000), disable_web_page_preview: true }),
    });
    const j = await r.json();
    if (!j.ok) return { ok: false, error: JSON.stringify(j) };
    for (const url of images.slice(0, 8)) {
      await fetch(`${api}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, photo: url, caption: "Order #" + String(order._id).slice(-6).toUpperCase() }),
      }).catch(() => {});
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// Manda e segna l'ordine come inviato: cosi non parte due volte (webhook, ripasso automatico e pagina admin)
export async function sendSupplierTelegramOnce(order: any): Promise<{ ok: boolean; error?: string }> {
  const r = await sendSupplierTelegram(order);
  if (r.ok) await Order.updateOne({ _id: order._id }, { $set: { supplierSentAt: new Date() } }).catch(() => {});
  return r;
}
