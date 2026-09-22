import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { AbandonedCart } from "@/lib/models/AbandonedCart";
import Coupon from "@/lib/models/Coupon";
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

      // Sconto di recupero: un codice nuovo per ogni carrello, usabile una
      // volta sola (maxUses: 1 è già applicato da /api/coupons/validate e
      // /apply). Non è legato all'email a livello di schema, ma è privato
      // (lo riceve solo questo cliente) e muore al primo utilizzo o dopo 72h.
      const recoveryCode = `RECUPERO${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
      await Coupon.create({
        code: recoveryCode,
        discountPercentage: 15,
        expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
        maxUses: 1,
        description: `Recupero carrello abbandonato — ${cart.email}`,
      });

      await sendEmail({
        to: cart.email,
        subject: `Il tuo carrello ti aspetta, con il 15% di sconto`,
        text: `Ciao,\n\nhai lasciato questi articoli nel carrello:\n\n${itemsText}\n\nTotale: €${cart.total.toFixed(2)}\n\nSe torni entro 72 ore, usa il codice ${recoveryCode} al checkout per il 15% di sconto su questo ordine (vale una volta sola).\n\nCompleta l'ordine qui:\n${recoveryUrl}\n\n— Goal Mania`,
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
      <h1 style="color:#ffffff;font-size:22px;font-weight:900;margin:0 0 8px">Hai lasciato qualcosa nel carrello</h1>
      <p style="color:rgba(255,255,255,0.5);font-size:15px;line-height:1.5;margin:0 0 20px">
        Sono ancora qui, nessuno te li ha presi. Se torni entro 72 ore hai il 15% di sconto su questo ordine.
      </p>

      <!-- Coupon -->
      <div style="background:rgba(200,240,0,0.08);border:1.5px dashed #c8f000;border-radius:12px;padding:16px;margin-bottom:20px;text-align:center">
        <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.5px">Codice sconto</p>
        <p style="color:#c8f000;font-size:20px;font-weight:900;margin:0;letter-spacing:1px">${recoveryCode}</p>
      </div>

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

      <p style="color:rgba(255,255,255,0.35);font-size:12px;text-align:center;margin:12px 0 0">
        Inserisci il codice al checkout, nel campo coupon. Vale una volta sola.
      </p>

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
