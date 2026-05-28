import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const WEBHOOK_URL = process.env.MAKE_FACEBOOK_WEBHOOK_URL;

  if (!WEBHOOK_URL) {
    return NextResponse.json(
      { error: "Facebook non configurato. Aggiungi MAKE_FACEBOOK_WEBHOOK_URL in .env.local" },
      { status: 503 }
    );
  }

  const body = await req.json();
  const { message, link } = body as { message: string; link: string };

  if (!message || !link) {
    return NextResponse.json({ error: "message e link sono obbligatori" }, { status: 400 });
  }

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, link }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Make webhook error ${res.status}: ${text}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Errore sconosciuto";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
