import type { ReactNode } from "react";

// Intestazione di tutte le pagine interne: una riga che dice dove sei, il titolo grande, due righe di spiegazione.
// Le righe del campo dietro sono lo stesso segno della home.
export default function PageHeader({
  eyebrow,
  title,
  lead,
  children,
  as: Tag = "h1",
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <header className={`hero-pitch relative overflow-hidden ${className}`}>
      <div className="relative z-10 mx-auto w-full max-w-[1760px] px-5 pb-6 pt-9 md:px-10 md:pb-9 md:pt-14 lg:px-16">
        {eyebrow && <p className="text-[14px] font-bold text-[var(--lime)]">{eyebrow}</p>}
        <Tag className="disp mt-2 text-[clamp(2.8rem,8vw,6.6rem)] leading-[0.88] text-white">{title}</Tag>
        {lead && <p className="mt-4 max-w-[56ch] text-[clamp(1.05rem,1.4vw,1.3rem)] italic leading-snug text-[var(--text-2)]">{lead}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </header>
  );
}
