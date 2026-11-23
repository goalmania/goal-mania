// Cifre del tabellone: scattano una sola volta al caricamento (CSS, nessun JavaScript).
export default function BoardNumber({ value, className = "", delay = 0 }: { value: string; className?: string; delay?: number }) {
  return (
    <span className={className} aria-label={value}>
      {value.split("").map((c, i) => (
        <span key={i} aria-hidden="true" className="board-digit" style={{ animationDelay: `${delay + i * 80}ms` }}>
          {c}
        </span>
      ))}
    </span>
  );
}
