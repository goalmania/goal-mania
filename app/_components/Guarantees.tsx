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
    title: "Reso entro 14 giorni",
    description:
      "Hai 14 giorni dalla consegna per ripensarci. Restituisci la maglia non indossata, con cartellino e imballo originale, e ti rimborsiamo entro 14 giorni da quando riceviamo il reso.",
    icon: "✅",
  },
  {
    title: "Reso difettoso o sbagliato: gratis",
    description:
      "Se la maglia arriva difettosa o diversa dall'ordine, ci pensiamo noi: ritiro e sostituzione o rimborso senza costi per te. Per un reso volontario le spese di spedizione sono a carico del cliente.",
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
      <h2 className="text-xl sm:text-2xl font-bold leading-tight sm:leading-10 tracking-tight text-white">
        Affidabilità Garantita ✅
      </h2>
      <dl className="mt-6 sm:mt-10 space-y-4 sm:space-y-6 divide-y divide-gray-900/10">
        {guarantees.map((guarantee, index) => (
          <div key={index} className="pt-4 sm:pt-6">
            <dt>
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-start justify-between text-left text-white"
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
              <p className="text-xs sm:text-sm md:text-base leading-6 sm:leading-7 text-white/60">
                {guarantee.description}
              </p>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
