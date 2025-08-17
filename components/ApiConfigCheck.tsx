/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/hooks/useI18n";

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
  const { t } = useI18n();

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
        setError(err instanceof Error ? err.message : t('apiConfig.unknownError'));
      } finally {
        setIsLoading(false);
      }
    }

    checkApiConfig();
  }, [t]);

  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-50 max-w-sm">
        <div className="flex items-center">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent mr-2"></div>
          <span>{t('apiConfig.checking')}</span>
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
            <span>{t('apiConfig.error')}: {error}</span>
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
              ? t('apiConfig.noApiKey')
              : !status.isApiKeyValid
              ? t('apiConfig.invalidApiKey')
              : t('apiConfig.configurationIssues')}
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-amber-700 hover:text-amber-900"
          >
            {isExpanded ? t('apiConfig.lessDetails') : t('apiConfig.moreDetails')}
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
          <p className="mb-2">{t('apiConfig.currentStatus')}:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              {t('apiConfig.apiKeyConfigured')}:{" "}
              <span
                className={status.hasApiKey ? "text-green-600" : "text-red-600"}
              >
                {status.hasApiKey ? t('common.yes') : t('common.no')}
              </span>
            </li>
            {status.hasApiKey && (
              <li>
                {t('apiConfig.apiKeyValid')}:{" "}
                <span
                  className={
                    status.isApiKeyValid ? "text-green-600" : "text-red-600"
                  }
                >
                  {status.isApiKeyValid ? t('common.yes') : t('common.no')}
                </span>
              </li>
            )}
          </ul>

          <div className="mt-3">
            <p className="mb-2 font-medium">{t('apiConfig.toResolve')}:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                {t('apiConfig.addVariable')}{" "}
                <code className="bg-amber-100 px-1 rounded">FOOTBALL_API</code>{" "}
                {t('apiConfig.inFile')}{" "}
                <code className="bg-amber-100 px-1 rounded">.env.local</code>{" "}
                {t('apiConfig.forServerSide')}{" "}
                <code className="bg-amber-100 px-1 rounded">
                  NEXT_PUBLIC_FOOTBALL_API_KEY
                </code>{" "}
                {t('apiConfig.forClientSide')}.
              </li>
              <li>
                {t('apiConfig.useHeader')}{" "}
                <code className="bg-amber-100 px-1 rounded">
                  x-apisports-key
                </code>{" "}
                {t('apiConfig.inApiRequests')}
              </li>
              <li>
                {t('apiConfig.getApiKey')}{" "}
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
                {t('apiConfig.restartServer')}
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
