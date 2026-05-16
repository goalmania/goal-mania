"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export default function Page() {
  const params = useSearchParams();
  const isGuest = params.get("guest") === "true";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircleIcon className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <h1 className="text-3xl font-black uppercase tracking-tight text-[#0a0a0a] mb-2">
          Ordine confermato!
        </h1>
        <p className="text-white/60 mb-8">
          Grazie per il tuo acquisto. Riceverai una email di conferma a breve.
        </p>

        {isGuest ? (
          <div className="bg-orange-50 border-2 border-[#c8f000]/30 rounded-2xl p-6 mb-6 text-left">
            <h2 className="font-black uppercase tracking-tight text-[#0a0a0a] mb-1">
              Crea un account
            </h2>
            <p className="text-sm text-white/60 mb-4">
              Registrati per tracciare i tuoi ordini, salvare gli indirizzi e accedere a offerte esclusive.
            </p>
            <Link
              href="/auth/signin"
              className="inline-block w-full text-center bg-gradient-to-r from-[#c8f000] to-orange-500 text-white font-bold py-3 rounded-xl hover:from-[#e0852e] hover:to-orange-600 transition-all"
            >
              Registrati ora
            </Link>
          </div>
        ) : (
          <Link
            href="/account/orders"
            className="inline-block w-full text-center bg-[#0a0a0a] text-white font-bold py-3 rounded-xl hover:bg-[#1a2a3a] transition-all mb-4"
          >
            Vedi i tuoi ordini
          </Link>
        )}

        <Link
          href="/shop"
          className="inline-block text-sm text-[#c8f000] font-semibold hover:underline"
        >
          Continua lo shopping →
        </Link>
      </div>
    </div>
  );
}
