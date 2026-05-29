"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

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

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  page_view:      { label: "Pagina vista",           color: "#ffffff80" },
  product_view:   { label: "Prodotto visto",          color: "#60a5fa" },
  add_to_cart:    { label: "Aggiunto al carrello",    color: "#c8f000" },
  checkout_start: { label: "Checkout iniziato",       color: "#f59e0b" },
  purchase:       { label: "Acquisto completato",     color: "#34d399" },
};

function fmt(n: number) {
  return new Intl.NumberFormat("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function pctOf(num: number, den: number) {
  if (den === 0) return "0";
  return ((num / den) * 100).toFixed(1);
}

function PulsingDot({ active }: { active: boolean }) {
  return (
    <span className="relative flex h-3 w-3">
      {active && (
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ backgroundColor: "#c8f000" }}
        />
      )}
      <span
        className="relative inline-flex rounded-full h-3 w-3"
        style={{ backgroundColor: "#c8f000" }}
      />
    </span>
  );
}

function KpiCard({
  value,
  label,
  sub,
  accent,
}: {
  value: string | number;
  label: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-1"
      style={{ background: "#181818", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <span
        className="text-4xl font-black tabular-nums leading-none"
        style={{ color: accent ?? "#c8f000" }}
      >
        {value}
      </span>
      <span className="text-sm font-semibold text-white mt-1">{label}</span>
      {sub && <span className="text-xs text-white/40">{sub}</span>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="w-1 h-4 rounded-full" style={{ background: "#c8f000" }} />
      <h3 className="text-xs font-black uppercase tracking-[3px] text-white/50">{children}</h3>
    </div>
  );
}

function FunnelBar({
  label,
  icon,
  count,
  total,
  color,
}: {
  label: string;
  icon: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/70 flex items-center gap-2">
          <span>{icon}</span> {label}
        </span>
        <span className="font-black text-white tabular-nums">{count}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {total > 0 && (
        <p className="text-right text-[10px] text-white/30">{pct.toFixed(1)}% del totale</p>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

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
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const maxPage = data ? Math.max(...data.pageBreakdown.map((p) => p.count), 1) : 1;

  return (
    <div
      className="rounded-3xl overflow-hidden mb-8"
      style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* ── Header bar ── */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#141414" }}
      >
        <div className="flex items-center gap-3">
          <PulsingDot active={!loading} />
          <span className="text-sm font-black uppercase tracking-[4px] text-white"
            style={{ fontFamily: "var(--font-mono, monospace)" }}>
            Live Analytics
          </span>
          {loading && (
            <span className="text-xs text-white/30 animate-pulse">aggiornamento…</span>
          )}
        </div>
        {lastUpdate && (
          <span className="text-xs text-white/30 font-mono">
            {lastUpdate.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        )}
      </div>

      {/* ── Error ── */}
      {error && !data && (
        <div className="px-6 py-8 text-center text-white/30 text-sm">
          Impossibile caricare i dati live. Riprova tra qualche secondo.
        </div>
      )}

      {/* ── Empty state (first load) ── */}
      {!data && !error && (
        <div className="px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ background: "#181818", height: 96 }} />
          ))}
        </div>
      )}

      {data && (
        <div className="p-6 space-y-8">

          {/* ══ KPI ROW ══ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              value={data.onlineNow}
              label="Utenti online ora"
              sub="ultimi 5 minuti"
              accent="#c8f000"
            />
            <KpiCard
              value={data.activeCarts.count}
              label="Carrelli attivi"
              sub={data.activeCarts.count > 0 ? `€${fmt(data.activeCarts.totalValue)} in carrello` : "nessun carrello aperto"}
              accent="#60a5fa"
            />
            <KpiCard
              value={data.checkingOut}
              label="Checkout in corso"
              sub="stanno pagando ora"
              accent="#f59e0b"
            />
            <KpiCard
              value={`${data.funnel.conversionRate}%`}
              label="Tasso conversione"
              sub="ultimi 24h"
              accent="#34d399"
            />
          </div>

          {/* ══ PAGINE ATTIVE + FUNNEL ══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Pagine attive */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "#181818", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <SectionTitle>Dove sono ora</SectionTitle>
              {data.pageBreakdown.length === 0 ? (
                <p className="text-white/25 text-sm">Nessun visitatore attivo</p>
              ) : (
                <div className="space-y-3">
                  {data.pageBreakdown.map((p) => {
                    const pct = Math.round((p.count / maxPage) * 100);
                    return (
                      <div key={p.page} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white font-medium truncate max-w-[220px]" title={p.page}>
                            {p.page === "/" ? "Homepage" : p.page}
                          </span>
                          <span className="font-black tabular-nums" style={{ color: "#c8f000" }}>
                            {p.count} {p.count === 1 ? "utente" : "utenti"}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: "linear-gradient(90deg,#c8f000,#a0c800)" }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Funnel */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "#181818", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <SectionTitle>Funnel acquisto — 24h</SectionTitle>
              <div className="space-y-4">
                <FunnelBar icon="👁" label="Visite prodotto"      count={data.funnel.productViews}  total={data.funnel.productViews}  color="#60a5fa" />
                <FunnelBar icon="🛒" label="Aggiunti al carrello" count={data.funnel.addToCart}      total={data.funnel.productViews}  color="#c8f000" />
                <FunnelBar icon="💳" label="Checkout iniziato"    count={data.funnel.checkoutStart}  total={data.funnel.productViews}  color="#f59e0b" />
                <FunnelBar icon="✅" label="Acquisti completati"  count={data.funnel.purchases}      total={data.funnel.productViews}  color="#34d399" />
              </div>
              {data.funnel.productViews > 0 && (
                <div
                  className="mt-4 rounded-xl px-4 py-3 flex items-center justify-between"
                  style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}
                >
                  <span className="text-sm text-white/60">Conversione totale</span>
                  <span className="text-xl font-black" style={{ color: "#34d399" }}>
                    {data.funnel.conversionRate}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ══ CARRELLI ATTIVI (prominente se ci sono) ══ */}
          {data.activeCarts.count > 0 && (
            <div
              className="rounded-2xl p-5"
              style={{ background: "#181818", border: "1px solid rgba(96,165,250,0.2)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <SectionTitle>Carrelli aperti in questo momento</SectionTitle>
                <span
                  className="text-lg font-black tabular-nums"
                  style={{ color: "#60a5fa" }}
                >
                  €{fmt(data.activeCarts.totalValue)} in carrello
                </span>
              </div>
              <div className="space-y-3">
                {data.activeCarts.sessions.map((s) => (
                  <div
                    key={s.sessionId}
                    className="flex items-center justify-between rounded-xl px-4 py-3"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg">🛒</span>
                      <span className="text-sm text-white/70 font-mono truncate max-w-[260px]" title={s.page}>
                        {s.page}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm flex-shrink-0">
                      <span className="text-white/50">{s.cartItemCount} art.</span>
                      <span className="font-black tabular-nums" style={{ color: "#60a5fa" }}>
                        €{fmt(s.cartValue ?? 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ PRODOTTI PIÙ VISTI ══ */}
          {data.topProducts.length > 0 && (
            <div
              className="rounded-2xl p-5"
              style={{ background: "#181818", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <SectionTitle>Prodotti più visti — 7 giorni</SectionTitle>
              <div className="space-y-3">
                {data.topProducts.slice(0, 5).map((p, idx) => {
                  const ratio = p.views > 0 ? ((p.addToCartCount / p.views) * 100).toFixed(1) : "0";
                  return (
                    <div
                      key={p.productId}
                      className="flex items-center gap-4 rounded-xl px-4 py-3"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      {/* Rank */}
                      <span
                        className="text-xl font-black w-6 text-center flex-shrink-0"
                        style={{ color: idx === 0 ? "#c8f000" : idx === 1 ? "#9ca3af" : idx === 2 ? "#b45309" : "#ffffff30" }}
                      >
                        {idx + 1}
                      </span>
                      {/* Thumbnail */}
                      {p.image ? (
                        <Image src={p.image} alt={p.title} width={44} height={44}
                          className="rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-11 h-11 rounded-lg bg-white/10 flex-shrink-0" />
                      )}
                      {/* Name */}
                      <span className="flex-1 text-sm font-semibold text-white truncate">{p.title || p.slug}</span>
                      {/* Stats */}
                      <div className="flex items-center gap-5 text-sm flex-shrink-0">
                        <div className="text-center">
                          <div className="font-black text-white tabular-nums">{p.views}</div>
                          <div className="text-[10px] text-white/30">views</div>
                        </div>
                        <div className="text-center">
                          <div className="font-black tabular-nums" style={{ color: "#c8f000" }}>{p.addToCartCount}</div>
                          <div className="text-[10px] text-white/30">carrello</div>
                        </div>
                        <div className="text-center">
                          <div
                            className="font-black tabular-nums text-sm"
                            style={{ color: parseFloat(ratio) >= 10 ? "#34d399" : "#f59e0b" }}
                          >
                            {ratio}%
                          </div>
                          <div className="text-[10px] text-white/30">conv.</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══ ATTIVITÀ RECENTE ══ */}
          {data.recentEvents.length > 0 && (
            <div
              className="rounded-2xl p-5"
              style={{ background: "#181818", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <SectionTitle>Attività recente</SectionTitle>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {data.recentEvents.slice(0, 15).map((e, i) => {
                  const meta = EVENT_LABELS[e.event] ?? { label: e.event, color: "#fff" };
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg px-3 py-2"
                      style={{ background: "rgba(255,255,255,0.02)" }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: meta.color }}
                        />
                        <span className="text-sm font-medium" style={{ color: meta.color }}>
                          {meta.label}
                        </span>
                        <span className="text-xs text-white/30 font-mono truncate max-w-[180px]">{e.page}</span>
                      </div>
                      <span className="text-xs text-white/25 font-mono flex-shrink-0">
                        {new Date(e.timestamp).toLocaleTimeString("it-IT", {
                          hour: "2-digit", minute: "2-digit", second: "2-digit",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
