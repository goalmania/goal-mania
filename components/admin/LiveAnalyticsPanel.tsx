"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageBreakdownItem {
  page: string;
  title: string;
  count: number;
}

interface CartSession {
  sessionId: string;
  page: string;
  cartItemCount: number;
  cartValue: number;
}

interface TopProduct {
  productId: string;
  slug: string;
  title: string;
  image: string;
  views: number;
  addToCartCount: number;
  purchaseCount: number;
}

interface RecentEvent {
  event: string;
  page: string;
  productSlug?: string;
  timestamp: string;
}

interface LiveData {
  onlineNow: number;
  pageBreakdown: PageBreakdownItem[];
  activeCarts: {
    count: number;
    totalValue: number;
    sessions: CartSession[];
  };
  checkingOut: number;
  funnel: {
    productViews: number;
    addToCart: number;
    checkoutStart: number;
    purchases: number;
    conversionRate: number;
  };
  topProducts: TopProduct[];
  recentEvents: RecentEvent[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EVENT_LABELS: Record<string, string> = {
  page_view: "📄 Pagina vista",
  product_view: "👁 Prodotto visto",
  add_to_cart: "🛒 Aggiunto al carrello",
  checkout_start: "💳 Checkout iniziato",
  purchase: "✅ Acquisto completato",
};

function BarChart({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-2 flex-1 rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: "#c8f000" }}
      />
    </div>
  );
}

