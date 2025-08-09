"use client";

import React, { useState, useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { I18nextProvider } from "react-i18next";
import initI18next from "@/lib/i18n";
import { useLanguageStore } from "@/lib/store/language";
import { LoadingFallback } from "./shared/loading-fallback";

function I18nProvider({ children }: { children: React.ReactNode }) {
  const { language } = useLanguageStore();
  const [i18nInstance, setI18nInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initI18n = async () => {
      try {
        console.log('🌍 I18nProvider: Initializing i18n with language:', language);
        const instance = await initI18next(language, 'common');
        setI18nInstance(instance);
        console.log('🌍 I18nProvider: i18n instance created:', instance);
      } catch (error) {
        console.error('Failed to initialize i18n:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initI18n();
  }, []); // Only initialize once, not on every language change

  // Update language when it changes
  useEffect(() => {
    if (i18nInstance && i18nInstance.language !== language) {
      console.log('🌍 I18nProvider: Updating language from', i18nInstance.language, 'to', language);
      i18nInstance.changeLanguage(language);
    }
  }, [language, i18nInstance]);

  if (isLoading || !i18nInstance) {
    return <div><LoadingFallback /></div>;
  }

  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <I18nProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#fff",
                color: "#333",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              },
              success: {
                iconTheme: {
                  primary: "#10B981",
                  secondary: "#FFFFFF",
                },
              },
              error: {
                iconTheme: {
                  primary: "#EF4444",
                  secondary: "#FFFFFF",
                },
              },
            }}
          />
        </I18nProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
