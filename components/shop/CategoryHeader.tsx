// Intestazione compatta delle pagine categoria: titolo, una riga, e subito i prodotti.
export default function CategoryHeader({ title, text }: { title: string; text: string }) {
  return (
    <header className="mx-auto max-w-7xl px-5 pb-4 pt-8 md:px-8 md:pt-12">
      <h1 className="display text-[clamp(2.2rem,6vw,3.75rem)]">{title}</h1>
      <p className="mt-3 max-w-[44ch] text-[18px] leading-snug text-[var(--text-2)]">{text}</p>
    </header>
  );
}
