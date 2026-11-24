import Link from "next/link";

const CHIPS = [
  { href: "/shop", label: "Tutte" },
  { href: "/shop/2026/27", label: "Novità 26/27" },
  { href: "/shop/serieA", label: "Serie A" },
  { href: "/shop/premier-league", label: "Premier League" },
  { href: "/shop/worldcup", label: "Mondiali 2026" },
  { href: "/shop/international", label: "Grandi club" },
  { href: "/archivio", label: "Maglie retro" },
  { href: "/shop/mystery-box", label: "Mystery box" },
];

// Una riga da scorrere: un tocco e sei nella categoria
export default function FilterChips({ current = "/shop" }: { current?: string }) {
  return (
    <nav aria-label="Categorie" className="border-y-2 border-[var(--line)] bg-[var(--wall)]">
      <ul className="rail !py-3">
        {CHIPS.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              aria-current={c.href === current ? "page" : undefined}
              className={`flex h-11 items-center px-5 font-[family-name:var(--font-display)] text-[19px] italic uppercase tracking-[0.02em] transition-colors ${c.href === current ? "bg-[var(--lime)] text-[#0a0a0a]" : "bg-white/8 text-white hover:bg-[var(--lime)] hover:text-[#0a0a0a]"}`}
            >
              {c.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
