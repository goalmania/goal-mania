// La cifra del decennio, nello stile della sua epoca. Solo per gli anni 2010 serve l'ombra lunga (il flat design di allora).
const LONG = Array.from({ length: 36 }, (_, i) => `${((i + 1) * 0.011).toFixed(3)}em ${((i + 1) * 0.011).toFixed(3)}em 0 #e1d9c6`).join(",");

export default function EraNumeral({ cls, value, className = "", style }: { cls: string; value: string; className?: string; style?: React.CSSProperties }) {
  return (
    <span className={`era-num block ${className}`} style={cls === "era-10" ? { ...style, textShadow: LONG } : style} aria-hidden="true">
      {value}
    </span>
  );
}
