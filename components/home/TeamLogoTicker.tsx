"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// ─────────────────────────────────────────────────────────────
// Data — logos from api-sports.io (no auth required for these)
// ─────────────────────────────────────────────────────────────

// Loghi ospitati localmente in /public/team-logos/ (scaricati con scripts/download-team-logos.mjs)
const L = (slug: string) => `/team-logos/${slug}.png`;

const SERIE_A = [
  { name: "Inter",        slug: "inter",      logo: L("inter"),      href: "/shop/serieA/inter" },
  { name: "Milan",        slug: "milan",      logo: L("milan"),      href: "/shop/serieA/milan" },
  { name: "Juventus",     slug: "juventus",   logo: L("juventus"),   href: "/shop/serieA/juventus" },
  { name: "Napoli",       slug: "napoli",     logo: L("napoli"),     href: "/shop/serieA/napoli" },
  { name: "Roma",         slug: "roma",       logo: L("roma"),       href: "/shop/serieA/roma" },
  { name: "Lazio",        slug: "lazio",      logo: L("lazio"),      href: "/shop/serieA/lazio" },
  { name: "Atalanta",     slug: "atalanta",   logo: L("atalanta"),   href: "/shop/serieA/atalanta" },
  { name: "Fiorentina",   slug: "fiorentina", logo: L("fiorentina"), href: "/shop/serieA/fiorentina" },
  { name: "Bologna",      slug: "bologna",    logo: L("bologna"),    href: "/shop/serieA/bologna" },
  { name: "Torino",       slug: "torino",     logo: L("torino"),     href: "/shop/serieA/torino" },
  { name: "Udinese",      slug: "udinese",    logo: L("udinese"),    href: "/shop/serieA/udinese" },
  { name: "Monza",        slug: "monza",      logo: L("monza"),      href: "/shop/serieA/monza" },
  { name: "Genoa",        slug: "genoa",      logo: L("genoa"),      href: "/shop/serieA/genoa" },
  { name: "Lecce",        slug: "lecce",      logo: L("lecce"),      href: "/shop/serieA/lecce" },
  { name: "Cagliari",     slug: "cagliari",   logo: L("cagliari"),   href: "/shop/serieA/cagliari" },
  { name: "Hellas Verona",slug: "verona",     logo: L("verona"),     href: "/shop/serieA/verona" },
  { name: "Sassuolo",     slug: "sassuolo",   logo: L("sassuolo"),   href: "/shop/serieA/sassuolo" },
  { name: "Empoli",       slug: "empoli",     logo: L("empoli"),     href: "/shop/serieA/empoli" },
  { name: "Parma",        slug: "parma",      logo: L("parma"),      href: "/shop/serieA/parma" },
  { name: "Como",         slug: "como",       logo: L("como"),       href: "/shop/serieA/como" },
];

const RESTO_MONDO = [
  { name: "Real Madrid",  slug: "real-madrid", logo: L("real-madrid"), href: "/shop/serieA/international" },
  { name: "Barcelona",    slug: "barcelona",   logo: L("barcelona"),   href: "/shop/serieA/international" },
  { name: "Atletico",     slug: "atletico",    logo: L("atletico"),    href: "/shop/serieA/international" },
  { name: "Liverpool",    slug: "liverpool",   logo: L("liverpool"),   href: "/shop/premier-league/liverpool" },
  { name: "Man City",     slug: "man-city",    logo: L("man-city"),    href: "/shop/premier-league/manchester-city" },
  { name: "Arsenal",      slug: "arsenal",     logo: L("arsenal"),     href: "/shop/premier-league/arsenal" },
  { name: "Chelsea",      slug: "chelsea",     logo: L("chelsea"),     href: "/shop/premier-league/chelsea" },
  { name: "Man United",   slug: "man-utd",     logo: L("man-utd"),     href: "/shop/premier-league/manchester-united" },
  { name: "Tottenham",    slug: "tottenham",   logo: L("tottenham"),   href: "/shop/premier-league/tottenham" },
  { name: "Bayern",       slug: "bayern",      logo: L("bayern"),      href: "/shop/rest-of-world" },
  { name: "Dortmund",     slug: "dortmund",    logo: L("dortmund"),    href: "/shop/rest-of-world" },
  { name: "PSG",          slug: "psg",         logo: L("psg"),         href: "/shop/rest-of-world" },
  { name: "Ajax",         slug: "ajax",        logo: L("ajax"),        href: "/shop/rest-of-world" },
  { name: "Porto",        slug: "porto",       logo: L("porto"),       href: "/shop/rest-of-world" },
  { name: "Benfica",      slug: "benfica",     logo: L("benfica"),     href: "/shop/rest-of-world" },
  { name: "Sporting CP",  slug: "sporting",    logo: L("sporting"),    href: "/shop/rest-of-world" },
];

