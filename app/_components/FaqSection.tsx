"use client";

import { useState } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useI18n } from "@/lib/hooks/useI18n";

export default function FaqSection() {
  const { t } = useI18n();

  // Track selected FAQ category
  const [activeCategory, setActiveCategory] = useState("generale");

  // Define FAQ categories
  const categories = [
    { id: "generale", label: "GENERALE" },
    { id: "costruzione", label: "COSTRUZIONE" },
    { id: "assistenza", label: "ASSISTENZA" },
    { id: "legale", label: "LEGALE" },
  ];

  // ===== Custom fallback FAQs (editable here) =====
  const fallbackFaqs: Record<string, Array<{ question: string; answer: string }>> = {
    generale: [
      {
        question: "Dopo Quanto Arriva?",
        answer:
          "La tua attesa sarà breve! Solitamente impiega tra i 10-14 giorni per arrivare a casa tua. Puoi controllare lo stato del tuo ordine nella sezione 'Traccia il tuo ordine'!",
      },
      {
        question: "I Pagamenti Sono Sicuri?",
        answer:
          "Assolutamente. La sicurezza dei tuoi pagamenti è la nostra massima priorità. Utilizziamo sistemi di pagamento sicuri e affidabili per garantire una transazione senza preoccupazioni.",
      },
      {
        question: "Che Metodi di Pagamento Accettate?",
        answer:
          "Gli acquisti sul nostro sito possono essere effettuati tramite: Visa, Mastercard, American Express, Maestro e PayPal. Non accettiamo pagamenti in contanti, tramite.",
      },
    ],
    costruzione: [
      {
        question: "Offrite servizi di personalizzazione?",
        answer: "Sì, è possibile richiedere personalizzazioni specifiche sui nostri prodotti.",
      },
    ],
    assistenza: [
      {
        question: "Come posso contattare il supporto?",
        answer: "Puoi scriverci via email o tramite la chat live sul nostro sito, attiva 24/7.",
      },
    ],
    legale: [
      {
        question: "Dove trovo i termini e le condizioni?",
        answer: "I termini e condizioni sono disponibili nella sezione dedicata in fondo al sito.",
      },
    ],
  };

  // Get questions dynamically from i18n or fallback
  const rawQuestions = t(`faq.${activeCategory}`, { returnObjects: true });
  const questions =
    Array.isArray(rawQuestions) && rawQuestions.length > 0
      ? rawQuestions
      : fallbackFaqs[activeCategory] || [];

  return (
    <div className="mx-auto max-w-4xl">
      {/* Category Tabs */}
      <div className="grid grid-cols-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`w-full px-4 py-3 sm:py-4 text-sm border border-[#ffff] sm:text-base font-semibold uppercase tracking-wide transition-colors ${
              activeCategory === cat.id
                ? "bg-transparent text-[#0A1A2F]"
                : "bg-[#0A1A2F] text-[#F5F5F5] hover:bg-[#132c4d]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Accordion FAQ */}
      <Accordion
        type="single"
        collapsible
        className="mt-6 sm:mt-10 divide-y divide-gray-300"
      >
        {questions.map((faq, index) => (
          <AccordionItem
            key={index}
            value={String(index)}
            className="pt-4 sm:pt-6 border-0"
          >
            <AccordionTrigger className="flex w-full items-start justify-between text-left text-[#0A1A2F] text-sm sm:text-base font-semibold leading-6 sm:leading-7 py-2 hover:underline">
              {`Q${index + 1}. ${faq.question}`}
            </AccordionTrigger>
            <AccordionContent className="px-2 sm:px-6">
              <p className="text-xs sm:text-sm md:text-base leading-6 sm:leading-7 text-gray-700">
                {faq.answer}
              </p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
