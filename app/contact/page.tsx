import type { Metadata } from "next";
import { Mail, MapPin, Instagram } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import FaqShort from "@/components/shared/FaqShort";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contatti | Goal Mania",
  description: "Scrivi a Goal Mania per ordini, spedizioni, resi e taglie. Rispondiamo via email.",
  alternates: { canonical: "https://goal-mania.it/contact" },
};

const link = "flex items-start gap-3 rounded-2xl bg-[var(--wall)] p-4 text-[17px] font-semibold text-white shadow-[inset_0_0_0_1px_var(--line)] transition-colors hover:bg-[var(--wall-2)]";

export default function ContactPage() {
  return (
    <div>
      <PageHeader eyebrow="Contatti" title="Scrivici" lead="Per un ordine, una taglia o un reso. Compila il modulo e ti rispondiamo via email." />
      <div className="mx-auto grid w-full max-w-[1760px] gap-8 px-5 pb-12 md:px-10 lg:grid-cols-[1.3fr_0.7fr] lg:px-16">
        <ContactForm />
        <aside className="space-y-3" aria-label="Altri contatti">
          <a href="mailto:goalmaniaofficial@gmail.com" className={link}><Mail className="mt-0.5 h-5 w-5 shrink-0 text-[var(--lime)]" />goalmaniaofficial@gmail.com</a>
          <a href="https://www.instagram.com/goalmaniaofficial/" target="_blank" rel="noopener noreferrer" className={link}><Instagram className="mt-0.5 h-5 w-5 shrink-0 text-[var(--lime)]" />@goalmaniaofficial</a>
          <p className={link}><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[var(--lime)]" /><span>3° Piano, Via Roma 245, Complesso i-Hub, Centro, Milano, Lombardia 20100</span></p>
        </aside>
      </div>
      <FaqShort title="Risposte rapide" />
    </div>
  );
}
