import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import OAuthToken from "@/lib/models/OAuthToken";

// Endpoint usato UNA SOLA VOLTA per ottenere il refresh_token Canva via PKCE OAuth.
// Flusso:
// 1. Genera auth URL (vedi /api/canva/auth-url) e apri nel browser
// 2. Canva reindirizza qui con ?code=...&state=CODE_VERIFIER
// 3. Questo endpoint scambia il code con access_token + refresh_token
// 4. Salva CANVA_REFRESH_TOKEN su Vercel e non usare più questo endpoint

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state"); // contiene il code_verifier

  if (!code) {
    return NextResponse.json({ error: "Missing code parameter" }, { status: 400 });
  }

  const clientId = process.env.CANVA_CLIENT_ID;
  const clientSecret = process.env.CANVA_CLIENT_SECRET;
  const redirectUri = "https://goal-mania.it/api/canva/callback";

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "CANVA_CLIENT_ID or CANVA_CLIENT_SECRET not set" },
      { status: 500 }
    );
  }

  const body: Record<string, string> = {
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  };

  // Aggiungi code_verifier se presente nello state (flusso PKCE)
  if (state) {
    body.code_verifier = state;
  }

  const res = await fetch("https://api.canva.com/rest/v1/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
  });

  const data = await res.json();

  if (!data.refresh_token) {
    return NextResponse.json(
      { error: "No refresh_token in response", details: data },
      { status: 500 }
    );
  }

  // Salva il refresh_token in MongoDB per gestire la rotation automatica
  try {
    await connectDB();
    await OAuthToken.findOneAndUpdate(
      { provider: "canva" },
      { refreshToken: data.refresh_token, updatedAt: new Date() },
      { upsert: true }
    );
  } catch (dbErr) {
    console.error("Failed to save token to DB:", dbErr);
  }

  return NextResponse.json({
    message: "✅ OAuth completato! Token salvato in MongoDB per rotation automatica.",
    refresh_token: data.refresh_token,
    access_token: data.access_token,
    expires_in: data.expires_in,
  });
}
