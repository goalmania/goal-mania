# 🤖 Generatore Automatico di Articoli — Guida Setup

Questo sistema genera automaticamente **4 articoli ogni ora** (≈96/giorno)
usando feed RSS gratuiti + Google Gemini AI, pubblicando su Goal-Mania.it con immagini Unsplash.

**Costo totale: €0** — tutto gratis.

---

## Confronto con i big

| Sito | Articoli/giorno |
|------|----------------|
| Sky Sport Italia | 50–100 |
| Gazzetta dello Sport | 60–90 |
| Corriere dello Sport | 50–80 |
| **Goal-Mania (questo sistema)** | **~96 (4/ora × 24)** |

---

## Come funziona

```
Ogni ora (cron-job.org — gratis)
  → Legge feed RSS di Gazzetta, Corriere, Tuttosport, CalcioMercato, Goal.com
  → Gemini AI scrive 4 articoli originali in italiano
  → Cerca immagine tematica per ognuno (Unsplash — gratis)
  → Salva tutti su MongoDB con status "published"
  → Gli articoli appaiono subito sul sito
```

**Fonti RSS (gratis, illimitati, nessuna API key):**
- Gazzetta dello Sport
- Corriere dello Sport
- Tuttosport
- CalcioMercato.com
- Goal.com

---

## Step 1 — Ottieni la chiave Google Gemini (GRATIS)

1. Vai su **https://aistudio.google.com**
2. Accedi con il tuo account Google
3. Clicca **Get API Key** → **Create API Key**
4. Copia la chiave

> **Piano gratuito:** 1.500 richieste/giorno — bastano per 375 articoli/giorno.
> **Nessuna carta di credito richiesta.**

---

## Step 2 — Ottieni la chiave Unsplash (GRATIS, opzionale)

Se non la configuri, usa automaticamente immagini di calcio predefinite.

1. Vai su **https://unsplash.com/developers**
2. Clicca **Your apps** → **New Application**
3. Accetta i termini, dai un nome all'app (es. "Goal Mania")
4. Copia la **Access Key**

---

## Step 3 — Configura le variabili su Vercel

1. Vai su **vercel.com** → Dashboard del tuo progetto
2. **Settings** → **Environment Variables**
3. Aggiungi queste variabili:

```
GEMINI_API_KEY      = la chiave di Google AI Studio  ← OBBLIGATORIA
UNSPLASH_ACCESS_KEY = la chiave di Unsplash          ← opzionale
CRON_SECRET         = una-password-inventata-da-te   ← OBBLIGATORIA
```

4. Fai un nuovo **Deploy** per applicarle

---

## Step 4 — Configura il cron su cron-job.org (GRATIS)

> Vercel free non permette cron orari — usiamo cron-job.org che è completamente gratuito.

1. Vai su **https://cron-job.org** e registrati (gratis)
2. Clicca **Create cronjob**
3. Configura così:

| Campo | Valore |
|-------|--------|
| **URL** | `https://goal-mania.it/api/cron/generate-article` |
| **Schedule** | Every hour (ogni ora) |
| **Request method** | GET |
| **Header name** | `Authorization` |
| **Header value** | `Bearer TUA_CRON_SECRET` (la stessa che hai messo su Vercel) |

4. Salva → **il sistema gira da solo per sempre**

---

## Test manuale

Testa subito senza aspettare il cron:

### Da browser (in locale):
```
http://localhost:3000/api/cron/generate-article
```

### Con curl (in produzione):
```bash
curl -H "Authorization: Bearer TUA_CRON_SECRET" \
  https://goal-mania.it/api/cron/generate-article
```

Risposta attesa:
```json
{
  "success": true,
  "published": 4,
  "total": 4,
  "duration": "28.3s",
  "articles": [
    { "success": true, "title": "...", "slug": "..." },
    { "success": true, "title": "...", "slug": "..." }
  ]
}
```

---

## Monitoraggio

Controlla gli articoli generati:

```
https://goal-mania.it/api/cron/status
```

---

## Personalizzazioni

### Cambiare il numero di articoli per run (in `route.ts` riga 9):
```ts
const ARTICLES_PER_RUN = 4; // cambia a 2, 6, 8...
```

### Cambiare la frequenza su cron-job.org:
- Ogni 30 minuti → 192 articoli/giorno
- Ogni ora → 96 articoli/giorno ← **consigliato**
- Ogni 2 ore → 48 articoli/giorno

### Aggiungere altri feed RSS:
In `route.ts`, array `RSS_FEEDS`, aggiungi altri feed. Basta avere la URL del feed.

---

## Struttura dei file

```
app/api/cron/
├── generate-article/
│   └── route.ts    ← Logica principale (RSS → Gemini × 4 → Unsplash → MongoDB)
└── status/
    └── route.ts    ← Monitoraggio articoli generati
```
