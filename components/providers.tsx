"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { I18nextProvider } from "react-i18next";
import i18nInstance from "@/lib/i18n";
import { useLanguageStore } from "@/lib/store/language";
import { useEffect } from "react";

function LanguageSync() {
  const { language } = useLanguageStore();
  useEffect(() => {
    if (i18nInstance.language !== language) {
      i18nInstance.changeLanguage(language);
    }
  }, [language]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <I18nextProvider i18n={i18nInstance}>
          <LanguageSync />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 1000,
              style: {
                background: "#fff",
                color: "#333",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              },
              success: {
                iconTheme: { primary: "#10B981", secondary: "#FFFFFF" },
              },
              error: {
                iconTheme: { primary: "#EF4444", secondary: "#FFFFFF" },
              },
            }}
          />
        </I18nextProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
