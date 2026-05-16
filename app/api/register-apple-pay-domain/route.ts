export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const { domain } = await req.json();

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    const applePayDomain = await stripe.applePayDomains.create({
      domain_name: domain,
    });

    return NextResponse.json({ success: true, domain: applePayDomain.domain_name });
  } catch (error) {
    console.error("Error registering domain:", error);
    return NextResponse.json({ error: "Failed to register domain" }, { status: 500 });
  }
}
