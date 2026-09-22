import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/lib/models/User";
import { sendEmail } from "@/lib/utils/email";

// Campagna win-back una tantum verso i clienti che hanno gia' comprato ma non
// tornano da un po'. Protetta come le altre route admin (x-admin-token).
// Uso:
//   dryRun (default true)  -> non manda nulla, restituisce la lista destinatari
//                             e un'anteprima dell'email
//   testEmail: "..."       -> manda una sola email a questo indirizzo, ignora
//                             la lista clienti reale (per verificare il mittente)
//   dryRun: false           -> invio reale a tutti i clienti trovati

export const maxDuration = 60;

const SENDER = { name: "Goal Mania", email: "redazionegoalmania@gmail.com" };
const COUPON_CODE = "TORNA15";
const COUPON_EXPIRY_LABEL = "22 ottobre";

function renderEmail(firstName: string) {
  const greeting = firstName ? `Ciao ${firstName},` : "Ciao,";
  const subject = "Non ti vediamo da un po': ecco il 15%";
  const text = `${greeting}\n\nsono arrivate le maglie della nuova stagione e ci siamo accorti che manchi da un po'.\n\nCodice ${COUPON_CODE}: 15% su tutto il catalogo, valido fino al ${COUPON_EXPIRY_LABEL}.\n\nVai allo shop: https://goal-mania.it/shop\n\nGoal Mania`;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:system-ui,-apple-system,sans-serif">
  <div style="max-width:520px;margin:0 auto;padding:32px 16px">
    <div style="text-align:center;margin-bottom:32px">
      <span style="font-size:22px;font-weight:900;color:#c8f000;letter-spacing:-0.5px">GOAL MANIA</span>
    </div>
    <div style="background:#141414;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:28px;margin-bottom:20px">
      <h1 style="color:#ffffff;font-size:22px;font-weight:900;margin:0 0 8px">${greeting}</h1>
      <p style="color:rgba(255,255,255,0.5);font-size:15px;line-height:1.5;margin:0 0 20px">
        Sono arrivate le maglie della nuova stagione e ci siamo accorti che manchi da un po'.
      </p>
      <div style="background:rgba(200,240,0,0.08);border:1.5px dashed #c8f000;border-radius:12px;padding:16px;margin-bottom:24px;text-align:center">
        <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.5px">Codice sconto</p>
        <p style="color:#c8f000;font-size:20px;font-weight:900;margin:0;letter-spacing:1px">${COUPON_CODE}</p>
        <p style="color:rgba(255,255,255,0.35);font-size:12px;margin:8px 0 0">15% su tutto, valido fino al ${COUPON_EXPIRY_LABEL}</p>
      </div>
      <a href="https://goal-mania.it/shop" style="display:block;background:#c8f000;color:#000000;text-align:center;padding:16px 24px;border-radius:14px;font-weight:900;font-size:16px;text-decoration:none;letter-spacing:-0.3px">
        Vai allo shop →
      </a>
    </div>
    <p style="color:rgba(255,255,255,0.2);font-size:11px;text-align:center">
      Goal Mania — goal-mania.it<br>
      <a href="https://goal-mania.it/unsubscribe" style="color:rgba(255,255,255,0.2)">Annulla iscrizione</a>
    </p>
  </div>
</body>
</html>`;
  return { subject, text, html };
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const dryRun = body.dryRun !== false;
  const testEmail: string | undefined = body.testEmail;

  await connectDB();

  let recipients: { email: string; name: string }[];

  if (testEmail) {
    recipients = [{ email: testEmail, name: "" }];
  } else {
    const orders = await Order.find({})
      .select("userId guestEmail shippingAddress.fullName")
      .lean();

    const userIds = [...new Set(orders.map((o: any) => o.userId).filter(Boolean))];
    const users = userIds.length
      ? await User.find({ _id: { $in: userIds } }).select("email name").lean()
      : [];
    const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));

    const byEmail = new Map<string, string>();
    for (const o of orders as any[]) {
      if (o.userId && userMap.has(o.userId)) {
        const u = userMap.get(o.userId)!;
        if (u.email) byEmail.set(u.email.toLowerCase(), u.name || "");
      } else if (o.guestEmail) {
        byEmail.set(o.guestEmail.toLowerCase(), o.shippingAddress?.fullName || "");
      }
    }
    // Account interni/di test finiti tra gli ordini (non clienti veri):
    // niente email di "ci manchi" all'account admin del sito.
    const EXCLUDE = new Set(["goalmaniaofficial@gmail.com", "admin-arpit@gmail.com"]);
    recipients = [...byEmail.entries()]
      .filter(([email]) => !EXCLUDE.has(email))
      .map(([email, name]) => ({ email, name }));
  }

  if (dryRun) {
    const sample = renderEmail(recipients[0]?.name?.split(" ")[0] || "");
    return NextResponse.json({ dryRun: true, count: recipients.length, recipients, sample });
  }

  let sent = 0;
  const errors: string[] = [];
  for (const r of recipients) {
    try {
      const firstName = (r.name || "").split(" ")[0] || "";
      const { subject, text, html } = renderEmail(firstName);
      await sendEmail({ to: r.email, subject, text, html, from: SENDER });
      sent++;
    } catch (e) {
      errors.push(`${r.email}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return NextResponse.json({ ok: true, sent, total: recipients.length, errors });
}
