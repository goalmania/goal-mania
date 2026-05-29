import Link from "next/link";
import Image from "next/image";
import {
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  ShieldCheck,
  Truck,
  RotateCcw,
  BadgeCheck,
} from "lucide-react";

// TikTok icon (not in lucide)
function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34l.04-8.41A8.16 8.16 0 0 0 21 9.41V6.01a4.85 4.85 0 0 1-1.41.68z" />
    </svg>
  );
}

const SHOP_LINKS = [
  { label: "Serie A", href: "/international/serieA" },
  { label: "Premier League", href: "/international/premierLeague" },
  { label: "La Liga", href: "/international/laliga" },
  { label: "Bundesliga", href: "/international/bundesliga" },
  { label: "Champions League", href: "/shop" },
  { label: "Mondiali 2026", href: "/shop/worldcup" },
  { label: "Maglie Retro", href: "/shop/retro" },
];

const NEWS_LINKS = [
  { label: "Tutte le Notizie", href: "/news" },
  { label: "Calciomercato", href: "/news?category=calciomercato" },
  { label: "Serie A", href: "/news?category=serie-a" },
  { label: "Champions League", href: "/news?category=champions-league" },
  { label: "Premier League", href: "/news?category=premier-league" },
  { label: "Mondiali 2026", href: "/news?category=mondiali" },
];

const SUPPORT_LINKS = [
  { label: "FAQ", href: "/contact" },
  { label: "I Miei Ordini", href: "/account/orders" },
  { label: "Resi e Rimborsi", href: "/contact" },
  { label: "Guida alle Taglie", href: "/contact" },
  { label: "Contattaci", href: "/contact" },
  { label: "About", href: "/about" },
];

const TRUST_BADGES = [
  { icon: Truck, label: "Spedizione Gratuita", sub: "Sopra €89" },
  { icon: RotateCcw, label: "Reso Gratuito", sub: "30 giorni" },
  { icon: ShieldCheck, label: "Pagamento Sicuro", sub: "SSL 256-bit" },
  { icon: BadgeCheck, label: "Originale Garantito", sub: "100% autentico" },
];

const PAYMENT_METHODS = [
  "VISA", "Mastercard", "PayPal", "Apple Pay", "Google Pay", "Klarna", "Stripe",
];

const SOCIALS = [
  { href: "https://www.instagram.com/goalmania.it/", icon: Instagram, label: "Instagram" },
  { href: "https://www.tiktok.com/@goalmania.it", icon: TikTokIcon, label: "TikTok" },
];

