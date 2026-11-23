// Cifre del tabellone: scattano una sola volta al caricamento (CSS, nessun JavaScript).
// Il simbolo € e piu piccolo e il numero non va mai a capo.
export default function BoardNumber({ value, className = "", delay = 0 }: { value: string; className?: string; delay?: number }) {
  return (
    <span className={`whitespace-nowrap ${className}`} aria-label={value}>
      {value.split("").map((c, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="board-digit"
          style={{ animationDelay: `${delay + i * 80}ms`, ...(c === "€" ? { fontSize: "0.6em", marginLeft: "0.04em" } : {}) }}
        >
          {c}
        </span>
      ))}
    </span>
  );
}
