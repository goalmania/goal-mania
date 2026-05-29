/**
 * Google Indexing API — notifica Google quando un articolo viene pubblicato.
 * Richiede una service account Google con permesso Owner in Search Console.
 *
 * Setup:
 *  1. Crea service account in Google Cloud Console (IAM → Service Accounts)
 *  2. Scarica il JSON delle credenziali
 *  3. In Google Search Console → Impostazioni → Utenti e autorizzazioni → Aggiungi utente
 *     con l'email della service account come "Proprietario"
 *  4. Aggiungi in Vercel env: GOOGLE_INDEXING_SA_KEY=<JSON credenziali in base64>
 *     (bash: base64 -i service-account.json | tr -d '\n')
 *
 * Quota gratuita: 200 URL/giorno — sufficiente per 20 articoli/giorno.
 */

import crypto from "crypto";

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
}

function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function getAccessToken(sa: ServiceAccountKey): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const payload = base64url(
    Buffer.from(
      JSON.stringify({
        iss: sa.client_email,
        scope: "https://www.googleapis.com/auth/indexing",
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600,
      })
    )
  );

  const signingInput = `${header}.${payload}`;
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(signingInput);
  const signature = sign
    .sign(sa.private_key)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const jwt = `${signingInput}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google OAuth token error: ${err}`);
  }

  const data = await res.json() as { access_token: string };
  return data.access_token;
}

const INDEXNOW_KEY = "9a13f9bf3e012bc0728435b5b152ea68";

/**
 * Notifica IndexNow (Bing/Yahoo/Yandex) quando un URL viene pubblicato.
 * Non richiede Search Console — solo il file chiave in /public.
 */
async function notifyIndexNow(url: string): Promise<void> {
  try {
    const res = await fetch(
      `https://api.indexnow.org/indexnow?url=${encodeURIComponent(url)}&key=${INDEXNOW_KEY}`,
      { method: "GET" }
    );
    if (res.ok || res.status === 202) {
      console.log(`[IndexNow] ✅ Notificato: ${url}`);
    } else {
      console.warn(`[IndexNow] Status ${res.status} per ${url}`);
    }
  } catch (err) {
    console.warn(`[IndexNow] Errore per ${url}:`, err);
  }
}

/**
 * Notifica tutti i motori di ricerca: Google Indexing API + IndexNow.
 * Fire-and-forget: non lancia eccezioni bloccanti.
 */
export async function notifySearchEngines(url: string): Promise<void> {
  await Promise.allSettled([
    notifyGoogleIndexing(url),
    notifyIndexNow(url),
  ]);
}

/**
 * Notifica Google Indexing API che l'URL è stato aggiornato.
 * Fire-and-forget: non lancia eccezioni bloccanti.
 */
export async function notifyGoogleIndexing(url: string): Promise<void> {
  const saKeyB64 = process.env.GOOGLE_INDEXING_SA_KEY;
  if (!saKeyB64) return; // env non configurata, skip silenzioso

  try {
    const sa = JSON.parse(Buffer.from(saKeyB64, "base64").toString("utf8")) as ServiceAccountKey;
    const token = await getAccessToken(sa);

    const res = await fetch(
      "https://indexing.googleapis.com/v3/urlNotifications:publish",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, type: "URL_UPDATED" }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.warn(`[GoogleIndexing] Errore per ${url}: ${err}`);
    } else {
      console.log(`[GoogleIndexing] ✅ Indicizzazione richiesta: ${url}`);
    }
  } catch (err) {
    console.warn(`[GoogleIndexing] Fallito per ${url}:`, err);
  }
}
