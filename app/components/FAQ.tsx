"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const faqs = [
  {
    question: "Dopo Quanto Arriva?",
    answer:
      'La tua attesa sarà breve! Solitamente impiega tra i 10-14 giorni per arrivare a casa tua. Puoi controllare lo stato del tuo ordine nella sezione "Traccia il tuo ordine"!',
  },
  {
    question: "I Pagamenti Sono Sicuri?",
    answer:
      "Assolutamente. La sicurezza dei tuoi pagamenti è la nostra massima priorità. Utilizziamo sistemi di pagamento sicuri e affidabili per garantire una transazione senza preoccupazioni.",
  },
  {
    question: "Che Metodi di Pagamento Accettate?",
    answer:
      "Gli acquisti sul nostro sito possono essere effettuati tramite: Visa, Mastercard, American Express, Mestro e PayPal. Non accettiamo pagamenti in contanti, tramite assegno, contrassegno o bonifico bancario. Ogni acquisto avviene nella massima sicurezza per proteggere i tuoi dati personali e le informazioni sulla tua carta di credito da accessi non autorizzati.",
  },
  {
    question: "Come è la Qualità del Prodotto?",
    answer:
      "La qualità del nostro prodotto è ottima. Mettiamo grande cura nella selezione dei materiali e nel processo di produzione per garantire che ogni articolo soddisfi gli standard più elevati.",
  },
  {
    question: "C'è una Garanzia?",
    answer:
      'Certo! Se il prodotto dovesse arrivare danneggiato o diverso da come te lo aspettavi, contattaci alla mail "goalmaniaofficial@gmail.com". Ti risponderemo al più presto!',
  },
  {
    question: "Accettate Resi?",
    answer:
      "Certamente! Accettiamo resi entro un periodo massimo di 7 giorni dalla data di acquisto. La tua soddisfazione è la nostra priorità, e desideriamo garantire che ogni cliente sia felice con il proprio acquisto.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-4xl divide-y divide-gray-900/10">
      <h2 className="text-xl sm:text-2xl font-bold leading-tight sm:leading-10 tracking-tight text-gray-900">
        FAQ
      </h2>
      <dl className="mt-6 sm:mt-10 space-y-4 sm:space-y-6 divide-y divide-gray-900/10">
        {faqs.map((faq, index) => (
          <div key={index} className="pt-4 sm:pt-6">
            <dt>
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-start justify-between text-left text-gray-900"
              >
                <span className="text-sm sm:text-base font-semibold leading-6 sm:leading-7">
                  {faq.question}
                </span>
                <span className="ml-4 sm:ml-6 flex h-6 sm:h-7 items-center">
                  <ChevronDownIcon
                    className={`h-5 w-5 sm:h-6 sm:w-6 transform ${
                      openIndex === index ? "rotate-180" : ""
                    } duration-200`}
                  />
                </span>
              </button>
            </dt>
            <dd
              className={`mt-2 px-6 overflow-hidden transition-all duration-200 ${
                openIndex === index ? "max-h-96" : "max-h-0"
              }`}
            >
              <p className="text-xs sm:text-sm md:text-base leading-6 sm:leading-7 text-gray-600">
                {faq.answer}
              </p>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
