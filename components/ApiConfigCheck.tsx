/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";

interface ApiConfigStatus {
  hasApiKey: boolean;
  isApiKeyValid: boolean;
  apiResponse: any;
}

export function ApiConfigCheck() {
  const [status, setStatus] = useState<ApiConfigStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkApiConfig() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/check-api-config");

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();
        setStatus(data.environmentStatus);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    checkApiConfig();
  }, []);

  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-50 max-w-sm">
        <div className="flex items-center">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent mr-2"></div>
          <span>Verificando configurazione API...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 z-50 max-w-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-2 text-red-500">⚠️</div>
            <span>Errore durante la verifica API: {error}</span>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="ml-4 text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  if (!status) return null;

  // If everything is fine, don't show anything
  if (status.hasApiKey && status.isApiKeyValid) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-4 z-50 max-w-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-2 text-amber-500">⚠️</div>
          <span className="font-medium">
            {!status.hasApiKey
              ? "API Football: Chiave API non configurata"
              : !status.isApiKeyValid
              ? "API Football: Chiave API non valida"
              : "API Football: Problemi di configurazione"}
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-amber-700 hover:text-amber-900"
          >
            {isExpanded ? "Meno dettagli" : "Più dettagli"}
          </button>
          <button
            onClick={() => setIsExpanded(false)}
            className="ml-4 text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 text-sm border-t border-amber-200 pt-3">
          <p className="mb-2">Stato attuale:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Chiave API configurata:{" "}
              <span
                className={status.hasApiKey ? "text-green-600" : "text-red-600"}
              >
                {status.hasApiKey ? "Sì" : "No"}
              </span>
            </li>
            {status.hasApiKey && (
              <li>
                Chiave API valida:{" "}
                <span
                  className={
                    status.isApiKeyValid ? "text-green-600" : "text-red-600"
                  }
                >
                  {status.isApiKeyValid ? "Sì" : "No"}
                </span>
              </li>
            )}
          </ul>

          <div className="mt-3">
            <p className="mb-2 font-medium">Per risolvere:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                Aggiungi o aggiorna la variabile{" "}
                <code className="bg-amber-100 px-1 rounded">FOOTBALL_API</code>{" "}
                nel file{" "}
                <code className="bg-amber-100 px-1 rounded">.env.local</code>{" "}
                per uso server-side e{" "}
                <code className="bg-amber-100 px-1 rounded">
                  NEXT_PUBLIC_FOOTBALL_API_KEY
                </code>{" "}
                per uso client-side.
              </li>
              <li>
                Assicurati di utilizzare l&apos;intestazione{" "}
                <code className="bg-amber-100 px-1 rounded">
                  x-apisports-key
                </code>{" "}
                nelle richieste API
              </li>
              <li>
                Ottieni una chiave API da{" "}
                <a
                  href="https://dashboard.api-football.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  API-Football.com
                </a>
              </li>
              <li>
                Riavvia il server di sviluppo dopo aver configurato la chiave
                API
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
