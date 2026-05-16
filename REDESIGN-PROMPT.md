# GOAL MANIA — REDESIGN PROMPT PER CLAUDE CODE
## Prompt completo per rifare la grafica del sito da zero

---

## CONTESTO E OBIETTIVO

Stai ridisegnando completamente la UI/UX di **goal-mania.it**, un sito ibrido editoriale-ecommerce per tifosi italiani di calcio che:
- Pubblica notizie di calcio e calciomercato
- Vende maglie da calcio ufficiali (Serie A, Premier League, Mondiali, Retro)

Il codebase è **Next.js 14 App Router + TypeScript + Tailwind CSS + MongoDB**. Non toccare la logica backend, le API routes, i modelli dati, né l'autenticazione. Ridisegna **solo** i componenti UI, i layout delle pagine e i CSS/Tailwind. Ogni file che modifichi è un file di componente React (`.tsx`) o un file CSS globale.

**Obiettivo**: Massimizzare il conversion rate. Il sito deve sembrare la fusione tra un media brand sportivo premium (The Athletic, Sky Sport) e un e-commerce di moda ad alta conversione (Gymshark, ASOS). Non deve sembrare uno shop generico.

---

## DESIGN SYSTEM — TOKEN ADATTATI

Adatta il DM Scout Design System per e-commerce. Mantieni l'estetica dark/industrial ma con **border-radius arrotondati** (non più sharp industrial) e una palette che funziona per un brand football consumer.

### Palette colori
```css
:root {
  /* FONDAMENTALI */
  --black:        #0a0a0c;     /* background principale */
  --surface:      #111116;     /* card background */
  --surface-2:    #1a1a22;     /* input, hover state */
  --border:       rgba(255,255,255,0.08);
  --border-hover: rgba(255,255,255,0.16);
  --white:        #f0eeea;     /* testo primario */
  --muted:        rgba(240,238,234,0.45); /* testo secondario */

  /* BRAND */
  --accent:       #FF7A00;     /* arancione Goal Mania — CTA primario */
  --accent-hover: #FF9020;
  --accent-dim:   rgba(255,122,0,0.12);
  --accent-glow:  rgba(255,122,0,0.25);

  /* ACCENTO SECONDARIO */
  --lime:         #c8f000;     /* highlight, badge "LIVE", prezzi */
  --lime-dim:     rgba(200,240,0,0.10);

  /* STATO */
  --green:        #00c87a;     /* disponibile, spedizione gratis */
  --red:          #ff4444;     /* urgenza, esaurito */
  --orange:       #ff8c00;     /* avviso, "pochi pezzi" */
  --blue:         #3b82f6;     /* PayPal, link info */

  /* TIPOGRAFIA */
  --font-display: 'Barlow Condensed', sans-serif;
  --font-body:    'Barlow', sans-serif;
  --font-mono:    'Space Mono', monospace;

  /* SPACING */
  --radius-sm:    8px;
  --radius-md:    12px;
  --radius-lg:    16px;
  --radius-xl:    24px;
  --radius-pill:  999px;

  /* OMBRE */
  --shadow-glow:  0 0 30px rgba(255,122,0,0.15);
  --shadow-card:  0 4px 24px rgba(0,0,0,0.4);
}
```

### Font (Google Fonts — già importato)
```
Barlow Condensed: 700, 800, 900 → titoli, nav, statistiche, prezzi
Barlow: 400, 500, 600 → corpo testo, descrizioni
Space Mono: 400, 700 → label, badge, tag, numeri tecnici
```

### Regole visive globali
- Background: `#0a0a0c` con noise texture SVG a opacity 0.03 (come DM Scout)
- Tutti i card: `background: var(--surface)`, `border: 0.5px solid var(--border)`, `border-radius: var(--radius-md)`
- CTA primario: background arancione `var(--accent)`, testo nero, `border-radius: var(--radius-pill)`, font Barlow Condensed 700 uppercase
- Separatori: `border-bottom: 0.5px solid var(--border)` (hairline)
- Hover su card: `border-color: var(--border-hover)`, `transform: translateY(-2px)`, transizione 200ms
- Immagini prodotto: `border-radius: var(--radius-lg)`, sfondo `var(--surface-2)`

---

## COMPONENTI GLOBALI

