import { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import LegalDoc, { LegalSection as S, CONTACT_EMAIL } from "@/components/shared/LegalDoc";

export const metadata: Metadata = {
  title: "Informativa sulla privacy | Goal Mania",
  description: "Quali dati personali raccoglie Goal Mania, perché, con chi li condivide e come puoi esercitare i tuoi diritti.",
  alternates: { canonical: "https://goal-mania.it/privacy" },
};

export default function PrivacyPage() {
  return (
    <div>
      <PageHeader eyebrow="Informazioni legali" title="Privacy" lead="Come trattiamo i tuoi dati personali." />
      <LegalDoc updated="25 novembre 2026">
        <S n={1} title="Titolare del trattamento">
          <p>
            Il titolare è Goal Mania, gestore del sito goal-mania.it. Per qualsiasi richiesta sui tuoi dati scrivi a <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </S>
        <S n={2} title="Quali dati raccogliamo">
          <p>Dati che ci dai tu, quando crei un account, fai un ordine o ci scrivi:</p>
          <ul>
            <li>nome, email e, se serve alla consegna, telefono;</li>
            <li>indirizzo di spedizione e di fatturazione;</li>
            <li>storico e dettagli degli ordini, comprese le personalizzazioni;</li>
            <li>i messaggi che ci invii.</li>
          </ul>
          <p>
            I dati della carta non passano da noi: il pagamento è gestito da Stripe, che ci comunica solo l&apos;esito e informazioni non sensibili sull&apos;operazione.
          </p>
          <p>Dati raccolti mentre navighi: indirizzo IP, tipo di browser e dispositivo, pagine viste e tempo di permanenza.</p>
        </S>
        <S n={3} title="Perché li usiamo">
          <ul>
            <li>per elaborare, spedire e assistere i tuoi ordini (base giuridica: esecuzione del contratto);</li>
            <li>per scriverti sullo stato dell&apos;ordine e rispondere alle tue richieste;</li>
            <li>per rispettare obblighi fiscali e di legge;</li>
            <li>per prevenire frodi e proteggere il sito;</li>
            <li>per capire come viene usato il sito e migliorarlo, tramite strumenti di analisi (vedi la sezione cookie).</li>
          </ul>
          <p>Non vendiamo i tuoi dati.</p>
        </S>
        <S n={4} title="Con chi li condividiamo">
          <p>Solo con fornitori che ci servono per far funzionare il negozio, nei limiti di quanto necessario:</p>
          <ul>
            <li><strong>Stripe</strong> per i pagamenti;</li>
            <li>i corrieri e chi prepara la spedizione, per consegnarti l&apos;ordine;</li>
            <li>i servizi di hosting, database, email e immagini che fanno girare il sito;</li>
            <li><strong>Google Analytics</strong> e <strong>Microsoft Clarity</strong> per le statistiche di utilizzo.</li>
          </ul>
          <p>Possiamo comunicare dati alle autorità quando la legge lo richiede.</p>
        </S>
        <S n={5} title="Cookie e strumenti di analisi">
          <p>
            Usiamo cookie tecnici, necessari al funzionamento del sito (per esempio carrello e accesso all&apos;account), e strumenti di analisi che misurano come viene usato il sito. Google Analytics ci dà statistiche aggregate sulle visite;
            Microsoft Clarity registra come ci si muove tra le pagine, per individuare le parti poco chiare. Puoi bloccare o cancellare i cookie dalle impostazioni del browser: le funzioni essenziali possono però smettere di funzionare.
          </p>
        </S>
        <S n={6} title="Quanto tempo li conserviamo">
          <ul>
            <li>dati dell&apos;account: finché non chiedi di cancellarlo;</li>
            <li>dati degli ordini: per il tempo richiesto dagli obblighi fiscali e contabili (in genere 10 anni);</li>
            <li>messaggi di assistenza: il tempo necessario a gestire la richiesta e le eventuali contestazioni;</li>
            <li>statistiche: secondo i tempi impostati nei rispettivi strumenti di analisi.</li>
          </ul>
        </S>
        <S n={7} title="I tuoi diritti">
          <p>Secondo il GDPR puoi chiederci in qualsiasi momento di:</p>
          <ul>
            <li>avere una copia dei tuoi dati e sapere come li usiamo;</li>
            <li>correggerli o aggiornarli;</li>
            <li>cancellarli, quando la legge lo permette;</li>
            <li>limitarne il trattamento o opporti a un uso specifico;</li>
            <li>riceverli in un formato leggibile e portabile;</li>
            <li>revocare un consenso che hai dato.</li>
          </ul>
          <p>
            Scrivi a <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> o usa la pagina <Link className="underline" href="/contact">Contatti</Link>. Se pensi che i tuoi diritti non siano stati rispettati, puoi presentare reclamo al Garante per la protezione dei dati personali (garanteprivacy.it).
          </p>
        </S>
        <S n={8} title="Trasferimenti fuori dall'UE">
          <p>Alcuni fornitori, come Google e Microsoft, possono trattare dati fuori dall&apos;Unione Europea. Lo fanno con le garanzie previste dal GDPR, per esempio le clausole contrattuali standard.</p>
        </S>
        <S n={9} title="Minori">
          <p>Il sito non è rivolto a chi ha meno di 16 anni e non raccogliamo consapevolmente dati di minori. Se pensi che sia successo, scrivici e li cancelliamo.</p>
        </S>
        <S n={10} title="Modifiche">
          <p>Se cambiamo questa informativa, pubblichiamo qui la nuova versione con la data di aggiornamento.</p>
        </S>
      </LegalDoc>
    </div>
  );
}
