import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { patchById } from "@/lib/patches";
import Order from "@/models/Order";
import User from "@/lib/models/User";
import mongoose from "mongoose";

const COUNTRY: Record<string, string> = { IT: "Italy", ITALIA: "Italy", ITALY: "Italy", FR: "France", DE: "Germany", ES: "Spain", CH: "Switzerland", AT: "Austria", BE: "Belgium", NL: "Netherlands", PT: "Portugal", GB: "United Kingdom", SM: "San Marino" };
const baseId = (id: string) => String(id || "").split("_")[0];
const yes = (v: unknown) => (v ? "YES" : "no");

// Il messaggio per il fornitore: cosa produrre, in che taglia, con quali personalizzazioni, la foto e dove spedire. In inglese, semplice.
export async function buildSupplierPackage(order: any): Promise<{ message: string; images: { url: string; caption: string }[] }> {
  await connectDB();
  const ids = Array.from(new Set((order.items || []).map((i: any) => baseId(i.productId)).filter(Boolean)));
  const prods = ids.length ? await Product.find({ _id: { $in: ids } }).select({ title: 1, slug: 1, images: 1, isMysteryBox: 1 }).lean<any[]>() : [];
  const byId = new Map(prods.map((p) => [String(p._id), p]));
  const ref = String(order._id).slice(-6).toUpperCase();

  const lines: string[] = [`NEW ORDER - ref ${ref}`, "Please prepare and ship the following:", ""];
  const images: { url: string; caption: string }[] = [];

  (order.items || []).forEach((it: any, i: number) => {
    const c = it.customization || {};
    const p = byId.get(baseId(it.productId));
    const mystery = p?.isMysteryBox || /mystery|mistery/i.test(it.name || "");
    const title = String(it.name || "").replace(/^Maglia\s+/i, "").trim();
    const patches = (c.selectedPatches || []).map((x: any) => patchById(x.id || x.name)?.label || x.name || x.id).filter(Boolean);
    lines.push(`ITEM ${i + 1}`);
    lines.push(`Jersey: ${mystery ? "MYSTERY jersey (pick any from your stock)" : title}`);
    lines.push(`Quantity: ${it.quantity}`);
    lines.push(`Size: ${c.size || "-"}${c.isKidSize ? " (KIDS)" : ""}`);
    lines.push(`Version: ${c.isPlayerEdition ? "Player edition" : "Fan version"}`);
    lines.push(`Sleeves: ${c.hasLongSleeve ? "LONG" : "short"}`);
    lines.push(`Name on back: ${c.name || "none"}`);
    lines.push(`Number on back: ${c.number || "none"}`);
    lines.push(`Patches: ${patches.length ? patches.join(", ") : "none"}`);
    lines.push(`Shorts: ${c.includeShorts ? "YES" : "no"}`);
    lines.push(`Socks: ${c.includeSocks ? "YES" : "no"}`);
    if (mystery && c.excludedShirts?.length) lines.push(`Do NOT send: ${c.excludedShirts.join(", ")}`);
    if (!mystery) {
      const img = (p?.images || []).find((u: string) => /^https?:/.test(u));
      if (img) images.push({ url: img, caption: `Item ${i + 1}: ${title}` });
    }
    lines.push("");
  });

  const a = order.shippingAddress || {};
  let email = order.guestEmail || "";
  if (!email && order.userId && mongoose.Types.ObjectId.isValid(String(order.userId))) {
    const u = await User.findById(order.userId).select("email").lean<any>().catch(() => null);
    email = u?.email || "";
  }
  const street = a.street || a.addressLine1 || "";
  lines.push("SHIPPING DETAILS");
  lines.push(`Name: ${a.fullName || "-"}`);
  lines.push(`Address: ${street}${a.addressLine2 ? `, ${a.addressLine2}` : ""}` + (street ? "" : "-"));
  lines.push(`City: ${a.city || "-"}`);
  lines.push(`Province/State: ${a.state || "-"}`);
  lines.push(`Postal code: ${a.postalCode || "-"}`);
  lines.push(`Country: ${COUNTRY[String(a.country || "").toUpperCase()] || a.country || "-"}`);
  lines.push(`Phone: ${a.phone || "-"}`);
  if (email) lines.push(`Email: ${email}`);
  lines.push("");
  lines.push("Photos of the jerseys follow. Please confirm the order and send me the tracking number as soon as it ships. Thank you!");
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
