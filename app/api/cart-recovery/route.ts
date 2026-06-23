import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { AbandonedCart } from "@/lib/models/AbandonedCart";
import { sendEmail } from "@/lib/utils/email";
import crypto from "crypto";

// POST — salva carrello abbandonato e schedula email
export async function POST(req: NextRequest) {
  try {
    const { email, items, total } = await req.json();
    if (!email || !items?.length) return NextResponse.json({ ok: true });

    await connectDB();

    const token = crypto.randomBytes(32).toString("hex");

    // Upsert: se questo email ha già un carrello abbandonato, aggiorna
    await AbandonedCart.findOneAndUpdate(
      { email, recoveredAt: { $exists: false } },
      {
        email,
        items,
        total,
        recoveryToken: token,
        emailSentAt: null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[cart-recovery POST]", err);
    return NextResponse.json({ ok: false });
  }
}

// GET — invia email di recupero a carrelli abbandonati da 1-24h senza email inviata
// Chiamata da cron job o manualmente da admin
export async function GET(req: NextRequest) {
  // Vercel cron invia Authorization: Bearer <CRON_SECRET>
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const carts = await AbandonedCart.find({
    emailSentAt: null,
    recoveredAt: { $exists: false },
    createdAt: { $gte: oneDayAgo, $lte: oneHourAgo },
  }).limit(50);

  let sent = 0;
  for (const cart of carts) {
    try {
      const recoveryUrl = `${process.env.NEXTAUTH_URL}/checkout/recover?token=${cart.recoveryToken}`;
      const firstItem = cart.items[0];
      const itemsText = cart.items.map((i) => `• ${i.name} x${i.quantity} — €${(i.price * i.quantity).toFixed(2)}`).join("\n");

      await sendEmail({
        to: cart.email,
        subject: `Hai dimenticato la tua maglia? 🛒 Completa l'ordine`,
        text: `Ciao!\n\nHai lasciato questi articoli nel tuo carrello:\n\n${itemsText}\n\nTotale: €${cart.total.toFixed(2)}\n\nCompleta il tuo ordine qui (valido 24h):\n${recoveryUrl}\n\n— Il team Goal Mania`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:system-ui,-apple-system,sans-serif">
  <div style="max-width:520px;margin:0 auto;padding:32px 16px">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px">
      <span style="font-size:22px;font-weight:900;color:#c8f000;letter-spacing:-0.5px">GOAL MANIA</span>
    </div>

    <!-- Hero -->
    ${firstItem?.image ? `<img src="${firstItem.image}" alt="${firstItem.name}" style="width:100%;max-height:220px;object-fit:cover;border-radius:16px;margin-bottom:24px">` : ""}

    <!-- Message -->
    <div style="background:#141414;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:28px;margin-bottom:20px">
      <h1 style="color:#ffffff;font-size:22px;font-weight:900;margin:0 0 8px">Hai dimenticato qualcosa?</h1>
      <p style="color:rgba(255,255,255,0.5);font-size:15px;line-height:1.5;margin:0 0 24px">
        Il tuo carrello ti sta aspettando. Completa l'ordine prima che le maglie vadano esaurite.
      </p>

      <!-- Items -->
      <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:16px;margin-bottom:24px">
        ${cart.items.map((i) => `
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:${cart.items.indexOf(i) < cart.items.length - 1 ? '12px' : '0'}">
            ${i.image ? `<img src="${i.image}" alt="${i.name}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;flex-shrink:0">` : ''}
            <div style="flex:1">
              <p style="color:#ffffff;font-size:14px;font-weight:600;margin:0">${i.name}</p>
              <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:2px 0 0">Qtà: ${i.quantity}</p>
            </div>
            <span style="color:#c8f000;font-weight:700;font-size:14px">€${(i.price * i.quantity).toFixed(2)}</span>
          </div>
        `).join("")}
        <div style="border-top:1px solid rgba(255,255,255,0.08);margin-top:16px;padding-top:12px;display:flex;justify-content:space-between">
          <span style="color:rgba(255,255,255,0.5);font-size:14px">Totale</span>
          <span style="color:#c8f000;font-weight:900;font-size:18px">€${cart.total.toFixed(2)}</span>
        </div>
      </div>

      <!-- CTA -->
      <a href="${recoveryUrl}" style="display:block;background:#c8f000;color:#000000;text-align:center;padding:16px 24px;border-radius:14px;font-weight:900;font-size:16px;text-decoration:none;letter-spacing:-0.3px">
        Completa l'ordine →
      </a>

      <p style="color:rgba(255,255,255,0.25);font-size:12px;text-align:center;margin:16px 0 0">
        Spedizione gratuita · Reso gratuito 30gg · Pagamento sicuro SSL
      </p>
    </div>

    <p style="color:rgba(255,255,255,0.2);font-size:11px;text-align:center">
      Goal Mania — goal-mania.it<br>
      <a href="${process.env.NEXTAUTH_URL}/unsubscribe?email=${encodeURIComponent(cart.email)}" style="color:rgba(255,255,255,0.2)">Annulla iscrizione</a>
    </p>
  </div>
</body>
</html>`,
      });

      await AbandonedCart.updateOne({ _id: cart._id }, { emailSentAt: new Date() });
      sent++;
    } catch (e) {
      console.error("[cart-recovery email]", e);
    }
  }

  return NextResponse.json({ ok: true, sent, total: carts.length });
}
