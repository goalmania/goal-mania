"use client";

import { Truck, RotateCcw, Lock, BadgeCheck } from "lucide-react";

const PILLARS = [
  {
    icon: Truck,
    title: "Spedizione Gratuita",
    subtitle: "Sopra €89 in tutta Italia",
    emoji: "🚚",
  },
  {
    icon: RotateCcw,
    title: "Reso Gratuito",
    subtitle: "30 giorni senza domande",
    emoji: "🔄",
  },
  {
    icon: Lock,
    title: "Pagamento Sicuro",
    subtitle: "SSL 256-bit crittografato",
    emoji: "🔒",
  },
  {
    icon: BadgeCheck,
    title: "Prodotti Originali",
    subtitle: "Garanzia autenticità 100%",
    emoji: "✅",
  },
];

export default function TrustSection() {
  return (
    <section className="py-12 bg-[#0a0a0a]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {PILLARS.map(({ icon: Icon, title, subtitle, emoji }) => (
            <div
              key={title}
              className="group flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-300 cursor-default"
              style={{
                background: "#111",
                border: "1px solid rgba(255,255,255,0.06)",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.border = "1px solid rgba(200,240,0,0.25)";
                el.style.transform = "translateY(-4px)";
                el.style.boxShadow = "0 12px 40px rgba(0,0,0,0.4)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.border = "1px solid rgba(255,255,255,0.06)";
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "none";
              }}
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(90deg, transparent, #c8f000, transparent)" }}
              />

              {/* Icon container */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                style={{
                  background: "rgba(200,240,0,0.08)",
                  border: "1px solid rgba(200,240,0,0.15)",
                }}
              >
                <Icon
                  size={24}
                  style={{ color: "#c8f000" }}
                />
              </div>

              <h3
                className="font-black uppercase text-white leading-tight mb-1.5 text-sm"
                style={{
                  fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
                  letterSpacing: "0.5px",
                }}
              >
                {title}
              </h3>
              <p
                className="text-xs leading-relaxed"
                style={{
                  fontFamily: "var(--font-body, sans-serif)",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                {subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
