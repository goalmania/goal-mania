import Stripe from "stripe";

let _stripe: Stripe | null = null;

/** Lazy Stripe singleton — only instantiated at runtime, never at build time */
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    _stripe = new Stripe(key, { apiVersion: "2025-04-30.basil" });
  }
  return _stripe;
}
