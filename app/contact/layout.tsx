import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contattaci — Goal Mania",
  description:
    "Hai domande su un ordine, una spedizione o un prodotto? Scrivici su WhatsApp o via email. Il nostro team risponde entro 24 ore.",
  alternates: {
    canonical: "https://goal-mania.it/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
