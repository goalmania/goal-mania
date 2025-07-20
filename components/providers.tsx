"use client";

import React, { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
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
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
