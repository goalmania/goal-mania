"use client";

import { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";

// ─── FAQ content hardcoded (dark-theme safe) ─────────────────────────────────
const FAQ_TABS = [
  {
    id: "generale",
    label: "Generale",
    questions: [
      {
        q: "Dopo quanto arriva la maglia?",
        a: "Solitamente tra i 10 e i 14 giorni lavorativi dalla conferma dell'ordine. Puoi monitorare la spedizione in tempo reale dalla sezione 'Traccia il tuo ordine'.",
      },
      {
        q: "Come è la qualità del prodotto?",
        a: "Ottima. Selezioniamo con cura ogni materiale: tessuto tecnico traspirante, stampe ad alta definizione e cuciture rinforzate. Ogni maglia supera un controllo qualità prima della spedizione.",
      },
      {
        q: "Come scelgo la taglia giusta?",
        a: "Ogni pagina prodotto ha una guida alle taglie dettagliata con misure in cm. In caso di dubbio, consigliamo di prendere una taglia in più — il tessuto non si restringe dopo il lavaggio.",
      },
    ],
  },
  {
    id: "spedizione",
    label: "Spedizione",
    questions: [
      {
        q: "La spedizione è gratuita?",
        a: "Sì, la spedizione è gratuita su tutti gli ordini, senza minimo di spesa. Offriamo anche spedizione espressa con consegna prioritaria.",
      },
      {
        q: "Spedite in tutta Europa?",
        a: "Sì, spediamo in tutta Europa e in molti paesi extra-UE. I tempi variano leggermente a seconda della destinazione (12-18 giorni per destinazioni fuori UE).",
      },
      {
        q: "Come faccio a tracciare il mio ordine?",
        a: "Riceverai un'email con il codice di tracking non appena la maglia viene affidata al corriere. Puoi seguire la spedizione dal link nell'email o dalla sezione ordini del tuo account.",
      },
    ],
  },
  {
    id: "pagamenti",
    label: "Pagamenti",
    questions: [
      {
        q: "I pagamenti sono sicuri?",
        a: "Assolutamente. Utilizziamo crittografia SSL a 256 bit e gateway di pagamento certificati PCI-DSS. I tuoi dati non vengono mai memorizzati sui nostri server.",
      },
      {
        q: "Che metodi di pagamento accettate?",
        a: "Accettiamo Visa, Mastercard, American Express, Maestro e PayPal. Non accettiamo contrassegno o bonifico bancario.",
      },
      {
        q: "Posso pagare a rate?",
        a: "Sì, tramite PayPal offriamo la possibilità di dilazionare il pagamento in 3 rate senza interessi per ordini superiori a €30.",
      },
    ],
  },
  {
    id: "resi",
    label: "Resi & Garanzia",
    questions: [
      {
        q: "Accettate resi?",
        a: "Sì, accettiamo resi entro 30 giorni dalla data di ricevimento. La maglia deve essere nelle condizioni originali, non lavata e con cartellino attaccato. Il rimborso viene emesso entro 5 giorni lavorativi.",
      },
      {
        q: "C'è una garanzia?",
        a: "Sì. Se la maglia arriva danneggiata o diversa da come descritta, ti rimborsiamo o rispediamo subito un nuovo prodotto, senza nessun costo aggiuntivo. Contattaci a goalmaniaofficial@gmail.com.",
      },
      {
        q: "Come contatto l'assistenza?",
        a: "Puoi scriverci a goalmaniaofficial@gmail.com o tramite WhatsApp. Rispondiamo entro 24 ore, spesso molto prima.",
      },
    ],
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="border-b"
      style={{ borderColor: "rgba(255,255,255,0.06)" }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
      >
        <span
          className="font-bold text-sm leading-snug transition-colors"
          style={{
            fontFamily: "var(--font-display, sans-serif)",
            color: open ? "#c8f000" : "rgba(255,255,255,0.85)",
          }}
        >
          {q}
        </span>
        <ChevronDown
          size={16}
          className="flex-shrink-0 mt-0.5 transition-transform duration-300"
          style={{
            color: open ? "#c8f000" : "rgba(255,255,255,0.3)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? "400px" : "0" }}
      >
        <p
          className="text-sm pb-5 leading-relaxed"
          style={{
            color: "rgba(255,255,255,0.5)",
            fontFamily: "var(--font-body, sans-serif)",
          }}
        >
          {a}
        </p>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [activeTab, setActiveTab] = useState("generale");
  const current = FAQ_TABS.find((t) => t.id === activeTab) ?? FAQ_TABS[0];

  return (
    <section
      className="py-16 relative"
      style={{ background: "#080808", borderTop: "0.5px solid rgba(255,255,255,0.05)" }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-4 h-[1.5px] rounded-full inline-block" style={{ background: "#c8f000" }} />
            <span className="text-[9px] uppercase tracking-[3px] font-bold" style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.6)" }}>
              // Hai domande?
            </span>
            <span className="w-4 h-[1.5px] rounded-full inline-block" style={{ background: "#c8f000" }} />
          </div>
          <h2
            className="font-black uppercase text-white"
            style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", letterSpacing: "-0.5px" }}
          >
            Domande Frequenti
          </h2>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 mb-8 overflow-x-auto"
          style={{ scrollbarWidth: "none", borderBottom: "1px solid rgba(255,255,255,0.06)" } as React.CSSProperties}
        >
          {FAQ_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-shrink-0 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all relative"
              style={{
                fontFamily: "var(--font-mono, monospace)",
                color: activeTab === tab.id ? "#c8f000" : "rgba(255,255,255,0.35)",
                background: "transparent",
                border: "none",
                borderBottom: activeTab === tab.id ? "2px solid #c8f000" : "2px solid transparent",
                marginBottom: "-1px",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Questions */}
        <div>
          {current.questions.map((item, i) => (
            <AccordionItem key={i} q={item.q} a={item.a} />
          ))}
        </div>

        {/* CTA */}
        <div
          className="mt-10 p-6 rounded-2xl flex items-center gap-4 flex-wrap"
          style={{ background: "rgba(200,240,0,0.04)", border: "1px solid rgba(200,240,0,0.1)" }}
        >
          <MessageCircle size={24} style={{ color: "#c8f000", flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm text-white mb-0.5" style={{ fontFamily: "var(--font-display, sans-serif)" }}>
              Non hai trovato la risposta?
            </p>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-mono, monospace)" }}>
              Scrivici — rispondiamo entro 24 ore
            </p>
          </div>
          <a
            href="mailto:goalmaniaofficial@gmail.com"
            className="px-5 py-2.5 rounded-full font-black text-[11px] uppercase tracking-widest transition-all hover:opacity-90 active:scale-[0.97] flex-shrink-0"
            style={{ background: "#c8f000", color: "#0a0a0a", fontFamily: "var(--font-display, sans-serif)", letterSpacing: "1.5px" }}
          >
            Contattaci
          </a>
        </div>
      </div>
    </section>
  );
}
