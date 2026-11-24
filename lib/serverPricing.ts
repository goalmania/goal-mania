// Prezzi decisi SOLO dal server. Il browser manda cosa vuole comprare (id, taglia, quantita);
// quanto costa lo stabilisce il database. Prima l'importo del pagamento arrivava dal carrello
// del cliente: bastava modificarlo per pagare meno (o restare agganciati al vecchio prezzo).
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import Patch from "@/lib/models/Patch";
import Coupon from "@/lib/models/Coupon";
import DiscountRule from "@/lib/models/DiscountRule";
import { calculateRuleDiscount } from "@/lib/discountRules";
import { EXTRAS, DEFAULT_PATCH_PRICE, round2, patchCategories, unitPriceFor, baseProductId, mysteryUnitPrice, type Customization } from "@/lib/serverPricing.pure";

export { EXTRAS, DEFAULT_PATCH_PRICE, unitPriceFor, baseProductId };

export class PricingError extends Error {
  status = 400;
}

export interface PricedOrder<T> {
  items: Array<T & { price: number }>;
  subtotal: number;
  couponCode: string | null;
  couponPct: number;
  couponDiscount: number;
  rulesDiscount: number;
  appliedRules: Array<{ ruleId: string; name: string; discountAmount: number }>;
  total: number;
}

export async function priceOrder<T extends { id: string; name?: string; quantity: number; category?: string; customization?: Customization }>(input: {
  items: T[];
  coupon?: { code?: string } | null;
  discountRules?: Array<{ ruleId?: string; _id?: string }>;
}): Promise<PricedOrder<T>> {
  const { items, coupon, discountRules } = input;
  if (!Array.isArray(items) || items.length === 0) throw new PricingError("Carrello vuoto");
  if (items.length > 50) throw new PricingError("Troppi articoli");

  await connectDB();

  const ids = Array.from(new Set(items.map((i) => baseProductId(i.id))));
  if (ids.some((id) => !mongoose.Types.ObjectId.isValid(id))) throw new PricingError("Articolo non valido");

  const products = await Product.find({ _id: { $in: ids } }).select("title basePrice retroPrice isRetro isActive isMysteryBox").lean<any[]>();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const cats = Array.from(new Set(items.flatMap((i) => patchCategories(i.customization))));
  const patchPrices: Record<string, number> = {};
  if (cats.length) {
    const patches = await Patch.find({ category: { $in: cats } }).select("category price").lean<any[]>();
    for (const p of patches) patchPrices[p.category] = Number(p.price) || DEFAULT_PATCH_PRICE;
  }

  const priced = items.map((item) => {
    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) throw new PricingError("Quantità non valida");
    const p = byId.get(baseProductId(item.id));
    if (!p || p.isActive === false) throw new PricingError(`Articolo non più disponibile: ${item.name || item.id}`);
    const base = p.isMysteryBox ? mysteryUnitPrice(p.title) : Number(p.isRetro ? p.retroPrice : p.basePrice);
    if (!(base > 0)) throw new PricingError(`Prezzo non disponibile: ${item.name || item.id}`);
    return { ...item, quantity: qty, price: unitPriceFor(base, item.customization, patchPrices) };
  });

  const subtotal = round2(priced.reduce((s, i) => s + i.price * i.quantity, 0));

  // Coupon: percentuale dal database, mai dal browser
  let couponPct = 0;
  let couponCode: string | null = null;
  if (coupon?.code) {
    const c = await Coupon.findOne({ code: String(coupon.code).trim().toUpperCase(), isActive: true, expiresAt: { $gt: new Date() } });
    if (!c || (c.maxUses && c.currentUses >= c.maxUses)) throw new PricingError("Coupon non valido o scaduto");
    couponPct = c.discountPercentage;
    couponCode = c.code;
  }
  const couponDiscount = round2((subtotal * couponPct) / 100);

  // Regole sconto (es. "Prendi 3 paghi 2"): ricalcolate sulle maglie con i prezzi del server
  let rulesDiscount = 0;
  const appliedRules: PricedOrder<T>["appliedRules"] = [];
  const ruleIds = (discountRules || []).map((r) => r?.ruleId || r?._id).filter(Boolean);
  if (ruleIds.length) {
    const dbRules = await DiscountRule.find({
      _id: { $in: ruleIds },
      isActive: true,
      $and: [
        { $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] },
        { $or: [{ maxUses: null }, { $expr: { $lt: ["$currentUses", "$maxUses"] } }] },
      ],
    });
    const cartItems = priced.map((i) => ({ id: i.id, name: i.name || "", price: i.price, quantity: i.quantity, category: i.category }));
    for (const rule of dbRules) {
      const amount = calculateRuleDiscount(rule, cartItems);
      if (amount > 0) {
        rulesDiscount += amount;
        appliedRules.push({ ruleId: rule._id.toString(), name: rule.name, discountAmount: round2(amount) });
      }
    }
  }
  rulesDiscount = round2(rulesDiscount);

  const total = Math.max(0, round2(subtotal - couponDiscount - rulesDiscount));
  return { items: priced, subtotal, couponCode, couponPct, couponDiscount, rulesDiscount, appliedRules, total };
}
