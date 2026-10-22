"use client";

import { Star, CheckCircle, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRealReviews, type RealReview } from "@/lib/hooks/useRealReviews";

// ─── Sub-components ────────────────────────────────────────────────────────────

function Stars({ count, size = 14 }: { count: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < count ? "#c8f000" : "transparent"}
          color={i < count ? "#c8f000" : "rgba(255,255,255,0.15)"}
        />
      ))}
    </div>
  );
}

function VerifiedBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[1.5px] px-2 py-0.5 rounded-full"
      style={{
        fontFamily: "var(--font-mono, monospace)",
        background: "rgba(200,240,0,0.06)",
        border: "1px solid rgba(200,240,0,0.18)",
        color: "rgba(200,240,0,0.65)",
      }}
    >
      <CheckCircle size={9} />
      Acquisto verificato
    </span>
  );
}

const AVATAR_COLORS = ["#a78bfa", "#5f73d6", "#d47070", "#f59e0b", "#38bdf8", "#34d399"];

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
}

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const color = colorFor(name);
  return (
    <div
      className="flex-shrink-0 flex items-center justify-center rounded-full font-black"
      style={{
        width: size,
        height: size,
        background: `${color}20`,
        border: `1.5px solid ${color}45`,
        color,
        fontFamily: "var(--font-display, sans-serif)",
        fontSize: size * 0.35,
      }}
    >
      {initialsFor(name).toUpperCase()}
    </div>
  );
}

function ReviewCard({ r }: { r: RealReview }) {
  return (
    <div
      className="flex flex-col gap-3 p-5 rounded-2xl relative overflow-hidden"
      style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-center justify-between">
        <Stars count={r.rating} size={12} />
        <VerifiedBadge />
      </div>
      <p
        className="text-sm leading-relaxed flex-1"
        style={{ fontFamily: "var(--font-body, sans-serif)", color: "rgba(255,255,255,0.62)" }}
      >
        "{r.comment}"
      </p>
      {r.productName && (
        <div
          className="text-[9px] px-2.5 py-1 rounded-full uppercase tracking-widest self-start"
          style={{
            fontFamily: "var(--font-mono, monospace)",
            color: "rgba(200,240,0,0.55)",
            background: "rgba(200,240,0,0.05)",
            border: "1px solid rgba(200,240,0,0.1)",
          }}
        >
          {r.productName}
        </div>
      )}
      <div className="flex items-center gap-2.5 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <Avatar name={r.userName} size={34} />
        <p className="text-xs font-bold text-white leading-tight" style={{ fontFamily: "var(--font-display, sans-serif)" }}>
          {r.userName}
        </p>
      </div>
    </div>
  );
}

function TrustPill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2.5 rounded-full"
      style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <span style={{ color: "#c8f000" }}>{icon}</span>
      <span className="text-xs" style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.65)" }}>
        {text}
      </span>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function SocialProofSection() {
  const { reviews, loading } = useRealReviews();
  const avgRating =
    reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;

  return (
    <section className="py-16 md:py-24 relative overflow-hidden" style={{ background: "#080808" }}>
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(200,240,0,0.15), transparent)" }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-6 h-[1.5px] rounded-full" style={{ background: "#c8f000" }} />
              <span
                className="text-[10px] uppercase tracking-[4px]"
                style={{ fontFamily: "var(--font-mono, monospace)", color: "#c8f000" }}
              >
                // Recensioni Verificate
              </span>
              <span className="w-6 h-[1.5px] rounded-full" style={{ background: "#c8f000" }} />
            </div>

            <h2
              className="font-black uppercase text-white leading-tight mb-4"
              style={{
                fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
                fontSize: "clamp(2rem, 4vw, 3.2rem)",
                letterSpacing: "1px",
              }}
            >
              Cosa dicono i nostri <span style={{ color: "#c8f000" }}>clienti</span>
            </h2>

            {reviews.length > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                <Stars count={Math.round(avgRating)} size={18} />
                <span className="text-3xl font-black text-white" style={{ fontFamily: "var(--font-display, sans-serif)" }}>
                  {avgRating.toFixed(1)}
                </span>
                <span
                  className="text-xs uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-mono, monospace)" }}
                >
                  · {reviews.length} {reviews.length === 1 ? "recensione" : "recensioni"} verificate
                </span>
              </div>
            )}
          </div>
        </div>

        {reviews.length > 0 ? (
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {reviews.slice(0, 9).map((r) => (
              <ReviewCard key={r.id} r={r} />
            ))}
          </div>
        ) : (
          !loading && (
            <div
              className="rounded-2xl p-8 md:p-10 text-center"
              style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p
                className="text-sm md:text-base mb-6"
                style={{ fontFamily: "var(--font-body, sans-serif)", color: "rgba(255,255,255,0.55)" }}
              >
                Siamo ancora agli inizi: non abbiamo ancora recensioni da mostrare, ma ecco cosa
                garantiamo su ogni ordine.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <TrustPill icon={<ShieldCheck size={14} />} text="Pagamento sicuro" />
                <TrustPill icon={<Truck size={14} />} text="Spedizione gratuita" />
                <TrustPill icon={<RotateCcw size={14} />} text="Reso entro 30 giorni" />
              </div>
            </div>
          )
        )}

        <div className="text-center mt-12">
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-black uppercase transition-all duration-300 hover:-translate-y-1"
            style={{
              background: "#c8f000",
              color: "#0a0a0a",
              fontFamily: "var(--font-display, sans-serif)",
              letterSpacing: "2px",
              fontSize: "0.85rem",
              boxShadow: "0 4px 24px rgba(200,240,0,0.3)",
            }}
          >
            Scopri le Maglie →
          </Link>
          <p
            className="mt-4 text-[10px] uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.15)" }}
          >
            Spedizione gratuita · Reso entro 30 giorni · Pagamento sicuro
          </p>
        </div>
      </div>
    </section>
  );
}
