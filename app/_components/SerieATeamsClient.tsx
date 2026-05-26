"use client";

import Link from "next/link";
import Image from "next/image";

const L = (slug: string) => `/team-logos/${slug}.png`;

const SERIE_A_TEAMS = [
  { name: "Inter",         slug: "inter",      logo: L("inter"),      href: "/shop/serieA/inter" },
  { name: "Milan",         slug: "milan",      logo: L("milan"),      href: "/shop/serieA/milan" },
  { name: "Juventus",      slug: "juventus",   logo: L("juventus"),   href: "/shop/serieA/juventus" },
  { name: "Napoli",        slug: "napoli",     logo: L("napoli"),     href: "/shop/serieA/napoli" },
  { name: "Roma",          slug: "roma",       logo: L("roma"),       href: "/shop/serieA/roma" },
  { name: "Lazio",         slug: "lazio",      logo: L("lazio"),      href: "/shop/serieA/lazio" },
  { name: "Atalanta",      slug: "atalanta",   logo: L("atalanta"),   href: "/shop/serieA/atalanta" },
  { name: "Fiorentina",    slug: "fiorentina", logo: L("fiorentina"), href: "/shop/serieA/fiorentina" },
  { name: "Bologna",       slug: "bologna",    logo: L("bologna"),    href: "/shop/serieA/bologna" },
  { name: "Torino",        slug: "torino",     logo: L("torino"),     href: "/shop/serieA/torino" },
  { name: "Udinese",       slug: "udinese",    logo: L("udinese"),    href: "/shop/serieA/udinese" },
  { name: "Monza",         slug: "monza",      logo: L("monza"),      href: "/shop/serieA/monza" },
  { name: "Genoa",         slug: "genoa",      logo: L("genoa"),      href: "/shop/serieA/genoa" },
  { name: "Lecce",         slug: "lecce",      logo: L("lecce"),      href: "/shop/serieA/lecce" },
  { name: "Cagliari",      slug: "cagliari",   logo: L("cagliari"),   href: "/shop/serieA/cagliari" },
  { name: "H. Verona",     slug: "verona",     logo: L("verona"),     href: "/shop/serieA/verona" },
  { name: "Sassuolo",      slug: "sassuolo",   logo: L("sassuolo"),   href: "/shop/serieA/sassuolo" },
  { name: "Empoli",        slug: "empoli",     logo: L("empoli"),     href: "/shop/serieA/empoli" },
  { name: "Parma",         slug: "parma",      logo: L("parma"),      href: "/shop/serieA/parma" },
  { name: "Como",          slug: "como",       logo: L("como"),       href: "/shop/serieA/como" },
];

function TeamLogoCard({ name, logo, href }: { name: string; logo: string; href: string }) {
  return (
    <Link
      href={href}
      className="team-logo-card group flex flex-col items-center gap-2"
      style={{ width: "88px", flexShrink: 0 }}
    >
      <div
        className="w-full flex items-center justify-center rounded-2xl overflow-hidden"
        style={{
          height: "96px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          transition: "transform 200ms cubic-bezier(0.23,1,0.32,1), box-shadow 200ms, border-color 200ms",
        }}
      >
        <Image
          src={logo}
          alt={name}
          width={52}
          height={52}
          className="object-contain drop-shadow-lg"
          style={{ maxWidth: "52px", maxHeight: "52px" }}
          draggable={false}
        />
      </div>
      <span
        className="text-center leading-tight"
        style={{
          fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "1.2px",
          color: "rgba(255,255,255,0.5)",
          textTransform: "uppercase",
          transition: "color 200ms",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "88px",
        }}
      >
        {name}
      </span>

      <style jsx>{`
        @media (hover: hover) and (pointer: fine) {
          .team-logo-card:hover > div:first-child {
            transform: translateY(-4px);
            box-shadow: 0 12px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(200,240,0,0.3);
            border-color: rgba(200,240,0,0.3) !important;
          }
          .team-logo-card:hover span {
            color: rgba(200,240,0,0.9) !important;
          }
        }
        .team-logo-card:active > div:first-child {
          transform: scale(0.97);
        }
      `}</style>
    </Link>
  );
}

export default function SerieATeamsClient() {
  return (
    <section className="pb-12 px-4 sm:px-6" style={{ background: "#0a0a0a" }}>
      <div className="max-w-7xl mx-auto">
        {/* Grid: 5 cols mobile → 10 cols desktop */}
        <div
          className="grid gap-x-4 gap-y-6"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
          }}
        >
          {SERIE_A_TEAMS.map((team) => (
            <div key={team.slug} className="flex justify-center">
              <TeamLogoCard name={team.name} logo={team.logo} href={team.href} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
