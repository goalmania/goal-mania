import type { ReactNode } from "react";

export const CONTACT_EMAIL = "goalmaniaofficial@gmail.com";

export function LegalSection({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="mb-9">
      <h2 className="mb-3 text-[24px] font-bold text-white">
        {n}. {title}
      </h2>
      <div className="space-y-3 text-[17px] leading-relaxed text-[var(--text-2)] [&_li]:mt-1.5 [&_ul]:list-disc [&_ul]:pl-6 [&_strong]:text-white">{children}</div>
    </section>
  );
}

export default function LegalDoc({ children, updated }: { children: ReactNode; updated: string }) {
  return (
    <div className="mx-auto w-full max-w-[1760px] px-5 pb-16 md:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-[920px] rounded-3xl bg-[var(--wall)] p-6 shadow-[inset_0_0_0_1px_var(--line)] md:p-10">
        {children}
        <p className="border-t border-[var(--line)] pt-5 text-[15px] text-[var(--text-3)]">Ultimo aggiornamento: {updated}</p>
      </div>
    </div>
  );
}
