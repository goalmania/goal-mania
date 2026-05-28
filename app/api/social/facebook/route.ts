import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const PAGE_ID    = process.env.FACEBOOK_PAGE_ID;
  const PAGE_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!PAGE_ID || !PAGE_TOKEN) {
    return NextResponse.json(
      { error: "Facebook non configurato. Aggiungi FACEBOOK_PAGE_ID e FACEBOOK_PAGE_ACCESS_TOKEN in .env.local" },
      { status: 503 }
    );
  }

  const body = await req.json();
  const { message, link } = body as { message: string; link: string };

  if (!message || !link) {
    return NextResponse.json({ error: "message e link sono obbligatori" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${PAGE_ID}/feed`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, link, access_token: PAGE_TOKEN }),
      }
    );

    const data = await res.json();

    if (!res.ok || data.error) {
      const msg = data.error?.message || `Facebook API error ${res.status}`;
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json({ success: true, postId: data.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Errore sconosciuto";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
