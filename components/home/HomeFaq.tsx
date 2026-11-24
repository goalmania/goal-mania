// FAQ visibile in home: è la stessa lista che finisce nel dato strutturato FAQPage, così Google trova a schermo ciò che legge nello schema.
export type FaqItem = { q: string; a: string };

export default function HomeFaq({ items }: { items: FaqItem[] }) {
  return (
    <section aria-labelledby="faq-h" className="mx-auto w-full max-w-[1760px] px-5 py-14 md:px-10 lg:px-16">
      <h2 id="faq-h" className="disp text-[clamp(2.2rem,6vw,4.5rem)] leading-[0.9] text-white">
        Maglie da calcio a poco prezzo: le domande giuste
      </h2>
      <div className="mt-8 max-w-[80ch] divide-y divide-white/10 border-y border-white/10">
        {items.map((it) => (
          <details key={it.q} className="group py-5">
            <summary className="cursor-pointer list-none text-[19px] font-bold text-white marker:hidden">
              <span className="mr-2 inline-block text-[var(--lime)] transition-transform group-open:rotate-45">+</span>
              {it.q}
            </summary>
            <p className="mt-3 text-[17px] leading-relaxed text-[var(--text-2)]">{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
