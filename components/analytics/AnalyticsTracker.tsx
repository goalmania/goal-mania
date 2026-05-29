"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSessionId(): string {
  if (typeof sessionStorage === "undefined") return "";
  let id = sessionStorage.getItem("_gm_sid");
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("_gm_sid", id);
  }
  return id;
}

function getDevice(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

interface CartStorage {
  state?: {
    items?: Array<{ price?: number; quantity?: number }>;
  };
}

function getCartInfo(): { cartItemCount: number; cartValue: number } {
  try {
    const raw = localStorage.getItem("cart-storage");
    if (!raw) return { cartItemCount: 0, cartValue: 0 };
    const parsed: CartStorage = JSON.parse(raw);
    const items = parsed?.state?.items ?? [];
    const cartItemCount = items.length;
    const cartValue = items.reduce(
      (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1),
      0
    );
    return { cartItemCount, cartValue: parseFloat(cartValue.toFixed(2)) };
  } catch {
    return { cartItemCount: 0, cartValue: 0 };
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const sessionIdRef = useRef<string>("");

  const sendHeartbeat = useCallback(async (page: string) => {
    try {
      const sessionId = sessionIdRef.current;
      if (!sessionId) return;
      const cart = getCartInfo();
      await fetch("/api/analytics/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          page,
          pageTitle: typeof document !== "undefined" ? document.title : "",
          referrer: typeof document !== "undefined" ? document.referrer : "",
          device: getDevice(),
          cartItemCount: cart.cartItemCount,
          cartValue: cart.cartValue,
          isCheckingOut: page.startsWith("/checkout"),
        }),
        keepalive: true,
      });
    } catch {
      // silently ignore
    }
  }, []);

  const sendEvent = useCallback(
    async (
      event: string,
      data: Record<string, string | number | undefined> = {}
    ) => {
      try {
        const sessionId = sessionIdRef.current;
        if (!sessionId) return;
        await fetch("/api/analytics/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event, sessionId, page: pathname, ...data }),
          keepalive: true,
        });
      } catch {
        // silently ignore
      }
    },
    [pathname]
  );

  // Track page views and heartbeat on route change
  useEffect(() => {
    // Skip admin pages
    if (pathname.startsWith("/admin")) return;

    // Ensure session id is set before sending
    if (!sessionIdRef.current) {
      sessionIdRef.current = getSessionId();
    }

    sendHeartbeat(pathname);
    sendEvent("page_view");

    // Heartbeat every 30s
    const interval = setInterval(() => sendHeartbeat(pathname), 30_000);
    return () => clearInterval(interval);
  }, [pathname, sendHeartbeat, sendEvent]);

  return null;
}

// ─── Hook for product pages ───────────────────────────────────────────────────

export function useTrackEvent() {
  const pathname = usePathname();

  const trackEvent = useCallback(
    async (
      event: string,
      data: Record<string, string | number | undefined> = {}
    ) => {
      try {
        let sessionId = "";
        if (typeof sessionStorage !== "undefined") {
          sessionId = sessionStorage.getItem("_gm_sid") ?? "";
        }
        if (!sessionId) return;
        await fetch("/api/analytics/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event, sessionId, page: pathname, ...data }),
          keepalive: true,
        });
      } catch {
        // silently ignore
      }
    },
    [pathname]
  );

  return trackEvent;
}
