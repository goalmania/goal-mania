import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const paypalMode = process.env.PAYPAL_MODE;

    // Check if environment variables are loaded
    const envStatus = {
      NEXT_PUBLIC_PAYPAL_CLIENT_ID: paypalClientId ? "✅ Loaded" : "❌ Missing",
      PAYPAL_CLIENT_SECRET: paypalClientSecret ? "✅ Loaded" : "❌ Missing", 
      PAYPAL_MODE: paypalMode ? "✅ Loaded" : "❌ Missing",
      hasAllRequired: !!(paypalClientId && paypalClientSecret && paypalMode)
    };

    // Test PayPal authentication
    let authTest: any = { success: false, error: null };
    
    if (envStatus.hasAllRequired) {
      try {
        const paypalBaseUrl = paypalMode === "live" 
          ? "https://api-m.paypal.com" 
          : "https://api-m.sandbox.paypal.com";

        const authResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${Buffer.from(
              `${paypalClientId}:${paypalClientSecret}`
            ).toString("base64")}`,
          },
          body: "grant_type=client_credentials",
        });

        if (authResponse.ok) {
          const authData = await authResponse.json();
          authTest = { 
            success: true, 
            accessToken: authData.access_token ? "✅ Valid" : "❌ Invalid",
            expiresIn: authData.expires_in,
            tokenType: authData.token_type
          };
        } else {
          const errorText = await authResponse.text();
          authTest = { 
            success: false, 
            error: `HTTP ${authResponse.status}: ${errorText}`,
            status: authResponse.status
          };
        }
      } catch (error) {
        authTest = { 
          success: false, 
          error: error instanceof Error ? error.message : "Unknown error"
        };
      }
    }

    return NextResponse.json({
      environment: envStatus,
      paypalAuthTest: authTest,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check environment", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
