"use client";

import { useI18n } from "@/lib/hooks/useI18n";
import { ArrowRight, Star, Users, Shield } from "lucide-react";
import React from "react";

interface HeroBannerProps {
  title?: string;
  subtitle?: string;
  buttons: { text: string; href: string }[];
  imageUrl?: string;
  className?: string;
}

export default function HeroBanner({
  title,
  subtitle,
  buttons,
  imageUrl,
  className,
}: HeroBannerProps) {
  const { t } = useI18n();

  const containerClasses = `relative overflow-hidden w-full min-h-[510px] lg:min-h-[600px] flex items-end lg:items-center p-4 md:p-8 lg:pl-14 ${
    className || ""
  }`;

  return (
    <div className={containerClasses}>
      {/* Background Image — Mobile */}
      <div className="absolute lg:hidden inset-0">
        <img src={imageUrl} alt={t("banners.alt")} className="w-full h-full object-cover" />
      </div>
      <div className="absolute lg:hidden inset-0">
        <img src="/images/recentUpdate/home-overlay.png" alt="" className="w-full h-full object-cover" />
      </div>

      {/* Background Image — Desktop */}
      <div className="absolute hidden lg:block inset-0">
        <img src="/images/recentUpdate/desktop-overlay.png" alt="" className="w-full h-full object-cover" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center lg:items-start lg:text-left max-w-4xl w-full">

        {/* Social proof badge */}
        <div
          className="flex items-center gap-2 mb-5 px-4 py-2 rounded-full"
          style={{
            background: "rgba(200,240,0,0.1)",
            border: "1px solid rgba(200,240,0,0.25)",
          }}
        >
          <div className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={10} fill="#c8f000" color="#c8f000" />
            ))}
          </div>
          <span
            className="text-[10px] font-black uppercase tracking-widest text-[#c8f000]"
            style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "2px" }}
          >
            10.000+ Clienti Soddisfatti
          </span>
          <Users size={10} className="text-[#c8f000]" />
        </div>

        {/* Title */}
        <h1
          className="text-white text-3xl max-w-md lg:max-w-xl px-10 sm:px-0 md:text-5xl lg:text-6xl font-black mb-4 uppercase leading-tight"
          style={{
            fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
            letterSpacing: "1px",
            textShadow: "0 2px 30px rgba(0,0,0,0.5)",
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        <p
          className="text-white/80 text-base md:text-lg lg:text-xl font-light mb-8 max-w-2xl leading-relaxed"
          style={{ fontFamily: "var(--font-body, sans-serif)" }}
        >
          {subtitle}
        </p>

        {/* CTAs */}
        {buttons && buttons.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 lg:gap-4 max-w-4xl mb-6">
            {buttons.map((button, index) => (
              <a
                key={index}
                href={button.href}
                className="flex items-center gap-2 lg:py-3 lg:px-7 px-4 py-2.5 rounded-full font-black transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg focus:outline-none whitespace-nowrap text-xs md:text-sm uppercase tracking-wider"
                style={
                  index === 0
                    ? {
                        background: "#c8f000",
                        color: "#0a0a0a",
                        fontFamily: "var(--font-display, sans-serif)",
                        letterSpacing: "2px",
                        boxShadow: "0 4px 20px rgba(200,240,0,0.3)",
                      }
                    : {
                        background: "rgba(255,255,255,0.08)",
                        color: "#fff",
                        fontFamily: "var(--font-display, sans-serif)",
                        letterSpacing: "2px",
                        border: "1px solid rgba(255,255,255,0.2)",
                        backdropFilter: "blur(10px)",
                      }
                }
              >
                {button.text}
                <ArrowRight className="w-3 lg:w-4 flex-shrink-0" />
              </a>
            ))}
          </div>
        )}

        {/* Trust row */}
        <div className="flex flex-wrap items-center gap-4 lg:gap-6">
          {[
            { icon: "🚚", label: "Spedizione Gratuita" },
            { icon: "🔒", label: "Pagamento Sicuro" },
            { icon: "✅", label: "Originale Garantito" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="text-sm">{icon}</span>
              <span
                className="text-[10px] uppercase tracking-widest text-white/60"
                style={{ fontFamily: "var(--font-mono, monospace)" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
