import Link from "next/link";
import Image from "next/image";
import { Instagram, Twitter, Globe } from "lucide-react";

export function Footer() {
  const links = [
    { label: "About", href: "/about" },
    { label: "News", href: "/news" },
    { label: "Shop", href: "/shop" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy", href: "/privacy" },
    { label: "Termini", href: "/terms" },
    { label: "Ordini", href: "/account/orders" },
  ];

  const socials = [
    { href: "https://www.tiktok.com/@goalmania_", icon: <Globe size={18} />, label: "TikTok" },
    { href: "https://x.com/goalmania_", icon: <Twitter size={18} />, label: "Twitter" },
    { href: "https://www.instagram.com/goalmaniaofficial/", icon: <Instagram size={18} />, label: "Instagram" },
  ];

  return (
    <footer
      style={{
        background: "#0a0a0a",
        borderTop: "0.5px solid rgba(200,240,0,0.12)",
      }}
    >
      {/* Newsletter bar */}
      <div
        className="border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <div
            className="text-xs uppercase tracking-[4px] mb-4 flex items-center justify-center gap-2"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "#c8f000" }}
          >
            <span className="w-4 h-[1.5px] rounded-full inline-block" style={{ background: "#c8f000" }} />
            Newsletter
            <span className="w-4 h-[1.5px] rounded-full inline-block" style={{ background: "#c8f000" }} />
          </div>
          <h2
            className="font-black uppercase text-white mb-3 leading-tight"
            style={{
              fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
              fontSize: "clamp(1.4rem, 4vw, 2.2rem)",
              letterSpacing: "1px",
            }}
          >
            Resta informato.{" "}
            <span style={{ color: "#c8f000" }}>Rimani un passo avanti.</span>
          </h2>
          <p
            className="mb-8 max-w-xl mx-auto"
            style={{
              color: "rgba(245,245,245,0.5)",
              fontFamily: "var(--font-body, sans-serif)",
              fontSize: "0.95rem",
              lineHeight: "1.7",
            }}
          >
            Iscriviti per ricevere aggiornamenti su partite, mercato, interviste
            esclusive e offerte speciali.
          </p>

          <div className="flex justify-center">
            <div
              className="flex items-center gap-2 p-2 rounded-full w-full max-w-md"
              style={{
                background: "#1a1a1a",
                border: "1px solid rgba(200,240,0,0.2)",
              }}
            >
              <input
                type="email"
                placeholder="La tua email..."
                className="flex-1 bg-transparent text-white px-5 py-2 text-sm outline-none placeholder-white/30"
                style={{ fontFamily: "var(--font-body, sans-serif)" }}
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all hover:opacity-90 hover:-translate-y-0.5"
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
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link href="/" className="flex items-center gap-3 group">
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
              className="text-xs text-center md:text-left max-w-[200px]"
              style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono, monospace)", lineHeight: "1.6" }}
            >
              // The football universe
              <br />
              Maglie · News · Analisi
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs uppercase tracking-widest transition-colors hover:text-[#c8f000]"
                style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.4)" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Socials */}
          <div className="flex items-center gap-2">
            {socials.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                aria-label={s.label}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-200 hover:border-[#c8f000]/40 hover:text-[#c8f000] hover:-translate-y-0.5"
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                {s.icon}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <span
            className="text-xs"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.2)" }}
          >
            &copy; 2025 Goal Mania. All rights reserved.
          </span>
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ background: "#c8f000", animation: "dotBlink 1.5s ease-in-out infinite" }}
            />
            <span
              className="text-xs"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.5)" }}
            >
              // Goal Mania is live
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
