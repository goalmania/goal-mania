import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { patchById } from "@/lib/patches";

// Numero WhatsApp del fornitore (formato internazionale senza +). Si puo cambiare con la variabile SUPPLIER_WHATSAPP.
export const SUPPLIER_WHATSAPP = (process.env.SUPPLIER_WHATSAPP || "8615976845537").replace(/\D/g, "");

const baseId = (id: string) => String(id || "").split("_")[0];
const yes = (v: unknown) => (v ? "YES" : "no");

// Il messaggio per il fornitore: cosa produrre, in che taglia, con quali personalizzazioni, la foto e dove spedire. In inglese, semplice.
export async function buildSupplierMessage(order: any): Promise<string> {
  await connectDB();
  const ids = Array.from(new Set((order.items || []).map((i: any) => baseId(i.productId)).filter(Boolean)));
  const prods = ids.length ? await Product.find({ _id: { $in: ids } }).select({ title: 1, slug: 1, images: 1, isMysteryBox: 1 }).lean<any[]>() : [];
  const byId = new Map(prods.map((p) => [String(p._id), p]));

  const lines: string[] = [];
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
    if (img) lines.push(`Photo: ${img}`);
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
  return lines.join("\n").replace(/\n{3,}/g, "\n\n");
}

export const whatsappLink = (message: string) => `https://wa.me/${SUPPLIER_WHATSAPP}?text=${encodeURIComponent(message)}`;

// Invio automatico, solo se hai collegato WhatsApp Business (WHATSAPP_TOKEN e WHATSAPP_PHONE_ID su Vercel). Altrimenti non fa nulla.
export async function sendSupplierWhatsApp(message: string): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) return false;
  try {
    const r = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to: SUPPLIER_WHATSAPP, type: "text", text: { preview_url: true, body: message.slice(0, 4000) } }),
    });
    if (!r.ok) console.error("WhatsApp fornitore: invio non riuscito", r.status, await r.text().catch(() => ""));
    return r.ok;
  } catch (e) {
    console.error("WhatsApp fornitore: errore", e);
    return false;
  }
}
