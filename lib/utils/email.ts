// Invia email transazionali tramite l'API HTTP di Brevo (ex Sendinblue).
// Il precedente transport SMTP (nodemailer) non aveva mai host/user/pass
// configurati in produzione e falliva sempre con ECONNREFUSED a localhost.
export async function sendEmail({ to, subject, text, html }: { to: string; subject: string; text: string; html?: string }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

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
      sender: { name: "Goal Mania", email: senderEmail },
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