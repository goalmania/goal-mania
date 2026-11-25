import { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import LegalDoc, { LegalSection as S, CONTACT_EMAIL } from "@/components/shared/LegalDoc";

export const metadata: Metadata = {
  title: "Termini e condizioni di vendita | Goal Mania",
  description: "Condizioni di vendita di Goal Mania: prezzi, spedizione gratuita in Italia, consegna in 7-10 giorni lavorativi, reso entro 14 giorni.",
  alternates: { canonical: "https://goal-mania.it/terms" },
};

export default function TermsPage() {
  return (
    <div>
      <PageHeader eyebrow="Informazioni legali" title="Termini e condizioni" lead="Le regole del sito e degli acquisti su Goal Mania, scritte in modo chiaro." />
      <LegalDoc updated="25 novembre 2026">
        <S n={1} title="Cosa vendiamo">
          <p>
            Goal Mania vende maglie da calcio, attuali e retro, in versione tifoso. <strong>Non sono maglie ufficiali dei club</strong> e Goal Mania non è affiliata, sponsorizzata o autorizzata da nessuna squadra, lega o federazione.
            Nomi, stemmi e marchi delle squadre appartengono ai rispettivi proprietari e compaiono solo per indicare a quale maglia ci si riferisce.
          </p>
          <p>Le foto sono illustrative: colori e dettagli possono variare leggermente dal prodotto che ricevi.</p>
        </S>
        <S n={2} title="Prezzi e pagamento">
          <p>
            I prezzi sono in euro e comprendono l&apos;IVA. Il pagamento si fa per intero al momento dell&apos;ordine, con i metodi mostrati al checkout (carte, Apple Pay, Google Pay, PayPal, Klarna), tramite Stripe.
            Non vediamo né conserviamo i dati completi della tua carta.
          </p>
          <p>
            L&apos;offerta <strong>Prendi 3, paghi 2</strong> vale quando nel carrello ci sono almeno tre maglie: la meno cara è gratis. Il prezzo finale viene sempre ricalcolato dal nostro server al momento dell&apos;ordine ed è quello che vedi nel riepilogo prima di pagare.
          </p>
        </S>
        <S n={3} title="Maglie personalizzate">
          <p>Nome, numero, patch e altre personalizzazioni si aggiungono a un costo mostrato nella scheda prodotto. Controlla bene nome e numero prima di ordinare: li stampiamo come li scrivi.</p>
        </S>
        <S n={4} title="Mystery box">
          <p>
            Nella Mystery box scegli quante maglie vuoi, la taglia di ciascuna e, se vuoi, fino a cinque squadre da escludere. Le maglie vengono estratte tra quelle disponibili: non puoi sceglierne una in particolare.
            Prezzo per maglia: 35€ per le attuali, 40€ per le retro.
          </p>
        </S>
        <S n={5} title="Spedizione e consegna">
          <p>La spedizione in Italia è gratuita su ogni ordine. La consegna richiede in genere da 7 a 10 giorni lavorativi dall&apos;ordine; sono tempi stimati e non una scadenza garantita. Dopo la spedizione ricevi per email il codice per seguire il pacco.</p>
        </S>
        <S n={6} title="Reso e rimborso">
          <p>Puoi recedere dall&apos;acquisto entro 14 giorni dalla consegna, senza spiegare il motivo. La maglia deve essere:</p>
          <ul>
            <li>non indossata e in buono stato;</li>
            <li>con le etichette, se presenti, e nella confezione originale;</li>
            <li>accompagnata dai dati dell&apos;ordine.</li>
          </ul>
          <p>
            <strong>Le spese di spedizione del reso sono a carico del cliente</strong>, salvo che il prodotto sia difettoso o diverso da quello ordinato. Le maglie personalizzate (nome, numero, patch) non si possono rendere, perché sono prodotte apposta per te.
          </p>
          <p>Il rimborso arriva sullo stesso metodo di pagamento usato per l&apos;ordine, entro 14 giorni da quando riceviamo la maglia resa. Per avviare un reso scrivi a <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> o usa la pagina <Link className="underline" href="/contact">Contatti</Link>.</p>
        </S>
        <S n={7} title="Prodotto difettoso o sbagliato">
          <p>Se la maglia arriva danneggiata, difettosa o diversa da quella ordinata, scrivici entro pochi giorni dalla consegna con una foto: la sostituiamo o rimborsiamo, senza spese per te.</p>
        </S>
        <S n={8} title="Contenuti del sito">
          <p>Testi, grafiche e immagini originali del sito sono di Goal Mania. Non si possono copiare o usare a scopo commerciale senza permesso.</p>
        </S>
        <S n={9} title="Responsabilità">
          <p>Facciamo il possibile perché le informazioni del sito siano corrette e aggiornate, ma non possiamo garantire che siano sempre prive di errori. Restano ferme le tutele di legge per i consumatori.</p>
        </S>
        <S n={10} title="Legge applicabile">
          <p>Questi termini sono regolati dalla legge italiana. Per i consumatori resta competente il foro del luogo di residenza o domicilio.</p>
        </S>
        <S n={11} title="Modifiche">
          <p>Possiamo aggiornare questi termini. La versione in vigore è quella pubblicata qui al momento dell&apos;ordine.</p>
        </S>
        <S n={12} title="Contatti">
          <p>
            Per qualsiasi domanda: <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>, oppure la pagina <Link className="underline" href="/contact">Contatti</Link>.
          </p>
        </S>
      </LegalDoc>
    </div>
  );
}
