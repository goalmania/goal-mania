export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  try {
    const stripe = getStripe();
    const domain = req.headers.get("host") || "localhost:3000";

    await stripe.applePayDomains.create({
      domain_name: domain,
    });

    const verificationFile = `apple-developer-merchantid-domain-association`;

    return new NextResponse(verificationFile, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("Error generating Apple Pay verification:", error);
    return NextResponse.json(
      { error: "Failed to generate verification file" },
      { status: 500 }
    );
  }
}
