export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import OrderDetails from "@/lib/models/OrderDetails";
import Address from "@/lib/models/Address";
import DiscountRule from "@/lib/models/DiscountRule";
import { getStripe } from "@/lib/stripe";
import { calculateRuleDiscount } from "@/lib/discountRules";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customization?: {
    name?: string;
    number?: string;
    selectedPatches?: Array<{
      id: string;
      name: string;
      image: string;
      price?: number;
    }>;
    includeShorts?: boolean;
    includeSocks?: boolean;
    isPlayerEdition?: boolean;
    size?: string;
    isKidSize?: boolean;
    hasCustomization?: boolean;
  };
}

// This is a placeholder for actual Stripe integration
// In a real application, you would use the Stripe SDK to create a payment intent
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const body = await req.json();
    const { items, addressId, coupon, guestEmail, guestAddress, discountRules } = body;

    // Require either authenticated session OR guest details
    const isGuest = !session?.user;
    if (isGuest && (!guestEmail || !guestAddress)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!items || !items.length || (!addressId && !guestAddress)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (guestAddress && !String(guestAddress.phone || "").trim()) {
      return NextResponse.json(
        { error: "Il numero di telefono è obbligatorio" },
        { status: 400 }
      );
    }

    // Calculate total amount
    const total = items.reduce(
      (sum: number, item: CartItem) => sum + item.price * item.quantity,
      0
    );

    // Apply coupon discount if available
    let discountAmount = 0;

    if (coupon && coupon.discountPercentage) {
      discountAmount = (total * coupon.discountPercentage) / 100;
    }

    // Apply "buy X get Y" / quantity / percentage / fixed discount rules
    // (e.g. "Prendi 3 Paghi 2"). Never trust the discountAmount the client
    // sends for these — recompute it server-side from the DB rule so the
    // charged amount can't be tampered with, and so it can't silently drift
    // out of sync with what the client showed (bug fixed 27/08/2026: this
    // recompute step didn't exist at all, so the PaymentIntent was always
    // created for the full, non-discounted price even when a discount rule
    // was applied and shown on the cart page).
    let discountRulesAmount = 0;
    let appliedDiscountRulesData: Array<{ ruleId: string; name: string; discountAmount: number }> = [];

    if (Array.isArray(discountRules) && discountRules.length > 0) {
      await connectDB();
      const ruleIds = discountRules
        .map((r: any) => r?.ruleId || r?._id)
        .filter(Boolean);

      if (ruleIds.length > 0) {
        const dbRules = await DiscountRule.find({
          _id: { $in: ruleIds },
          isActive: true,
          $and: [
            { $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] },
            { $or: [{ maxUses: null }, { $expr: { $lt: ["$currentUses", "$maxUses"] } }] },
          ],
        });

        const discountCartItems = items.map((item: CartItem & { category?: string }) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          category: item.category,
        }));

        for (const rule of dbRules) {
          const amount = calculateRuleDiscount(rule, discountCartItems);
          if (amount > 0) {
            discountRulesAmount += amount;
            appliedDiscountRulesData.push({
              ruleId: rule._id.toString(),
              name: rule.name,
              discountAmount: Math.round(amount * 100) / 100,
            });
          }
        }
      }
    }

    const finalAmount = Math.max(0, total - discountAmount - discountRulesAmount);

    try {
      // Create a simplified version of cart items for metadata
      // Only include essential information to stay within the 500 character limit
      const simplifiedItems = items.map((item: CartItem) => ({
        id: item.id,
        qty: item.quantity,
        p: item.price,
      }));

      // Store full cart data in your database or session if needed
      // For Stripe metadata, just use the minimal representation
      const cartItemsString = JSON.stringify(simplifiedItems);

      // Simplified coupon data
      let couponString = "";
      if (coupon) {
        couponString = JSON.stringify({
          code: coupon.code,
          pct: coupon.discountPercentage,
        });
      }

      // Simplified discount rules data (kept under Stripe's 500-char metadata limit)
      const discountRulesString = appliedDiscountRulesData.length > 0
        ? JSON.stringify(appliedDiscountRulesData.map((r) => ({ id: r.ruleId, n: r.name, amt: r.discountAmount })))
        : "";

      const stripe = getStripe();
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(finalAmount * 100),
        currency: "eur",
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "always", // abilita Klarna, Amazon Pay, Bancontact, ecc.
        },
        metadata: {
          userId: session?.user?.id || "guest",
          addressId: addressId || "guest",
          guestEmail: guestEmail || "",
          items: cartItemsString,
          coupon: couponString,
          discountRules: discountRulesString,
          total: total.toString(),
          final: finalAmount.toString(),
        },
        // setup_future_usage rimosso: bloccava Klarna, Amazon Pay e altri BNPL
      });

      // Store the full cart data with customizations in the database
      await connectDB();

      // Snapshot dell'indirizzo per utenti registrati: se l'indirizzo salvato
      // viene poi modificato/eliminato, il webhook di conferma pagamento deve
      // comunque poter creare l'ordine senza dipendere da una ricerca live.
      let addressSnapshot = null;
      if (!isGuest && addressId) {
        // $or su email: copre gli indirizzi salvati da /api/addresses quando
        // (bug corretto il 24/07) la sessione veniva letta senza authOptions
        // e finiva per salvare l'email al posto del vero userId.
        const savedAddress = await Address.findOne({
          _id: addressId,
          $or: [{ userId: session!.user!.id }, { userId: session!.user!.email }],
        }).lean();
        addressSnapshot = savedAddress || null;
      }

      await OrderDetails.create({
        paymentIntentId: paymentIntent.id,
        fullItems: items.map((item: CartItem) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          customization: item.customization || {},
        })),
        userId: session?.user?.id || null,
        guestEmail: guestEmail || null,
        guestAddress: guestAddress || null,
        addressId: addressId || null,
        addressSnapshot,
        couponData: coupon
          ? {
              code: coupon.code,
              discountPercentage: coupon.discountPercentage,
              discountAmount: discountAmount,
            }
          : null,
        discountRulesData: appliedDiscountRulesData.length > 0 ? appliedDiscountRulesData : null,
      });

      return NextResponse.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        orderId: paymentIntent.id,
      });
    } catch (error) {
      console.error("Checkout error (Stripe intent or OrderDetails save):", error);
      return NextResponse.json(
        {
          error: "Failed to create payment intent",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