### 1. ANNOUNCEMENT BAR (sopra l'header — NUOVO)
Una barra di 36px fissa sopra il navbar. Ruota automaticamente tra 3 messaggi ogni 4 secondi con fade-in animato:

```
Messaggio 1: 🚚 SPEDIZIONE GRATUITA IN ITALIA SU TUTTI GLI ORDINI
Messaggio 2: ⚡ PRENDI 3 MAGLIE — PAGHI SOLO 2  →  SCOPRI L'OFFERTA
Messaggio 3: 🏆 NUOVE MAGLIE MONDIALI 2026 DISPONIBILI ORA →
```

Styling:
- Background: `var(--accent)` (arancione pieno)
- Testo: nero, `font-family: var(--font-mono)`, `font-size: 0.65rem`, `letter-spacing: 2px`, uppercase
- I messaggi con "→" sono cliccabili (link a `/shop/worldcup` e `/shop`)
- X per chiudere (salva in `localStorage`)
- Su mobile: testo più corto, nessuna X (swipe per cambiare)

---

### 2. HEADER — Redesign completo

**Desktop (≥768px):**
```
[Logo]  [Nav links]  [Search]  [Wishlist]  [Cart badge]  [Accedi / Avatar]
```

- Altezza: 64px
- Background: `rgba(10,10,12,0.92)` con `backdrop-filter: blur(20px)`
- Bordo inferiore: `0.5px solid var(--border)`
- Logo: Font Barlow Condensed 900, "Goal" in bianco + "Mania" in `var(--accent)`, con pallone ⚽ SVG a sinistra
- Nav links: Barlow Condensed 600, 0.8rem, uppercase, `letter-spacing: 2px`, colore `var(--muted)`, hover → bianco
- Link attivo: bordo inferiore 2px `var(--accent)`
- "NEGOZIO" ha una dropdown mega-menu (vedi sotto)
- Search: icona, al click apre una search bar overlay animata che copre tutta la larghezza del header
- Cart: icona bag con badge numerico `var(--accent)` arrotondato
- CTA "Accedi": `btn-ghost` piccolo
- Se loggato: avatar circolare con dropdown (Ordini / Profilo / Logout)

**Mega-menu Negozio** (al hover su "NEGOZIO"):
Panel che cade sotto il nav, 3 colonne + immagine promo:
```
Colonna 1 "Per Lega":    Colonna 2 "Per Stile":    Colonna 3 "Stagione":    [Promo Card]
Serie A                   Nuova stagione 25/26       2025-26                  [Img maglia]
Premier League            Retro Collection           2024-25                  "NUOVI ARRIVI"
Mondiali 2026             Edizioni Limitate          Mondiali 2026            [CTA]
Internazionali            Giubbotti
                          Mystery Box
```
Background: `var(--surface)`, `border: 0.5px solid var(--border)`, `border-radius: 0 0 var(--radius-lg) var(--radius-lg)`, `box-shadow: var(--shadow-card)`

**Mobile (<768px):**
- Hamburger → Sheet che scivola da sinistra
- Nel sheet: Logo + links con frecce + sezioni collassabili per Negozio
- In fondo: icone social + link privacy/spedizione

---

### 3. LOGO TICKER — Team Logos Scroller (INNOVAZIONE #1)

Un componente riutilizzabile `<TeamLogoTicker />` che mostra loghi delle squadre che scorrono in loop infinito (come i ticker finanziari).

```
[⚽ Juventus] [⚽ Inter] [⚽ Milan] [⚽ Napoli] [⚽ Arsenal] [⚽ Real Madrid] [⚽ PSG] [⚽ Bayern] ...
```

Implementazione:
- CSS `@keyframes scroll` con `transform: translateX(-50%)` su un container duplicato (per loop seamless)
- Velocità: 30s per un ciclo completo
- Al hover: pausa animazione
- Ogni logo è un Link verso la pagina della squadra nello shop
- Logo: immagine 32x32px (da `/public/logos/[team].png`) + nome squadra in Barlow Condensed 600
- Styling: badge con `background: var(--surface-2)`, `border: 0.5px solid var(--border)`, `border-radius: var(--radius-pill)`, padding `6px 14px 6px 8px`
- Due righe: riga superiore scorre a sinistra, riga inferiore scorre a destra (effetto contrapposto)
- Usato in: Homepage (tra hero e prodotti), pagine categoria

