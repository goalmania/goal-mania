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
    <nav aria-label="Categorie" className="py-2">
      <ul className="rail">
        {LEAGUES.map((l, i) => (
          <li key={l.href}>
            <Link href={l.href} className={`btn !h-11 !px-5 !text-[16px] ${i === 0 ? "bg-white text-[#0a0a0a]" : "btn-glass"}`}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
