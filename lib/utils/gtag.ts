declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Invia un evento a Google Analytics (GA4) via gtag.js, se caricato
// (richiede NEXT_PUBLIC_GA_MEASUREMENT_ID, vedi app/layout.tsx).
export function trackGtag(event: string, data?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", event, data);
  }
}
