import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function pct(s: string): string {
  return encodeURIComponent(s).replace(/[!'()*]/g, (c) =>
    "%" + c.charCodeAt(0).toString(16).toUpperCase()
  );
}

function buildOAuth1Header(
  method: string,
  url: string,
  consumerKey: string,
  consumerSecret: string,
  token: string,
  tokenSecret: string
): string {
  const params: Record<string, string> = {
    oauth_consumer_key:     consumerKey,
    oauth_nonce:            crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp:        String(Math.floor(Date.now() / 1000)),
    oauth_token:            token,
    oauth_version:          "1.0",
  };

  const paramStr = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${pct(k)}=${pct(v)}`)
    .join("&");

  const base = [method.toUpperCase(), pct(url), pct(paramStr)].join("&");
  const sigKey = `${pct(consumerSecret)}&${pct(tokenSecret)}`;

  params.oauth_signature = crypto
    .createHmac("sha1", sigKey)
    .update(base)
    .digest("base64");

  return (
    "OAuth " +
    Object.entries(params)
      .map(([k, v]) => `${pct(k)}="${pct(v)}"`)
      .join(", ")
  );
}

export async function POST(req: NextRequest) {
  const API_KEY            = process.env.TWITTER_API_KEY;
  const API_SECRET         = process.env.TWITTER_API_SECRET;
  const ACCESS_TOKEN       = process.env.TWITTER_ACCESS_TOKEN;
  const ACCESS_TOKEN_SECRET = process.env.TWITTER_ACCESS_TOKEN_SECRET;

  if (!API_KEY || !API_SECRET || !ACCESS_TOKEN || !ACCESS_TOKEN_SECRET) {
    return NextResponse.json(
      { error: "Twitter/X non configurato. Aggiungi TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN e TWITTER_ACCESS_TOKEN_SECRET in .env.local" },
      { status: 503 }
    );
  }

  const { text } = (await req.json()) as { text: string };
  if (!text) return NextResponse.json({ error: "text è obbligatorio" }, { status: 400 });

  const TWEET_URL = "https://api.twitter.com/2/tweets";
  const auth = buildOAuth1Header("POST", TWEET_URL, API_KEY, API_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET);

  try {
    const res = await fetch(TWEET_URL, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = data.detail || data.title || `Twitter API error ${res.status}`;
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json({ success: true, tweetId: data.data?.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Errore sconosciuto";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
