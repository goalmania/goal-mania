import webpush from "web-push";
import connectDB from "@/lib/db";
import PushSubscription from "@/lib/models/PushSubscription";

let configured = false;
function ensureConfigured() {
  if (configured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) {
    throw new Error("VAPID keys not configured");
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

// Invia una notifica push a tutti i device admin registrati. Non blocca mai
// il chiamante: ogni fallimento e' loggato e le subscription scadute
// (410/404) vengono rimosse, ma un errore qui non deve mai far fallire la
// creazione dell'ordine.
export async function sendPushToAdmins(payload: PushPayload) {
  try {
    ensureConfigured();
    await connectDB();
    const subscriptions = await PushSubscription.find({});
    if (subscriptions.length === 0) return;

    const body = JSON.stringify(payload);

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
            },
            body
          );
        } catch (err: any) {
          if (err?.statusCode === 404 || err?.statusCode === 410) {
            await PushSubscription.deleteOne({ _id: sub._id });
          } else {
            console.error("Push notification failed for one subscription:", err?.message || err);
          }
        }
      })
    );
  } catch (err) {
    console.error("sendPushToAdmins error:", err);
  }
}