---

### 4. LIVE MATCH TICKER (INNOVAZIONE #2)

Una barra sottile (28px) tra l'announcement bar e l'header OPPURE come sezione orizzontale nell'homepage, che mostra i risultati live delle partite in corso.

```
⚡ LIVE  |  Juventus 2 - 0 Milan  45'  |  Arsenal 1 - 1 Chelsea  67'  |  Real Madrid 3 - 1 PSG  FT  |  ...
```

- Background: `var(--surface)`, bordo arancione a sinistra 3px
- "LIVE" badge in `var(--lime)` con pulsing dot animato
- Scorre in loop orizzontale se ci sono più di 3 partite
- Dati da API esistente nel codebase (`/api/matches` o `LiveFootballMatches` component)
- Al click su un match → apre modale o va alla pagina risultati `/risultati`

---

### 5. FOOTER — Redesign

4 colonne + barra finale:
```
Colonna 1: Logo + tagline + social icons (Instagram, TikTok, YouTube, Twitter/X)
Colonna 2: SHOP RAPIDO — Serie A / Premier League / Mondiali / Retro / Mystery Box
Colonna 3: INFORMAZIONI — Chi siamo / Spedizione / Resi / Privacy / Termini
Colonna 4: NEWSLETTER — "Sii il primo a sapere di nuove maglie e offerte" + input email + btn
```

Barra finale:
```
© 2026 Goal Mania Srl — P.IVA XXXXXXXXXX — Via XXXX — [Payment logos: Visa/MC/PayPal/Apple Pay]
```

Styling:
- Background: `var(--surface)`
- Separatore in cima: gradient `from var(--accent) to transparent`
- Logo colonne: Barlow Condensed 600, uppercase, `var(--muted)`, `letter-spacing: 2px`
- Link: 0.85rem, `var(--muted)`, hover → `var(--white)`
- Newsletter input: `var(--surface-2)`, arancione al focus
- Payment logos: icone SVG grigie, `opacity: 0.5`

---

## HOMEPAGE — `/`

### Struttura completa dall'alto verso il basso:

**[1] ANNOUNCEMENT BAR** (sempre visibile)

**[2] HEADER**

**[3] LIVE MATCH TICKER** — piccola barra sotto l'header

**[4] HERO SECTION**

Layout a schermo pieno (100vh):
- Sinistra (60%): 
  - Eyebrow label: `// IL FOOTBALL È QUI` in Space Mono, lime, con lineetta
  - H1 in Barlow Condensed 900, clamp(3rem, 8vw, 7rem), uppercase, bianco:
    ```
    LE MIGLIORI
    MAGLIE DA
    CALCIO →
    ```
    L'ultima parola "CALCIO" in arancione
  - Sottotitolo: "Notizie live, calciomercato e le maglie ufficiali dei tuoi club. Spedizione gratuita."
  - 2 CTA affiancati:
    - Primary pill: "SHOP MAGLIE" → `/shop` (background arancione, testo nero)
    - Secondary ghost: "ULTIME NOTIZIE" → `/news` (bordo bianco)
  - Trust strip orizzontale (4 items con icone): 🚚 Spedizione Gratis | 🔄 7 Giorni Reso | ✓ Pagamento Sicuro | ⭐ 4.8/5 Clienti
- Destra (40%): immagine hero di una maglia con effetto glow arancione dietro (`box-shadow: 0 0 120px var(--accent-glow)`), leggermente ruotata 5deg, animazione float (su/giù 8px, 3s ease-in-out infinite)
- Background: `var(--black)` con noise texture + wordmark gigante sfumato "GOAL MANIA" (`opacity: 0.02`, Barlow Condensed 900)

**[5] TEAM LOGO TICKER** — `<TeamLogoTicker />` riga 1 sinistra + riga 2 destra