const NAZIONALI = [
  { name: "Italia",       slug: "italia",      logo: L("italia"),      href: "/shop/worldcup/italy" },
  { name: "Francia",      slug: "francia",     logo: L("francia"),     href: "/shop/worldcup/france" },
  { name: "Germania",     slug: "germania",    logo: L("germania"),    href: "/shop/worldcup/germany" },
  { name: "Spagna",       slug: "spagna",      logo: L("spagna"),      href: "/shop/worldcup/spain" },
  { name: "Brasile",      slug: "brasile",     logo: L("brasile"),     href: "/shop/worldcup/brazil" },
  { name: "Argentina",    slug: "argentina",   logo: L("argentina"),   href: "/shop/worldcup/argentina" },
  { name: "Portogallo",   slug: "portogallo",  logo: L("portogallo"),  href: "/shop/worldcup/portugal" },
  { name: "Inghilterra",  slug: "inghilterra", logo: L("inghilterra"), href: "/shop/worldcup/england" },
  { name: "Olanda",       slug: "olanda",      logo: L("olanda"),      href: "/shop/worldcup/netherlands" },
  { name: "Belgio",       slug: "belgio",      logo: L("belgio"),      href: "/shop/worldcup/belgium" },
  { name: "Croazia",      slug: "croazia",     logo: L("croazia"),     href: "/shop/worldcup/croatia" },
  { name: "Marocco",      slug: "marocco",     logo: L("marocco"),     href: "/shop/worldcup/morocco" },
  { name: "USA",          slug: "usa",         logo: L("usa"),         href: "/shop/worldcup/usa" },
  { name: "Messico",      slug: "messico",     logo: L("messico"),     href: "/shop/worldcup/mexico" },
  { name: "Senegal",      slug: "senegal",     logo: L("senegal"),     href: "/shop/worldcup/senegal" },
  { name: "Giappone",     slug: "giappone",    logo: L("giappone"),    href: "/shop/worldcup/japan" },
];

// ─────────────────────────────────────────────────────────────
// TeamCard — vertical portrait card with logo + name
// ─────────────────────────────────────────────────────────────

interface Team {
  name: string;
  slug: string;
  logo: string;
  href: string;
}

function TeamCard({ team }: { team: Team }) {
  return (
    <Link
      href={team.href}
      className="team-card group flex-shrink-0 flex flex-col items-center gap-2 mx-2"
      style={{ width: "88px" }}
    >
      <div
        className="relative w-full flex items-center justify-center rounded-2xl overflow-hidden transition-transform transition-shadow"
        style={{
          height: "108px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          transitionProperty: "transform, box-shadow",
          transitionDuration: "200ms",
          transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        <Image
          src={team.logo}
          alt={team.name}
          width={56}
          height={56}
          className="object-contain drop-shadow-lg"
          style={{ maxWidth: "56px", maxHeight: "56px" }}
        />
      </div>
      <span
        className="text-[10px] font-bold text-center leading-tight whitespace-nowrap"
        style={{
          fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
          letterSpacing: "1.5px",
          color: "rgba(255,255,255,0.55)",
          textTransform: "uppercase",
        }}
      >
        {team.name}
      </span>

      <style jsx>{`
        .team-card:hover > div:first-child {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(200,240,0,0.25);
          border-color: rgba(200,240,0,0.25);
        }
        .team-card:hover span {
          color: rgba(200,240,0,0.85);
        }
        @media (hover: none) and (pointer: coarse) {
          .team-card:hover > div:first-child {
            transform: none;
            box-shadow: none;
          }
          .team-card:hover span { color: rgba(255,255,255,0.55); }
        }
      `}</style>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────
// Strip — infinite marquee row of TeamCards
// ─────────────────────────────────────────────────────────────

function Strip({
  teams,
  direction,
  paused,
  duration,
}: {
  teams: Team[];
  direction: "left" | "right";
  paused: boolean;
  duration: number;
}) {
  // Duplicate for seamless infinite scroll
  const doubled = [...teams, ...teams];
  const animClass = direction === "left" ? "animate-ticker-left" : "animate-ticker-right";

  return (
    <div className="overflow-hidden">
      <div
        className={`${animClass} flex`}
        style={{ animationPlayState: paused ? "paused" : "running", animationDuration: `${duration}s` }}
      >
        {doubled.map((team, i) => (
          <TeamCard key={`${team.slug}-${i}`} team={team} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SectionLabel
// ─────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-6 mb-3">
      <span
        className="text-[9px] uppercase tracking-[3px] font-bold"
        style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.6)" }}
      >
        {label}
      </span>
      <span className="flex-1 h-px" style={{ background: "rgba(200,240,0,0.08)" }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TeamLogoTicker — main export
// ─────────────────────────────────────────────────────────────

export default function TeamLogoTicker() {
  const [paused, setPaused] = useState(false);

  return (
    <section
      className="py-10 overflow-hidden relative select-none"
      style={{
        background: "#0a0a0a",
        borderTop: "0.5px solid rgba(200,240,0,0.1)",
        borderBottom: "0.5px solid rgba(200,240,0,0.1)",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Fade edges */}
      <div
        className="absolute inset-y-0 left-0 w-20 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, #0a0a0a, transparent)" }}
      />
      <div
        className="absolute inset-y-0 right-0 w-20 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, #0a0a0a, transparent)" }}
      />

      {/* Section heading */}
      <div className="flex items-center justify-center gap-3 mb-7 px-4">
        <span className="w-6 h-[1.5px] rounded-full inline-block" style={{ background: "#c8f000" }} />
        <span
          className="text-[10px] uppercase tracking-[4px] font-bold"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.75)" }}
        >
          // Le Squadre
        </span>
        <span className="w-6 h-[1.5px] rounded-full inline-block" style={{ background: "#c8f000" }} />
      </div>

      {/* Strip 1 — Serie A */}
      <div className="mb-5">
        <SectionLabel label="Serie A" />
        <Strip teams={SERIE_A} direction="left" paused={paused} duration={35} />
      </div>

      {/* Strip 2 — Resto del Mondo */}
      <div className="mb-5">
        <SectionLabel label="Resto del Mondo" />
        <Strip teams={RESTO_MONDO} direction="right" paused={paused} duration={28} />
      </div>

      {/* Strip 3 — Nazionali */}
      <div>
        <SectionLabel label="Nazionali" />
        <Strip teams={NAZIONALI} direction="left" paused={paused} duration={30} />
      </div>
    </section>
  );
}
