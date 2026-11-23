export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { priceOrder } from "@/lib/serverPricing";

// Prezzi attuali per gli articoli gia nel carrello del cliente (carrelli salvati con prezzi vecchi).
// Risponde { prices: { [idArticolo]: prezzoUnitario | null } } — null = non piu disponibile.
export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json();
    if (!Array.isArray(items) || items.length === 0 || items.length > 20) {
      return NextResponse.json({ prices: {} });
    }
    const prices: Record<string, number | null> = {};
    for (const it of items) {
      try {
        const r = await priceOrder({ items: [{ id: String(it.id), name: it.name, quantity: 1, customization: it.customization }] });
        prices[String(it.id)] = r.items[0].price;
      } catch {
        prices[String(it.id)] = null;
      }
    }
    return NextResponse.json({ prices });
  } catch {
    return NextResponse.json({ prices: {} });
  }
}
