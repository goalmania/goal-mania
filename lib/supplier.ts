import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { patchById } from "@/lib/patches";
import Order from "@/models/Order";

const baseId = (id: string) => String(id || "").split("_")[0];
const yes = (v: unknown) => (v ? "YES" : "no");

// Il messaggio per il fornitore: cosa produrre, in che taglia, con quali personalizzazioni, la foto e dove spedire. In inglese, semplice.
export async function buildSupplierPackage(order: any): Promise<{ message: string; images: { url: string; caption: string }[] }> {
  await connectDB();
  const ids = Array.from(new Set((order.items || []).map((i: any) => baseId(i.productId)).filter(Boolean)));
  const prods = ids.length ? await Product.find({ _id: { $in: ids } }).select({ title: 1, slug: 1, images: 1, isMysteryBox: 1 }).lean<any[]>() : [];
  const byId = new Map(prods.map((p) => [String(p._id), p]));
  const ref = String(order._id).slice(-6).toUpperCase();

  const lines: string[] = ["Hello! New order, please prepare:", ""];
  const images: { url: string; caption: string }[] = [];

  (order.items || []).forEach((it: any, i: number) => {
    const c = it.customization || {};
    const p = byId.get(baseId(it.productId));
    const mystery = p?.isMysteryBox || /mystery|mistery/i.test(it.name || "");
    const title = String(it.name || "").replace(/^Maglia\s+/i, "").trim();
    lines.push(`${i + 1}) ${mystery ? "MYSTERY jersey" : `${title} jersey`}  x${it.quantity}`);
    if (c.size) lines.push(`   Size: ${c.size}${c.isKidSize ? " (kids)" : ""}`);
    lines.push(`   ${c.isPlayerEdition ? "Player edition" : "Fan version"}${c.hasLongSleeve ? ", long sleeve" : ""}`);
    if (c.name || c.number) lines.push(`   Print on back: ${[c.name, c.number].filter(Boolean).join(" ")}`);
    const patches = (c.selectedPatches || []).map((x: any) => patchById(x.id || x.name)?.label || x.name || x.id).filter(Boolean);
    if (patches.length) lines.push(`   Patches: ${patches.join(", ")}`);
    const extras = [c.includeShorts ? "shorts" : "", c.includeSocks ? "socks" : ""].filter(Boolean);
    if (extras.length) lines.push(`   Add: ${extras.join(" + ")}`);
    if (mystery) {
      lines.push("   Pick any jersey from your stock.");
      if (c.excludedShirts?.length) lines.push(`   Do NOT send: ${c.excludedShirts.join(", ")}`);
    } else {
      const img = (p?.images || []).find((u: string) => /^https?:/.test(u));
      if (img) images.push({ url: img, caption: `${i + 1}) ${title}` });
    }
    lines.push("");
  });

  const a = order.shippingAddress || {};
  lines.push("Ship to:");
  if (a.fullName) lines.push(a.fullName);
  const street = a.street || a.addressLine1;
  if (street) lines.push(street + (a.addressLine2 ? `, ${a.addressLine2}` : ""));
  const cityLine = [a.postalCode, a.city].filter(Boolean).join(" ") + (a.state ? ` (${a.state})` : "");
  if (cityLine.trim()) lines.push(cityLine.trim());
  if (a.country) lines.push(a.country);
  if (a.phone) lines.push(`Tel: ${a.phone}`);
  lines.push("");
  lines.push(`Ref: ${ref}. Photos below. Please confirm and send me the tracking number once shipped. Thank you!`);
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
    for (const img of images.slice(0, 8)) {
      await fetch(`${api}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, photo: img.url, caption: img.caption }),
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

// Ordini pagati dal 24/11 non ancora mandati su Telegram (arrivati prima di questa funzione, o con Telegram in errore)
export async function sendPendingSupplierOrders(limit = 20, resend = false) {
  await connectDB();
  const orders = await Order.find({ createdAt: { $gte: new Date("2026-11-24T00:00:00+01:00") }, paymentIntentId: { $exists: true, $nin: [null, ""] }, ...(resend ? {} : { supplierSentAt: { $exists: false } }) })
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean<any[]>();
  const results: { id: string; ok: boolean; error?: string }[] = [];
  for (const o of orders) {
    const r = await sendSupplierTelegramOnce(o);
    results.push({ id: String(o._id).slice(-6), ok: r.ok, error: r.error?.slice(0, 120) });
  }
  return { found: orders.length, sent: results.filter((r) => r.ok).length, results };
}
