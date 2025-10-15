import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with the secret key - using latest stable API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-04-30.basil",
});

export async function GET(req: NextRequest) {
  try {
    // Create Apple Pay domain first
    const domain = req.headers.get("host") || "localhost:3000";

    // First, register the domain
    await stripe.applePayDomains.create({
      domain_name: domain,
    });

    // Then get the verification file - this is a workaround
    // since the API changed and generateVerification is no longer available
    const verificationFile = `apple-developer-merchantid-domain-association`;

    // In a production environment, you would need to fetch the actual verification file
    // from Stripe's dashboard or through another API method

    // Return the placeholder verification file with the correct content type
    return new NextResponse(verificationFile, {
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("Error generating Apple Pay verification:", error);
    return NextResponse.json(
      { error: "Failed to generate verification file" },
      { status: 500 }
    );
  }
}
