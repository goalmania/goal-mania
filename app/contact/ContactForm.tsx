"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

const SUBJECTS = ["Il mio ordine", "Una maglia del catalogo", "Spedizione e consegna", "Reso o rimborso", "Taglie", "Altro"];
const field = "h-14 w-full rounded-2xl bg-[var(--wall-2)] px-4 text-[17px] text-white placeholder:text-[var(--text-3)] shadow-[inset_0_0_0_1px_var(--line)] focus:outline-none focus:shadow-[inset_0_0_0_2px_var(--lime)]";

// Modulo contatti: tutti i campi sono visibili e l'errore dice cosa manca
export default function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = {
      firstName: String(f.get("firstName") || "").trim(),
      lastName: String(f.get("lastName") || "").trim(),
      email: String(f.get("email") || "").trim(),
      subject: String(f.get("subject") || ""),
      message: String(f.get("message") || "").trim(),
      language: "it",
    };
    if (data.firstName.length < 2 || data.lastName.length < 2) return setErr("Scrivi nome e cognome (almeno 2 lettere).");
    if (!/^\S+@\S+\.\S+$/.test(data.email)) return setErr("L'email non sembra giusta.");
    if (!data.subject) return setErr("Scegli di cosa vuoi parlare.");
    if (data.message.length < 10) return setErr("Il messaggio è troppo corto: scrivi almeno 10 caratteri.");
    setErr("");
    setState("sending");
    try {
      const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!r.ok) throw new Error();
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done")
    return (
      <div className="rounded-3xl bg-[var(--wall)] p-8 shadow-[inset_0_0_0_1px_var(--line)]" role="status">
        <CheckCircle2 className="h-10 w-10 text-[var(--lime)]" />
        <p className="disp mt-3 text-[clamp(2rem,4vw,3rem)] text-white">Messaggio inviato</p>
        <p className="mt-2 text-[18px] italic text-[var(--text-2)]">Ti rispondiamo via email. Controlla anche la cartella spam.</p>
      </div>
    );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-3xl bg-[var(--wall)] p-5 shadow-[inset_0_0_0_1px_var(--line)] md:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="firstName" autoComplete="given-name" placeholder="Nome" aria-label="Nome" className={field} />
        <input name="lastName" autoComplete="family-name" placeholder="Cognome" aria-label="Cognome" className={field} />
      </div>
      <input name="email" type="email" inputMode="email" autoComplete="email" placeholder="La tua email" aria-label="Email" className={field} />
      <select name="subject" defaultValue="" aria-label="Argomento" className={field}>
        <option value="" disabled>Di cosa vuoi parlare?</option>
        {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <textarea name="message" rows={6} placeholder="Scrivi qui. Se è per un ordine, aggiungi il numero." aria-label="Messaggio" className={`${field} h-auto py-4`} />
      {(err || state === "error") && <p role="alert" className="text-[16px] font-semibold text-[var(--red)]">{err || "Non siamo riusciti a inviare il messaggio. Riprova, oppure scrivi direttamente alla nostra email."}</p>}
      <button type="submit" disabled={state === "sending"} className="btn btn-lime w-full sm:w-auto disabled:opacity-60">
        {state === "sending" ? "Invio…" : <>Invia il messaggio <Send className="h-5 w-5" strokeWidth={2.6} /></>}
      </button>
    </form>
  );
}
