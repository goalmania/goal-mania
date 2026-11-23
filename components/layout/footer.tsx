import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";

function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34l.04-8.41A8.16 8.16 0 0 0 21 9.41V6.01a4.85 4.85 0 0 1-1.41.68z" />
    </svg>
  );
}

const GROUPS = [
  {
    title: "Maglie",
    links: [
      { label: "Tutte le maglie", href: "/shop" },
      { label: "Serie A", href: "/shop/serieA" },
      { label: "Premier League", href: "/shop/premier-league" },
      { label: "Stagione 26/27", href: "/shop/2026/27" },
      { label: "Retro", href: "/shop/retro" },
      { label: "Mondiali 2026", href: "/shop/worldcup" },
    ],
  },
  {
    title: "Assistenza",
    links: [
      { label: "Spedizioni", href: "/shipping" },
      { label: "Resi e rimborsi", href: "/resi" },
      { label: "Contattaci", href: "/contact" },
      { label: "I miei ordini", href: "/account/orders" },
    ],
  },
  {
    title: "Goal Mania",
    links: [
      { label: "Chi siamo", href: "/about" },
      { label: "Notizie", href: "/news" },
      { label: "Privacy e cookie", href: "/privacy" },
      { label: "Termini di servizio", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t-4 border-[#c8f000] bg-[#0a0a0a] pb-4">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-12 md:grid-cols-[1.2fr_1fr_1fr_1fr] md:px-8">
        <div>
          <Image src="/images/recentUpdate/goalmania-wordmark.png" alt="Goal Mania" width={392} height={201} className="h-14 w-auto object-contain" />
          <p className="mt-4 max-w-[28ch] text-[15px] leading-snug text-white/75">
            Maglie da calcio a 35€, retro a 40€. Spedizione gratuita in Italia.
          </p>
          <div className="mt-5 flex gap-2">
            <a href="https://www.instagram.com/goalmania.it/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="cut cut-sm flex h-11 w-11 items-center justify-center bg-white/10 text-white transition-colors hover:bg-[#c8f000] hover:text-[#0a0a0a]">
              <Instagram size={20} />
            </a>
            <a href="https://www.tiktok.com/@goalmania.it" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="cut cut-sm flex h-11 w-11 items-center justify-center bg-white/10 text-white transition-colors hover:bg-[#c8f000] hover:text-[#0a0a0a]">
              <TikTokIcon />
            </a>
          </div>
        </div>

        {GROUPS.map((g) => (
          <nav key={g.title} aria-label={g.title}>
            <h2 className="display text-[22px] text-white">{g.title}</h2>
            <ul className="mt-4 space-y-1">
              {g.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="flex min-h-[44px] items-center text-[16px] text-white/80 transition-colors hover:text-[#c8f000]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mx-auto max-w-[1280px] border-t border-white/12 px-5 pt-5 text-[13px] leading-relaxed text-white/60 md:px-8">
        <p>Pagamenti: Visa, Mastercard, American Express, Apple Pay, Google Pay, PayPal, Klarna.</p>
        <p className="mt-1">© {new Date().getFullYear()} Goal Mania. I nomi e i marchi dei club appartengono ai rispettivi proprietari; Goal Mania non è affiliata ad alcun club o federazione.</p>
      </div>
    </footer>
  );
}

export default Footer;
