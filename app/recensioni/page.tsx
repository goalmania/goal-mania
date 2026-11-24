import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import VintedReviews from "@/components/shared/VintedReviews";
import RealOrdersGallery from "@/components/shared/RealOrdersGallery";
import TrustBar from "@/components/home/TrustBar";
import { vintedStats } from "@/lib/data/vintedReviews";

export const metadata: Metadata = {
  title: "Recensioni Goal Mania: 72 recensioni ricevute su Vinted",
  description: "Prima di aprire questo sito vendevamo maglie da calcio su Vinted: 72 recensioni, media 4,6 su 5. Qui le trovi tutte, con il nome utente di chi le ha scritte, insieme alle foto dei pacchi che spediamo.",
  alternates: { canonical: "https://goal-mania.it/recensioni" },
};

// Pagina per chi cerca "Goal Mania recensioni": dice chiaro da dove vengono, senza fingere che siano acquisti su questo sito.
export default function ReviewsPage() {
  return (
    <div>
      <PageHeader eyebrow="Recensioni" title="Cosa dicono di noi" lead={`Prima di questo sito vendevamo maglie su Vinted. Sono le ${vintedStats.count} recensioni ricevute lì, con il nome utente di chi le ha scritte: media ${vintedStats.avg.toFixed(1).replace(".", ",")} su 5. Non sono acquisti fatti su goal-mania.it.`}>
        <Link href="/shop" className="btn btn-lime">Vai alle maglie</Link>
      </PageHeader>
      <VintedReviews />
      <RealOrdersGallery />
      <TrustBar />
    </div>
  );
}