function FunnelRow({
  label,
  count,
  pct,
}: {
  label: string;
  count: number;
  pct?: number;
}) {
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <span className="text-white/70">{label}</span>
      <span className="font-mono text-white">
        {count}
        {pct !== undefined && (
          <span className="text-white/40 ml-1 text-xs">({pct}%)</span>
        )}
      </span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LiveAnalyticsPanel() {
  const [data, setData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics/live");
      if (!res.ok) throw new Error("fetch failed");
      const json: LiveData = await res.json();
      setData(json);
      setLastUpdate(new Date());
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, 15_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const maxPageCount = data ? Math.max(...data.pageBreakdown.map((p) => p.count), 1) : 1;

  return (
    <Card
      className="mb-6 border-0"
      style={{ background: "#111", color: "#fff" }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white text-base font-semibold">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{
                backgroundColor: "#c8f000",
                animation: loading ? "pulse 1s infinite" : "none",
              }}
            />
            LIVE
            {loading && (
              <span className="ml-1 text-xs text-white/40 animate-pulse">
                aggiornamento…
              </span>
            )}
          </CardTitle>
          {lastUpdate && (
            <span className="text-xs text-white/40">
              Aggiornato alle{" "}
              {lastUpdate.toLocaleTimeString("it-IT", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {error && !data && (
          <p className="text-white/40 text-sm">
            Impossibile caricare i dati live. Riprova tra qualche secondo.
          </p>
        )}

        {data && (
          <div className="space-y-6">
            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Online ora", value: data.onlineNow },
                { label: "Carrelli attivi", value: data.activeCarts.count },
                { label: "Checkout in corso", value: data.checkingOut },
                {
                  label: "Conversione oggi",
                  value: `${data.funnel.conversionRate}%`,
                },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-lg p-3 text-center"
                  style={{ background: "#1a1a1a" }}
                >
                  <div
                    className="text-2xl font-bold"
                    style={{ color: "#c8f000" }}
                  >
                    {kpi.value}
                  </div>
                  <div className="text-xs text-white/50 mt-1">{kpi.label}</div>
                </div>
              ))}
            </div>

            {/* Page breakdown + Funnel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pages */}
              <div
                className="rounded-lg p-4"
                style={{ background: "#1a1a1a" }}
              >
                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-3">
                  Pagine attive
                </h3>
                <div className="space-y-2">
                  {data.pageBreakdown.length === 0 && (
                    <p className="text-white/30 text-sm">Nessun visitatore</p>
                  )}
                  {data.pageBreakdown.map((p) => (
                    <div key={p.page} className="flex items-center gap-3">
                      <span
                        className="text-xs font-mono truncate max-w-[140px] text-white/70"
                        title={p.page}
                      >
                        {p.page}
                      </span>
                      <BarChart value={p.count} max={maxPageCount} />
                      <span
                        className="text-xs font-bold tabular-nums w-4 text-right"
                        style={{ color: "#c8f000" }}
                      >
                        {p.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Funnel */}
              <div
                className="rounded-lg p-4"
                style={{ background: "#1a1a1a" }}
              >
                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-3">
                  Funnel acquisto (24h)
                </h3>
                <FunnelRow label="👁 Visite prodotto" count={data.funnel.productViews} />
                <FunnelRow
                  label="🛒 Aggiunti al carrello"
                  count={data.funnel.addToCart}
                  pct={
                    data.funnel.productViews > 0
                      ? parseFloat(
                          (
                            (data.funnel.addToCart / data.funnel.productViews) *
                            100
                          ).toFixed(1)
                        )
                      : 0
                  }
                />
                <FunnelRow
                  label="💳 Checkout iniziato"
                  count={data.funnel.checkoutStart}
                  pct={
                    data.funnel.productViews > 0
                      ? parseFloat(
                          (
                            (data.funnel.checkoutStart /
                              data.funnel.productViews) *
                            100
                          ).toFixed(1)
                        )
                      : 0
                  }
                />
                <FunnelRow
                  label="✅ Acquisti"
                  count={data.funnel.purchases}
                  pct={data.funnel.conversionRate}
                />
              </div>
            </div>

            {/* Top Products */}
            {data.topProducts.length > 0 && (
              <div className="rounded-lg p-4" style={{ background: "#1a1a1a" }}>
                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-3">
                  Prodotti più visti (7 giorni)
                </h3>
                <div className="space-y-3">
                  {data.topProducts.slice(0, 5).map((p) => {
                    const ratio =
                      p.views > 0
                        ? ((p.addToCartCount / p.views) * 100).toFixed(1)
                        : "0";
                    return (
                      <div
                        key={p.productId}
                        className="flex items-center gap-3"
                      >
                        {p.image ? (
                          <Image
                            src={p.image}
                            alt={p.title}
                            width={36}
                            height={36}
                            className="rounded object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded bg-white/10 flex-shrink-0" />
                        )}
                        <span className="flex-1 text-sm text-white truncate">
                          {p.title || p.slug}
                        </span>
                        <div className="flex items-center gap-3 text-xs font-mono text-white/60 flex-shrink-0">
                          <span title="Views">
                            👁{" "}
                            <span className="text-white">{p.views}</span>
                          </span>
                          <span title="Aggiunti">
                            🛒{" "}
                            <span className="text-white">
                              {p.addToCartCount}
                            </span>
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] border-white/20 text-white/50"
                          >
                            {ratio}%
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Carts */}
            {data.activeCarts.count > 0 && (
              <div className="rounded-lg p-4" style={{ background: "#1a1a1a" }}>
                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-3">
                  Carrelli attivi —{" "}
                  <span style={{ color: "#c8f000" }}>
                    €{data.activeCarts.totalValue.toFixed(2)} totali
                  </span>
                </h3>
                <div className="space-y-2">
                  {data.activeCarts.sessions.map((s) => (
                    <div
                      key={s.sessionId}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-white/60 font-mono truncate max-w-[200px] text-xs">
                        {s.page}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-white/60 flex-shrink-0">
                        <span>{s.cartItemCount} item{s.cartItemCount !== 1 ? "s" : ""}</span>
                        <span style={{ color: "#c8f000" }}>
                          €{(s.cartValue ?? 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Events */}
            {data.recentEvents.length > 0 && (
              <div className="rounded-lg p-4" style={{ background: "#1a1a1a" }}>
                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-3">
                  Attività recente
                </h3>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {data.recentEvents.slice(0, 10).map((e, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-white/70">
                        {EVENT_LABELS[e.event] ?? e.event}
                      </span>
                      <span className="text-white/30 font-mono">
                        {new Date(e.timestamp).toLocaleTimeString("it-IT", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
