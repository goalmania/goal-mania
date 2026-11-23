import Link from "next/link";

const LEAGUES = [
  { href: "/shop", label: "Tutte" },
  { href: "/shop/2026/27", label: "26/27" },
  { href: "/shop/serieA", label: "Serie A" },
  { href: "/shop/premier-league", label: "Premier League" },
  { href: "/shop/worldcup", label: "Mondiali 2026" },
  { href: "/shop/international", label: "Grandi club" },
  { href: "/shop/retro", label: "Retro" },
];

// Scorciatoie, non una sezione: una riga da scorrere, un tocco e sei nella categoria
export default function LeagueRail() {
  return (
    <nav aria-label="Categorie" className="border-b border-white/12 bg-[#0a0a0a] py-3">
      <ul className="rail">
        {LEAGUES.map((l, i) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className={`cut cut-sm flex h-12 items-center px-5 text-[19px] font-extrabold uppercase tracking-wide transition-colors ${i === 0 ? "bg-white text-[#0a0a0a]" : "bg-[#1b1b19] text-white hover:bg-[#c8f000] hover:text-[#0a0a0a] active:bg-[#c8f000] active:text-[#0a0a0a]"}`}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
