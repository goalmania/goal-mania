"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import Image from "next/image";

interface ChartRow {
  date: string;
  product_view: number;
  add_to_cart: number;
  checkout_start: number;
  purchase: number;
}

interface TopProduct {
  productId: string;
  slug: string;
  title: string;
  image: string;
  views: number;
  addToCartCount: number;
  purchaseCount: number;
  atcRate: number;
}

interface Totals {
  product_view: number;
  add_to_cart: number;
  checkout_start: number;
  purchase: number;
  atc_rate: number;
  checkout_rate: number;
  close_rate: number;
  conversion_rate: number;
}

interface HistoryData {
  days: number;
  chartData: ChartRow[];
  totals: Totals;
  topProducts: TopProduct[];
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="w-1 h-4 rounded-full" style={{ background: "#c8f000" }} />
      <h3 className="text-xs font-black uppercase tracking-[3px] text-white/50">{children}</h3>
    </div>
  );
}

function KpiCard({
  value, label, sub, accent, warn,
}: {
  value: string | number; label: string; sub?: string; accent?: string; warn?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-1"
      style={{
        background: "#181818",
        border: `1px solid ${warn ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.07)"}`,
      }}
    >
      <span className="text-4xl font-black tabular-nums leading-none" style={{ color: accent ?? "#c8f000" }}>
        {value}
      </span>
      <span className="text-sm font-semibold text-white mt-1">{label}</span>
      {sub && <span className="text-xs text-white/40">{sub}</span>}
    </div>
  );
}

function FunnelStep({
  icon, label, count, rate, rateLabel, color,
}: {
  icon: string; label: string; count: number; rate?: number; rateLabel?: string; color: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl px-4 py-3"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <span className="text-sm text-white/70">{label}</span>
      </div>
      <div className="flex items-center gap-4 text-right">
        <span className="text-lg font-black text-white tabular-nums">{count.toLocaleString("it-IT")}</span>
        {rate !== undefined && (
          <span className="text-sm font-bold tabular-nums w-16" style={{ color }}>
            {rate}%{rateLabel ? ` ${rateLabel}` : ""}
          </span>
        )}
      </div>
    </div>
  );
}

const DAYS_OPTIONS = [7, 14, 30];

