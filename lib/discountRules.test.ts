// Esegui: npx tsx lib/discountRules.test.ts
import assert from "node:assert/strict";
import { calculateRuleDiscount } from "./discountRules";
import { mysteryUnitPrice, round2 } from "./serverPricing.pure";

const rule3x2 = { type: "buy_x_get_y", buyQuantity: 2, getFreeQuantity: 1 };
const tot = (items: any[]) => round2(items.reduce((s, i) => s + i.price * i.quantity, 0));
const pay = (items: any[]) => round2(tot(items) - calculateRuleDiscount(rule3x2, items));

// 1 retro (40) + 2 mystery attuali (35 l'una): la meno cara e gratis -> 75
const mixed = [
  { id: "retro", name: "Retro", price: 40, quantity: 1, category: "Retro" },
  { id: "mys_a", name: "Mystery", price: mysteryUnitPrice("Maglie 25/26 Mistery Box"), quantity: 2, category: "Mystery Box" },
];
assert.equal(tot(mixed), 110);
assert.equal(pay(mixed), 75);

// 1 attuale (35) + 2 mystery attuali: 105 - 35 = 70
assert.equal(pay([{ id: "cur", name: "Cur", price: 35, quantity: 1, category: "2026/27" }, { id: "mys", name: "M", price: 35, quantity: 2, category: "Mystery Box" }]), 70);

// 2 maglie: nessuno sconto; 6 maglie: due gratis
assert.equal(pay([{ id: "a", name: "A", price: 35, quantity: 2 }]), 70);
assert.equal(pay([{ id: "a", name: "A", price: 35, quantity: 6 }]), 140);
console.log("discountRules ok");
