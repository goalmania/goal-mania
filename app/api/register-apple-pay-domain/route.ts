import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    // Initialize Stripe inside handler to avoid build-time errors
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-04-30.basil",
    });

    const { domain } = await req.json();

    if (!domain) {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      );
    }

    // Register the domain with Stripe for Apple Pay
    const applePayDomain = await stripe.applePayDomains.create({
      domain_name: domain,
    });

    return NextResponse.json({
      success: true,
      domain: applePayDomain.domain_name,
    });
  } catch (error) {
    console.error("Error registering domain:", error);
    return NextResponse.json(
      { error: "Failed to register domain" },
      { status: 500 }
    );
  }
}