export default function HistoricalAnalyticsPanel() {
  const [data, setData] = useState<HistoryData | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics/history?days=${days}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [days]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "short" });

  return (
    <div
      className="rounded-3xl overflow-hidden mb-8"
      style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#141414" }}
      >
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full" style={{ background: "#c8f000" }} />
          <span className="text-sm font-black uppercase tracking-[4px] text-white"
            style={{ fontFamily: "var(--font-mono, monospace)" }}>
            Storico Funnel
          </span>
        </div>
        <div className="flex gap-2">
          {DAYS_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
              style={{
                background: days === d ? "#c8f000" : "rgba(255,255,255,0.05)",
                color: days === d ? "#000" : "rgba(255,255,255,0.5)",
              }}
            >
              {d}g
            </button>
          ))}
        </div>
      </div>

      {loading && !data && (
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl animate-pulse" style={{ background: "#181818", height: 96 }} />
          ))}
        </div>
      )}

      {data && (
        <div className="p-6 space-y-8">

          {/* KPI */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard value={data.totals.product_view.toLocaleString("it-IT")} label="Visite prodotto" sub={`ultimi ${days} giorni`} accent="#60a5fa" />
            <KpiCard value={data.totals.add_to_cart.toLocaleString("it-IT")} label="Aggiunti carrello" sub={`${data.totals.atc_rate}% dei visitatori`} accent="#c8f000" warn={data.totals.atc_rate < 5} />
            <KpiCard value={data.totals.checkout_start.toLocaleString("it-IT")} label="Checkout avviati" sub={`${data.totals.checkout_rate}% dei carrelli`} accent="#f59e0b" warn={data.totals.checkout_rate < 40} />
            <KpiCard value={data.totals.purchase.toLocaleString("it-IT")} label="Acquisti" sub={`${data.totals.conversion_rate}% conversione`} accent="#34d399" warn={data.totals.conversion_rate < 1} />
          </div>

          {/* Funnel dettaglio */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "#181818", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <SectionTitle>Funnel completo — perdita per stadio</SectionTitle>
            <div className="space-y-3">
              <FunnelStep icon="👁" label="Visite prodotto" count={data.totals.product_view} color="#60a5fa" />
              <div className="flex items-center gap-2 pl-4">
                <span className="text-xs text-white/25">↓ persi {(100 - data.totals.atc_rate).toFixed(1)}%</span>
              </div>
              <FunnelStep icon="🛒" label="Aggiunti al carrello" count={data.totals.add_to_cart}
                rate={data.totals.atc_rate} rateLabel="vs visite" color={data.totals.atc_rate < 5 ? "#ef4444" : "#c8f000"} />
              <div className="flex items-center gap-2 pl-4">
                <span className="text-xs text-white/25">↓ persi {(100 - data.totals.checkout_rate).toFixed(1)}%</span>
              </div>
              <FunnelStep icon="💳" label="Checkout avviati" count={data.totals.checkout_start}
                rate={data.totals.checkout_rate} rateLabel="vs carrello" color={data.totals.checkout_rate < 40 ? "#ef4444" : "#f59e0b"} />
              <div className="flex items-center gap-2 pl-4">
                <span className="text-xs text-white/25">↓ persi {(100 - data.totals.close_rate).toFixed(1)}%</span>
              </div>
              <FunnelStep icon="✅" label="Acquisti completati" count={data.totals.purchase}
                rate={data.totals.close_rate} rateLabel="vs checkout" color={data.totals.close_rate < 50 ? "#ef4444" : "#34d399"} />
            </div>
          </div>

          {/* Chart */}
          {data.chartData.length > 0 && (
            <div className="rounded-2xl p-5" style={{ background: "#181818", border: "1px solid rgba(255,255,255,0.05)" }}>
              <SectionTitle>Andamento giornaliero</SectionTitle>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                    labelFormatter={formatDate}
                    labelStyle={{ color: "#fff", fontWeight: 700 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }} />
                  <Line type="monotone" dataKey="product_view" name="Visite prodotto" stroke="#60a5fa" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="add_to_cart" name="Carrello" stroke="#c8f000" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="checkout_start" name="Checkout" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="purchase" name="Acquisti" stroke="#34d399" strokeWidth={2.5} dot={{ fill: "#34d399", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top products */}
          {data.topProducts.length > 0 && (
            <div className="rounded-2xl p-5" style={{ background: "#181818", border: "1px solid rgba(255,255,255,0.05)" }}>
              <SectionTitle>Prodotti — conversione reale</SectionTitle>
              <div className="space-y-3">
                {data.topProducts.slice(0, 8).map((p, i) => (
                  <div key={p.productId} className="flex items-center gap-4 rounded-xl px-4 py-3"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <span className="text-xl font-black w-6 text-center flex-shrink-0"
                      style={{ color: i === 0 ? "#c8f000" : i === 1 ? "#9ca3af" : i === 2 ? "#b45309" : "#ffffff30" }}>
                      {i + 1}
                    </span>
                    {p.image ? (
                      <Image src={p.image} alt={p.title} width={44} height={44} className="rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-lg bg-white/10 flex-shrink-0" />
                    )}
                    <span className="flex-1 text-sm font-semibold text-white truncate">{p.title || p.slug}</span>
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
                        <div className="font-black tabular-nums" style={{ color: "#34d399" }}>{p.purchaseCount}</div>
                        <div className="text-[10px] text-white/30">acquisti</div>
                      </div>
                      <div className="text-center">
                        <div className="font-black tabular-nums text-sm"
                          style={{ color: p.atcRate >= 10 ? "#34d399" : p.atcRate >= 5 ? "#f59e0b" : "#ef4444" }}>
                          {p.atcRate}%
                        </div>
                        <div className="text-[10px] text-white/30">ATC%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.chartData.length === 0 && data.totals.product_view === 0 && (
            <div className="text-center py-8 text-white/30 text-sm">
              Nessun dato storico trovato per questo periodo. Il tracker sta raccogliendo dati da quando è stato attivato.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
