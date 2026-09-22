// Invia email transazionali tramite l'API HTTP di Brevo (ex Sendinblue).
// Il precedente transport SMTP (nodemailer) non aveva mai host/user/pass
// configurati in produzione e falliva sempre con ECONNREFUSED a localhost.
export async function sendEmail({
  to,
  subject,
  text,
  html,
  from,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  // Sovrascrive il mittente di default (BREVO_SENDER_EMAIL) — usato per le
  // campagne che devono partire da un indirizzo diverso da quello
  // transazionale, es. redazionegoalmania@gmail.com per il win-back.
  // Deve essere un mittente gia' verificato nell'account Brevo, altrimenti
  // l'API risponde 400.
  from?: { name: string; email: string };
}) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = from?.email || process.env.BREVO_SENDER_EMAIL;

  if (!apiKey || !senderEmail) {
    throw new Error(
      "Email non inviata: BREVO_API_KEY o BREVO_SENDER_EMAIL mancanti nelle variabili d'ambiente."
    );
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: from?.name || "Goal Mania", email: senderEmail },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html || text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Brevo API error (${res.status}): ${body}`);
  }

  return res.json();
}