**[6] FLASH SALE BANNER** (INNOVAZIONE #3 — Urgenza)
Un panel a larghezza piena, background a gradient `from #1a0a00 to #0a0a0c`, bordo arancione 1px:
```
⚡ OFFERTA FLASH — TERMINA TRA:  [02] [14] [33]  ORE MIN SEC
                                  [CTA: VEDI L'OFFERTA →]
```
- Countdown reale in JS che parte da 24h e scende
- Il numero del countdown ha font Barlow Condensed 900, size 2.5rem, colore lime
- Label sotto i numeri in Space Mono tiny

**[7] PRODOTTI IN EVIDENZA — "I PIÙ VENDUTI"**

Grid 4 colonne desktop, 2 mobile:
- Titolo sezione: `section-label` + "I PIÙ VENDUTI DELLA SETTIMANA" in Barlow Condensed 800

**Product Card — nuovo design:**
```
[Immagine prodotto 4:5]
  → badge "NUOVO" / "LAST PIECE" / "OFFERTA" nell'angolo in alto a sinistra
  → cuore wishlist in alto a destra (diventa arancione al click)
[Nome squadra — piccolo, muted]
[Nome maglia — Barlow Condensed 700, 1.1rem, uppercase]
[Prezzo — grande, arancione, Barlow Condensed 900]
[Strip sociale: "👁 12 persone stanno guardando questo"]  ← INNOVAZIONE #4
[Taglia rapida: [S] [M] [L] [XL] — mini bottoni, click → aggiunge al cart]
[CTA: [AGGIUNGI AL CARRELLO]]
```

Badge tipi (nell'angolo):
- "NUOVO" → lime background, nero
- "LAST PIECE" → rosso background, bianco, pulsing
- "OFFERTA" → arancione, nero
- "SOLD OUT" → grigio, opacità ridotta su tutta la card

Social proof "👁 X persone stanno guardando" — numero randomizzato tra 8-23, cambia ogni 30-90s con animazione fade.

**[8] ULTIME NOTIZIE** — Layout magazine 3 colonne

Notizia principale a sinistra (grande, immagine 16:9), 2 notizie secondarie a destra (piccole, orizzontali).
- "Leggi tutto →" link ghost in fondo

**[9] TEAM LOGO TICKER** — seconda riga (direzione inversa)

**[10] BANNER "PRENDI 3 PAGHI 2"** (INNOVAZIONE #5 — Urgenza AOV)

Sezione a sfondo `var(--surface)` con due colonne:
- Sinistra: 3 maglie impilate/visualizzate in fanned layout
- Destra: 
  - Badge "OFFERTA ESCLUSIVA"
  - "Compra 3 maglie, la terza è GRATIS"
  - Lista checkmark: ✓ Combina qualsiasi squadra ✓ Qualsiasi taglia ✓ Nessun codice necessario
  - CTA: "COSTRUISCI IL TUO BUNDLE →"

**[11] CALCIOMERCATO LIVE** — sezione notizie transfer con badge "🔴 LIVE"

**[12] SEZIONE "COME LO INDOSSANO I TIFOSI"** (INNOVAZIONE #6 — Social proof UGC)

Grid di foto (placeholder per ora: `/public/ugc/`) con:
- Overlay dark al hover con nome + club del tifoso
- Call-to-action sotto: "Mostraci il tuo look → @goalmania #goalmania"
- Background sezione: `var(--surface)`

**[13] TRUST BAR** — 4 colonne con icone

```
[🚚]              [↩️]           [🔒]              [⭐]
Spedizione        Cambio         Pagamento         4.8/5
Gratuita          7 Giorni       100% Sicuro       2.400+ Ordini
```

**[14] FOOTER**

---

## PAGINA SHOP — `/shop`

**Layout:**
- Header fisso
- Sotto header: `<ShopNav />` sticky con tabs orizzontali scorrevoli: `Serie A | Premier League | Mondiali | Internazionali | Stagione 25/26 | Retro | Giubbotti | Limited | Mystery Box`
- Tabs: background `var(--surface)`, tab attiva: bordo inferiore arancione 2px, testo bianco
- Filtri laterali (desktop): sidebar sinistra 240px sticky con:
  - Filtro "Lega" (checkbox)
  - Filtro "Stagione"
  - Filtro "Taglia" (S/M/L/XL/XXL/3XL — toggle buttons)
  - Filtro "Prezzo" (slider range)
  - Filtro "Disponibilità" (toggle: Solo disponibili)
  - CTA "APPLICA FILTRI" arancione pill

- Grid prodotti: 3 colonne desktop, 2 tablet, 1 mobile
- Sopra la grid: `X prodotti trovati` + sort dropdown (Novità / Più venduti / Prezzo ↑ / Prezzo ↓)

**LIVE STOCK TICKER** (INNOVAZIONE #7) — barra orizzontale sopra la grid:
```
⚡ QUASI ESAURITO:  Maglia Juventus Home 25/26 — taglia M: solo 2 rimasti  |  Arsenal Away: taglia S esaurita  |  ...
```
Scorre orizzontalmente. Testo in Space Mono tiny. Background `var(--accent-dim)`. Bordo arancione a sinistra.

---

## PAGINA PRODOTTO — `/products/[id]`

Questa è la pagina più importante. Ogni elemento è pensato per convertire.

**Layout desktop: 2 colonne**

### COLONNA SINISTRA (55%) — Galleria

- Immagine principale: grande, `border-radius: var(--radius-lg)`, background `var(--surface-2)`
- Thumbnails sotto: 4 miniature orizzontali, selezionata con bordo arancione 2px
- Badge "NUOVO ARRIVO" / "SOLO X RIMASTI" sull'immagine in alto a sinistra
- Wishlist heart in alto a destra (con animazione pop al click)
- Zoom al hover (CSS transform scale 1.08, overflow hidden)
- **Vista 360° button** (INNOVAZIONE #8): piccolo bottone "↺ VEDI A 360°" sotto le thumbnails — apre una modale con gallery interattiva drag-rotate

### COLONNA DESTRA (45%) — Info e CTA

**Blocco 1 — Brand e titolo:**
```
[Badge lega: "SERIE A" in Space Mono tiny]
[H1: "MAGLIA JUVENTUS HOME 2025-26" — Barlow Condensed 900, 2.2rem, uppercase]
[Sottotitolo: stagione, tecnologia tessuto se disponibile]
```

**Blocco 2 — Prezzo + Urgenza:**
```
€ 30,00  [IVA INCLUSA]
━━━━━━━━━━━━━━━━━━━
🔥 [12] persone stanno guardando questa maglia ora     ← INNOVAZIONE #4
⏱ Ordina entro [03h 22m] per riceverla entro giovedì  ← INNOVAZIONE #9
```
Il countdown "entro" usa la stima di spedizione reale (giorni lavorativi).

**Blocco 3 — Spedizione gratuita (SOPRA le taglie, non sotto):**
```
✅ Spedizione GRATUITA in Italia — Consegna 3-5 giorni lavorativi
```
Verde, piccolo, Barlow 500, con icona truck. Non può essere mancato.

**Blocco 4 — Taglie:**
```
TAGLIA  [Guida alle taglie →]
[ADULT]  [KIDS]

[S]  [M]  [L]  [XL]  [XXL]  [3XL]
          SOLO 2 ↑
```
- Bottoni taglia: `border-radius: var(--radius-sm)`, `background: var(--surface-2)`, `border: 0.5px solid var(--border)`
- Selezionata: `background: var(--accent)`, `color: black`, `border: none`
- Esaurita: testo barrato, opacità 0.3, non cliccabile
- "SOLO 2 rimasti" sotto la taglia specifica — in arancione, Space Mono tiny
- "Guida alle taglie →" → apre modal `<ProductSizeChart />` già esistente nel codebase

**Blocco 5 — Personalizzazioni (accordion):**
```
▼ PERSONALIZZA LA TUA MAGLIA  (+€3 – +€17)

  ☐ Patch Champions League +€3
  ☐ Patch Serie A +€3
  ☐ Aggiungi pantaloncini +€11
  ☐ Aggiungi calze +€17
  ☐ Edizione Giocatore +€5
  ☐ Numero maglia [____]
  
  TOTALE CONFIGURAZIONE: €30,00  ← aggiorna live
```
L'accordion è chiuso di default su mobile, aperto su desktop.

**Blocco 6 — CTA (STICKY su mobile):**
```
[  AGGIUNGI AL CARRELLO  ]  (secondary ghost, full width)
[  COMPRA ORA →          ]  (primary arancione, full width, più grande)
```
Su mobile: barra sticky bottom con prezzo a sinistra + due bottoni a destra.

**Blocco 7 — Micro-trust:**
```
🔒 Pagamento Sicuro  |  ↩️ Cambio in 7 Giorni  |  📦 Spedizione Gratuita
[Visa] [Mastercard] [PayPal] [Apple Pay]
```

**Blocco 8 — Bundle suggerito** (INNOVAZIONE #10):
```
COMPLETA IL LOOK
━━━━━━━━━━━━━━━━
[Maglia] + [Pantaloncini] + [Calze]  =  €58 invece di €67
[Risparmia €9 — AGGIUNGI IL BUNDLE →]
```
Immagini piccole dei 3 prodotti affiancate con frecce "+".

---

**Sotto la fold — tabs:**

`DETTAGLI PRODOTTO | RECENSIONI (0) | TAGLIE & FIT | FAQ`

- Tab DETTAGLI: descrizione prodotto (da DB, non più 3 parole), materiale, tecnologia, cura
- Tab RECENSIONI: se 0 → "Sii il primo a recensire. Ricevi €2 di sconto sul prossimo ordine." (INNOVAZIONE #11)
- Tab TAGLIE: chart completo misure petto/vita/altezza
- Tab FAQ: 4-5 FAQ specifiche al prodotto (accordion)

**Sezione "Articoli Correlati":**
```
ULTIME NOTIZIE SU [JUVENTUS]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Articolo 1]  [Articolo 2]  →  "Tutte le notizie su Juventus"
```
Questo collega il prodotto alle notizie del club. Fondamentale per il modello editoriale.

**Sezione "Potrebbe Interessarti":**
Grid 4 prodotti (stessa squadra o stessa lega), stile card standard.

---

## PAGINE CATEGORIA — `/shop/serieA`, `/shop/premier-league/[team]`, etc.

**Struttura:**
- Hero banner della categoria: immagine sfondo (stadium o badge lega), gradiente dark sopra, H1 grande (es. "SERIE A 2025-26")
- Per le pagine team specifiche: logo del club grande in sfondo (opacity 0.06), colori del club come accento secondario
- Sotto: `<ShopNav />` + grid prodotti + filtri

**INNOVATION #12 — Team Context Banner:**
Nelle pagine `/shop/serieA/juventus` ecc., mostra sotto l'H1:
```
[Logo Juve grande]  JUVENTUS  |  Serie A  |  Torino, Italia
"La maglia che portano sul campo Vlahovic, Locatelli e Yıldız"
↓ [Ultima notizia Juventus: "Vlahovic rinnova fino al 2028" — 2h fa]
```
Questo connette il contesto sportivo all'acquisto.

---

## PAGINE NOTIZIE — `/news` e `/news/[slug]`

### `/news` — Lista articoli

Layout magazine a 3 colonne:
- Articolo principale (top, full width): immagine grande 16:9 + titolo grande + summary + autore + data
- Griglia 3 colonne sotto: card con immagine 16:9, titolo, tag categoria, data
- Tag filtro sopra la grid: `[TUTTO] [SERIE A] [PREMIER LEAGUE] [CALCIOMERCATO] [MONDIALI]`
- Infinite scroll o "Carica altri 12 →"

### `/news/[slug]` — Articolo singolo

Layout:
- Breadcrumb: Home > News > [Titolo]
- H1: Barlow Condensed 800, grande, uppercase
- Autore + data + tempo di lettura + condivisione (WhatsApp, Twitter, copia link)
- Immagine hero full-width con `border-radius: var(--radius-lg)`
- Corpo articolo: Barlow 400, line-height 1.8, max-width 680px centrato

**JerseyAdBlock — Nuovo design contestuale** (INNOVAZIONE #13):
Appare a metà articolo, con design aggiornato:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚽ INDOSSA I LORO COLORI
[Foto maglia Juventus]   MAGLIA JUVENTUS HOME 2025-26
                         "La maglia di Vlahovic e Yıldız"
                         €30,00  •  Spedizione Gratuita
                         [ACQUISTA ORA →]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
Bordato sopra e sotto con hairline. Background `var(--surface)`. Non è un popup — è parte dell'articolo.

- Notizie correlate a fondo pagina: 3 card orizzontali "Potrebbe interessarti"
- "ULTIME MAGLIE DI [TEAM]": 3 card prodotto sotto l'articolo, col titolo del club

---

## CHECKOUT — `/checkout`

### Step 1 — Indirizzo

**Aggiungi opzione guest checkout** (CRITICO):
```
Come vuoi procedere?
○ [CONTINUA COME OSPITE]     ← nuovo bottone
○ [ACCEDI AL MIO ACCOUNT]
○ [CREA ACCOUNT]
```
Il guest checkout chiede solo: nome, cognome, email, indirizzo, telefono.
Dopo il pagamento → "Salva i tuoi dati per il prossimo ordine?" (opt-in account creation).

### Step 2 — Pagamento

Layout aggiornato con payment methods in ordine di conversione:
```
[Apple Pay / Google Pay]  ← ONE-TAP, primo e più grande  (INNOVAZIONE #14)
━━━━━━━━━━━━━━━━━━━━━━
oppure paga con:
[○ Carta di Credito — Visa / Mastercard / AmEx]
[○ PayPal]
[○ Scalapay — Paga in 3 rate da €10/mese]   ← BNPL Italy (INNOVAZIONE #15)
```

Order summary con trust signals integrati:
```
RIEPILOGO ORDINE
━━━━━━━━━━━━━━━━
Maglia Arsenal Home 2026-27  €30,00
  Size: M | Custom ✓

Subtotale:  €30,00
Spedizione: 🟢 GRATUITA
━━━━━━━━━━━━━━━━
TOTALE:     €30,00  (IVA inclusa)
━━━━━━━━━━━━━━━━
🔒 Pagamento sicuro e crittografato
[Visa] [Mastercard] [PayPal] [ApplePay]
↩️ Reso gratuito entro 7 giorni
```

### Step conferma — `/checkout/success`

```
✅ ORDINE CONFERMATO!
Il tuo ordine #XXXXX è stato ricevuto.
Ti invieremo una email di conferma a [email].

[TRACCIA IL TUO ORDINE]  [TORNA ALLO SHOP]

━━━━━━━━━━━━━━━━━━━━━━━━━
POTREBBE INTERESSARTI
[3 card prodotto correlate]
```

---

## CART — `/cart`

Layout 2 colonne: lista items a sinistra, order summary a destra (sticky).

**Ogni item nel cart:**
```
[Immagine prodotto]  [Nome]          [Taglia: M]
                     [Prezzo: €30]   [Qty: -  1  +]
                     [Personaliz.]   [🗑 Rimuovi]
```

**Cross-sell nel cart** (INNOVAZIONE #16):
```
AGGIUNGI E RISPARMIA
━━━━━━━━━━━━━━━━━━━━
Aggiungi 2 maglie → la terza è GRATIS (promo attiva)
[Maglia A]  [Maglia B]  [Maglia C]
[AGGIUNGI AL BUNDLE →]
```

**Order summary:**
```
Subtotale:     €30,00
Spedizione:   🟢 GRATUITA
Sconto:        —
━━━━━━━━━━━━━━
TOTALE:        €30,00

[PROCEDI AL CHECKOUT →]   ← CTA arancione, grande, pill
[Continua lo shopping ←]  ← ghost

🔒 Checkout sicuro  |  ↩️ Reso 7gg  |  🚚 Spedizione gratis
[Visa] [MC] [PayPal] [ApplePay] [Scalapay]
```

Il PromoToast **non appare** su `/cart` e `/checkout`. Solo su shop e articoli.

---

## PAGINA ACCOUNT — `/profile` e `/account/orders`

Dark card style. Sidebar sinistra con navigazione account (Profilo / Ordini / Wishlist / Notifiche / Logout).

Ordini: tabella con status badge colorato (In lavorazione / Spedito / Consegnato / Reso).

---

## INNOVAZIONI RIASSUNTO

| # | Feature | Dove | Impatto CRO |
|---|---|---|---|
| 1 | Team Logo Ticker infinito | Homepage, categorie | Brand + engagement |
| 2 | Live Match Ticker | Header / Homepage | Engagement + tempo sul sito |
| 3 | Flash Sale Countdown | Homepage | Urgenza → acquisto immediato |
| 4 | "X persone guardano ora" | Prodotto, card | FOMO → add-to-cart |
| 5 | Bundle 3x2 proattivo | Homepage, cart | +AOV |
| 6 | UGC social grid | Homepage | Social proof reale |
| 7 | Live Stock Ticker | Shop | Urgenza inventory |
| 8 | 360° jersey viewer | Prodotto | Fiducia prodotto |
| 9 | Countdown consegna | Prodotto | Urgenza spedizione |
| 10 | Bundle suggerito visivo | Prodotto | +AOV |
| 11 | Incentivo prima recensione | Tab recensioni | Raccolta social proof |
| 12 | Team Context Banner | Pagine squadra | Connessione editoriale |
| 13 | JerseyAdBlock editoriale | Articoli | Funnel content→shop |
| 14 | Apple Pay / Google Pay | Checkout | -abbandono mobile |
| 15 | Scalapay BNPL | Checkout | Rimozione barriera prezzo |
| 16 | Cross-sell nel cart | Cart | +AOV, anti-abbandono |

---

## ANNOUNCEMENT BAR — PromoToast sostituzione

**Elimina completamente il PromoToast popup** (`components/PromoToast.tsx`). È distruttivo per la conversione.

Sostituiscilo con l'**Announcement Bar** fissa in cima (punto 1 degli header globali) + un **"Recent Buyer Notification"** toast che appare in basso a sinistra per 4 secondi:

```
┌────────────────────────────────────┐
│ 🛒  Marco da Milano ha appena     │
│     acquistato la Maglia Inter     │
│     Home — 2 minuti fa             │
└────────────────────────────────────┘
```

- Non blocca il contenuto (position: fixed bottom-left, max-width: 280px)
- Appare ogni 45-90 secondi con dati ruotati (nomi italiani + città reali + jersey reali dal DB)
- NON appare su `/checkout` e `/cart`
- Ha una X per chiudere

---

## REGOLE DI IMPLEMENTAZIONE CLAUDE CODE

1. **Non modificare mai**: file in `/api/`, `/lib/`, modelli Mongoose, logica di autenticazione NextAuth, file `.env`
2. **Usa Tailwind** per tutti gli stili — crea classi custom in `globals.css` solo per le CSS custom properties e le animazioni keyframe
3. **Tutti i componenti nuovi** vanno in `components/ui/` (se stateless/primitivi) o `app/_components/` (se contengono logica di business)
4. **`next/image`** per tutte le immagini. Mai `<img>` raw. Specifica sempre `width`, `height`, `alt`
5. **Font**: aggiungi Barlow Condensed, Barlow, Space Mono all'import Google Fonts in `app/layout.tsx`
6. **Mobile first**: ogni componente deve essere perfetto su 375px prima di gestire desktop
7. **Animazioni**: usa `framer-motion` (già installato) per le animazioni di entrata. CSS keyframes per i ticker e loop infiniti
8. **Accessibilità**: tutti i button con `aria-label`, immagini con `alt` descrittivo, focus visible
9. **Dark mode only**: questo sito è dark-only, non implementare light mode toggle
10. **TypeScript strict**: nessun `any` dove evitabile, tipi per tutti i props dei componenti

---

## ORDINE DI IMPLEMENTAZIONE CONSIGLIATO

```
Fase 1 (globals + base):
  → globals.css: CSS custom properties + keyframes ticker + noise texture
  → layout.tsx: font import, announcement bar, aggiorna header
  → components/layout/Header.tsx: redesign completo
  → components/layout/Footer.tsx: redesign completo
  → components/AnnouncementBar.tsx: nuovo
  → components/TeamLogoTicker.tsx: nuovo
  → components/RecentBuyerToast.tsx: nuovo (sostituto PromoToast)

Fase 2 (homepage):
  → app/page.tsx + HeroSection
  → components/home/FlashSaleBanner.tsx: nuovo
  → components/ProductCard.tsx: redesign (card prodotto)
  → app/_components/LiveMatchTicker.tsx: nuovo

Fase 3 (pagine shop e prodotto):
  → app/shop/page.tsx + ShopClient
  → app/shop/serieA/[team]/page.tsx
  → app/_components/ProductDetailClient.tsx: redesign completo
  → app/_components/ProductSizeChart.tsx: integra nel prodotto

Fase 4 (checkout + cart):
  → app/cart/page.tsx
  → app/checkout/page.tsx: aggiungi guest checkout
  → app/checkout/PaymentStep.tsx: aggiungi Apple Pay / Scalapay

Fase 5 (editoriale):
  → app/news/[slug]/page.tsx
  → app/_components/JerseyAdBlock.tsx: redesign copy contestuale
  → app/news/page.tsx
```

---

*Prompt creato per Claude Code — goal-mania.it redesign — 2026-05-15*
*Basato su: DM Scout Design System + CRO audit completo + analisi live del sito*
