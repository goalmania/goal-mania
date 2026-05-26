"use client";

import Link from "next/link";
import Image from "next/image";

const L = (slug: string) => `/team-logos/${slug}.png`;

const PREMIER_TEAMS = [
  { name: "Liverpool",    slug: "liverpool",          logo: L("liverpool"),  href: "/shop/premier-league/liverpool" },
  { name: "Man City",     slug: "man-city",           logo: L("man-city"),   href: "/shop/premier-league/manchester-city" },
  { name: "Arsenal",      slug: "arsenal",            logo: L("arsenal"),    href: "/shop/premier-league/arsenal" },
  { name: "Chelsea",      slug: "chelsea",            logo: L("chelsea"),    href: "/shop/premier-league/chelsea" },
  { name: "Man United",   slug: "man-utd",            logo: L("man-utd"),    href: "/shop/premier-league/manchester-united" },
  { name: "Tottenham",    slug: "tottenham",          logo: L("tottenham"),  href: "/shop/premier-league/tottenham" },
  { name: "Real Madrid",  slug: "real-madrid",        logo: L("real-madrid"),href: "/shop/rest-of-world" },
  { name: "Barcelona",    slug: "barcelona",          logo: L("barcelona"),  href: "/shop/rest-of-world" },
  { name: "Atletico",     slug: "atletico",           logo: L("atletico"),   href: "/shop/rest-of-world" },
  { name: "Bayern",       slug: "bayern",             logo: L("bayern"),     href: "/shop/rest-of-world" },
  { name: "Dortmund",     slug: "dortmund",           logo: L("dortmund"),   href: "/shop/rest-of-world" },
  { name: "PSG",          slug: "psg",                logo: L("psg"),        href: "/shop/rest-of-world" },
  { name: "Ajax",         slug: "ajax",               logo: L("ajax"),       href: "/shop/rest-of-world" },
  { name: "Porto",        slug: "porto",              logo: L("porto"),      href: "/shop/rest-of-world" },
  { name: "Benfica",      slug: "benfica",            logo: L("benfica"),    href: "/shop/rest-of-world" },
  { name: "Sporting CP",  slug: "sporting",           logo: L("sporting"),   href: "/shop/rest-of-world" },
];

function TeamLogoCard({ name, logo, href }: { name: string; logo: string; href: string }) {
  return (
    <Link
      href={href}
      className="team-logo-card-pl group flex flex-col items-center gap-2"
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
          .team-logo-card-pl:hover > div:first-child {
            transform: translateY(-4px);
            box-shadow: 0 12px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(200,240,0,0.3);
            border-color: rgba(200,240,0,0.3) !important;
          }
          .team-logo-card-pl:hover span {
            color: rgba(200,240,0,0.9) !important;
          }
        }
        .team-logo-card-pl:active > div:first-child {
          transform: scale(0.97);
        }
      `}</style>
    </Link>
  );
}

export default function PremierLeagueClient() {
  return (
    <section className="pb-12 px-4 sm:px-6" style={{ background: "#080808" }}>
      <div className="max-w-7xl mx-auto">
        <div
          className="grid gap-x-4 gap-y-6"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
          }}
        >
          {PREMIER_TEAMS.map((team) => (
            <div key={team.slug} className="flex justify-center">
              <TeamLogoCard name={team.name} logo={team.logo} href={team.href} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
