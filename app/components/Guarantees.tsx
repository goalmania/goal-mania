"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const guarantees = [
  {
    title: "Pagamenti Protetti",
    description:
      "Garantiamo transazioni senza rischi, mettendo la tua sicurezza al primo posto. Puoi fare acquisti con fiducia, sapendo che ogni transazione è gestita con sistemi affidabili e di sicurezza massima.",
    icon: "🔒",
  },
  {
    title: "Garanzia di 7 Giorni",
    description:
      "Con la nostra garanzia di 7 giorni, offriamo la tranquillità di poter provare il tuo acquisto senza preoccupazioni. Se per qualsiasi motivo non fossi completamente soddisfatto, hai 7 giorni per restituire il prodotto e ottenere un rimborso completo.",
    icon: "✅",
  },
  {
    title: "Reso Gratuito",
    description:
      "Offriamo resi gratuiti per garantire che ogni acquisto soddisfi le tue aspettative. Se per qualsiasi motivo desideri restituire il tuo prodotto, rendilo entro 7 giorni e goditi un reso senza costi aggiuntivi.",
    icon: "🔄",
  },
  {
    title: "Ordine Tracciabile",
    description:
      'Ogni acquisto offre la tranquillità di un ordine completamente tracciabile. Per fare ciò, semplicemente inserisci il numero del pacco che forniremo nell\'apposita pagina "Traccia il Tuo Ordine"!',
    icon: "📦",
  },
];

export default function Guarantees() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-4xl divide-y divide-gray-900/10">
      <h2 className="text-xl sm:text-2xl font-bold leading-tight sm:leading-10 tracking-tight text-gray-900">
        Affidabilità Garantita ✅
      </h2>
      <dl className="mt-6 sm:mt-10 space-y-4 sm:space-y-6 divide-y divide-gray-900/10">
        {guarantees.map((guarantee, index) => (
          <div key={index} className="pt-4 sm:pt-6">
            <dt>
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-start justify-between text-left text-gray-900"
              >
                <span className="flex items-center text-sm sm:text-base font-semibold leading-6 sm:leading-7">
                  <span className="mr-2 sm:mr-3 text-base sm:text-xl">
                    {guarantee.icon}
                  </span>
                  {guarantee.title}
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
                {guarantee.description}
              </p>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