export function Footer() {
  return (
    <footer
      style={{
        background: "var(--gm-section-bg)",
        borderTop: "0.5px solid var(--gm-header-border)",
      }}
    >
      {/* ── Newsletter bar ── */}
      <div
        className="border-b"
        style={{ borderColor: "var(--gm-border-sub)", background: "var(--gm-section-bg-alt)" }}
      >
        <div className="max-w-5xl mx-auto px-6 py-14 text-center">
          <div
            className="text-[10px] uppercase tracking-[4px] mb-4 flex items-center justify-center gap-2"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "#c8f000" }}
          >
            <span className="w-4 h-[1.5px] rounded-full inline-block" style={{ background: "#c8f000" }} />
            // Newsletter
            <span className="w-4 h-[1.5px] rounded-full inline-block" style={{ background: "#c8f000" }} />
          </div>
          <h2
            className="font-black uppercase text-white mb-3 leading-tight"
            style={{
              fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
              fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
              letterSpacing: "1px",
            }}
          >
            Resta aggiornato su{" "}
            <span style={{ color: "#c8f000" }}>offerte esclusive</span> e nuovi arrivi
          </h2>
          <p
            className="mb-8 max-w-lg mx-auto text-sm"
            style={{
              color: "var(--gm-text-muted)",
              fontFamily: "var(--font-body, sans-serif)",
              lineHeight: "1.7",
            }}
          >
            Iscriviti per ricevere aggiornamenti su offerte speciali, nuovi arrivi e notizie dal mondo del calcio.
          </p>

          <div className="flex justify-center">
            <div
              className="flex items-center gap-2 p-2 rounded-full w-full max-w-md"
              style={{
                background: "var(--gm-input-bg)",
                border: "1px solid rgba(200,240,0,0.2)",
              }}
            >
              <input
                type="email"
                placeholder="La tua email..."
                className="flex-1 bg-transparent text-white px-5 py-2 text-sm outline-none placeholder-white/25"
                style={{ fontFamily: "var(--font-body, sans-serif)" }}
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full font-black text-sm uppercase tracking-wider transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{
                  color: "#0a0a0a",
                  background: "#c8f000",
                  fontFamily: "var(--font-display, sans-serif)",
                  letterSpacing: "2px",
                  boxShadow: "0 4px 16px rgba(200,240,0,0.2)",
                }}
              >
                Iscriviti
              </button>
            </div>
          </div>

          <p
            className="mt-4 text-[10px] uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--gm-text-dim)" }}
          >
            Nessuno spam. Cancellati quando vuoi.
          </p>
        </div>
      </div>

      {/* ── Trust badges strip ── */}
      <div
        className="border-b"
        style={{ borderColor: "var(--gm-border-sub)" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-7">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {TRUST_BADGES.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 group">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                  style={{ background: "rgba(200,240,0,0.07)", border: "1px solid rgba(200,240,0,0.13)" }}
                >
                  <Icon size={18} style={{ color: "#c8f000" }} />
                </div>
                <div>
                  <p
                    className="text-xs font-black uppercase text-white leading-tight"
                    style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "0.5px" }}
                  >
                    {label}
                  </p>
                  <p
                    className="text-[10px] mt-0.5"
                    style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.45)" }}
                  >
                    {sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main footer grid ── */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 group mb-4 w-fit">
              <Image
                src="/images/recentUpdate/desktop-logo.png"
                alt="Goal Mania"
                width={40}
                height={40}
                className="w-10 h-10 object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(200,240,0,0.5)]"
              />
              <span
                className="font-black uppercase tracking-widest text-white text-sm"
                style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "4px" }}
              >
                GOAL<span style={{ color: "#c8f000" }}>MANIA</span>
              </span>
            </Link>
            <p
              className="text-xs max-w-[180px] mb-6"
              style={{ color: "var(--gm-text-subtle)", fontFamily: "var(--font-mono, monospace)", lineHeight: "1.7" }}
            >
              // The football universe
              <br />
              Maglie · News · Analisi
              <br />
              Dal 2024, con passione.
            </p>
            {/* Socials */}
            <div className="flex flex-wrap gap-2">
              {SOCIALS.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-200 hover:border-[#c8f000]/40 hover:text-[#c8f000] hover:-translate-y-0.5"
                  style={{
                    border: "1px solid var(--gm-social-border)",
                    color: "var(--gm-social-color)",
                  }}
                >
                  <Icon size={15} />
                </Link>
              ))}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <div
              className="text-[9px] uppercase tracking-[3px] mb-4"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.6)" }}
            >
              // Shop
            </div>
            <ul className="space-y-2.5">
              {SHOP_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-xs transition-colors hover:text-[#c8f000]"
                    style={{ fontFamily: "var(--font-body, sans-serif)", color: "var(--gm-text-subtle)" }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* News links */}
          <div>
            <div
              className="text-[9px] uppercase tracking-[3px] mb-4"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.6)" }}
            >
              // News
            </div>
            <ul className="space-y-2.5">
              {NEWS_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-xs transition-colors hover:text-[#c8f000]"
                    style={{ fontFamily: "var(--font-body, sans-serif)", color: "var(--gm-text-subtle)" }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <div
              className="text-[9px] uppercase tracking-[3px] mb-4"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.6)" }}
            >
              // Supporto
            </div>
            <ul className="space-y-2.5">
              {SUPPORT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-xs transition-colors hover:text-[#c8f000]"
                    style={{ fontFamily: "var(--font-body, sans-serif)", color: "var(--gm-text-subtle)" }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Payment methods + legal ── */}
      <div
        className="border-t"
        style={{ borderColor: "rgba(255,255,255,0.04)" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Payment row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <p
              className="text-[10px] uppercase tracking-widest"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.18)" }}
            >
              Metodi di Pagamento Accettati
            </p>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {PAYMENT_METHODS.map((method) => (
                <span
                  key={method}
                  className="text-[9px] font-black px-2.5 py-1.5 rounded-lg tracking-widest"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.3)",
                    fontFamily: "var(--font-mono, monospace)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {method}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="pt-5 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ borderColor: "rgba(255,255,255,0.04)" }}
          >
            <span
              className="text-[10px]"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.18)" }}
            >
              &copy; 2025 Goal Mania. All rights reserved.
            </span>

            {/* Legal links */}
            <div className="flex items-center gap-4 flex-wrap justify-center">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Cookie Policy", href: "/privacy" },
                { label: "Termini di Servizio", href: "/terms" },
              ].map((l) => (
                <Link
                  key={l.href + l.label}
                  href={l.href}
                  className="text-[10px] uppercase tracking-widest hover:text-[#c8f000] transition-colors"
                  style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--gm-text-dim)" }}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Live dot */}
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full inline-block animate-dot-blink"
                style={{ background: "#c8f000" }}
              />
              <span
                className="text-[10px]"
                style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.45)" }}
              >
                // Goal Mania is live
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
