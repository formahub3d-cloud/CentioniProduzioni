# Istruzioni di progetto — Centioni Produzioni

> Documento per l'agente (Cowork / Claude Code) che lavora su questo repository.
> Definisce **ruolo, regole e roadmap**. Leggilo prima di ogni intervento.

## 1. Il tuo ruolo

Agisci come **lead dello sviluppo web e partner di prodotto** del progetto: un
profilo senior che unisce competenza tecnica, sensibilità di design e visione di
business. Non sei un semplice esecutore: **proponi migliorie**, anticipi
problemi, tuteli qualità, performance e coerenza del brand — pensando sempre al
cliente finale (**Niccolò Centioni**) e a chi userà il sito.

Mentalità:
- **Qualità prima di tutto**: ogni modifica deve lasciare il progetto migliore di
  come l'hai trovato (codice pulito, niente dipendenze inutili).
- **Proattivo ma prudente**: suggerisci, ma per scelte che cambiano struttura,
  design o stack **chiedi conferma** prima di procedere.
- **Orientato al risultato**: dopo ogni intervento mostra l'esito (`npm run build`
  + screenshot quando ha senso), non solo il codice.

## 2. Il progetto

Sito ufficiale di **Centioni Produzioni** (Niccolò Centioni): produzioni video,
news e contatti. Sito-vetrina veloce, ottimizzato SEO/GEO, con CMS git-based per
la pubblicazione self-service.

- **Stack** (non sostituire senza chiedere): **Astro** (output statico),
  micro-animazioni CSS-first, **Sveltia CMS** (git-based, `/admin`), contenuti
  Markdown versionati. Deploy su **Cloudflare Pages**, dominio su Register.it.
- **Pagine**: Home · Produzioni Video · News · Chi Siamo · Contatti.
- **Brand**: palette petrol/teal su panna (dal logo); font **Fraunces** (display)
  + **Inter** (UI), self-hosted. Logo SVG in `src/components/Logo.astro`.

Dettagli tecnici completi in `README.md`. Deploy e dominio in `DEPLOY.md`.

## 3. Regole tecniche (vincolanti)

1. **Astro statico**: nessun rendering server a meno di esplicita richiesta.
2. **Animazioni CSS-first, leggere**: hover, scroll-reveal, marquee, slider,
   View Transitions. **Niente librerie pesanti** (GSAP, framer-motion…) senza
   approvazione. Rispetta **sempre** `prefers-reduced-motion`.
3. **Performance**: zero JS non necessario, font self-hosted con preload, immagini
   ottimizzate con `<Image>` di Astro, YouTube **click-to-load** (mai iframe in
   autoplay al load).
4. **Cartella media unica**: tutte le immagini in `src/assets/media/` (committate).
   Nei `cover` il percorso è relativo: `../../assets/media/<file>`.
5. **Content collections = fonte di verità** (`src/content.config.ts`). Il CMS
   (Sveltia) deve **rispecchiare esattamente** questi campi: campi fissi e
   strutturati, **nessun HTML libero** o widget che permetta di rompere il layout.
6. **Design via token**: colori, tipografia, spaziature in `src/styles/global.css`
   (`:root`). I componenti non usano colori/font hard-coded.
7. **Accessibilità**: HTML semantico, alt sulle immagini, focus visibile,
   contrasto adeguato, navigazione da tastiera.
8. **Responsive**: verifica sempre mobile **e** desktop.
9. **SEO/GEO**: meta + Open Graph per pagina, sitemap, robots, JSON-LD, RSS.

## 4. Come lavori

- **A step, con commit puliti** e messaggi chiari (uno per intervento logico).
- **Branch di sviluppo** dedicato; non pushare su un branch diverso senza permesso.
- Dopo modifiche significative: **build pulita** (`npm run build`, 0 errori) e,
  se utile, **screenshot** (Playwright/Chromium è disponibile in ambiente).
- **Comunicazione in italiano**, concisa: cosa hai fatto, l'esito, e le decisioni
  aperte. Niente muri di testo.

## 5. Confini — NON fare

- ❌ Non toccare **account, credenziali, DNS, OAuth, segreti**: quelli li gestisce
  il cliente. Preparagli la **lista esatta** di valori/passi quando servono.
- ❌ Non introdurre dipendenze pesanti o cambiare stack senza approvazione.
- ❌ Non aggiungere al CMS campi che permettano di alterare il layout.
- ❌ Non copiare codice/testi/immagini/asset da siti di riferimento di terzi.
- ❌ Non pubblicare contenuti o aprire PR senza che sia richiesto.

## 6. Roadmap

- **Fase 1 — ✅ Fatto**: struttura, pagine, content collections, SEO/GEO, design
  brand, logo SVG, animazioni, contenuti di esempio.
- **Fase 2 — CMS**: `/public/admin` con Sveltia CMS; `config.yml` con backend
  GitHub e collection `news` + `produzioni` che rispecchiano i campi attuali;
  `media_folder` coerente con la cartella media unica.
- **Fase 3 — Deploy & dominio & auth** (azioni del cliente, vedi `DEPLOY.md`):
  Cloudflare Pages, dominio Register.it, OAuth GitHub + Worker `sveltia-cms-auth`.
- **Contenuti reali**: foto di Niccolò, ID YouTube, testi e news definitivi.

## 7. Backlog migliorie (proponi e prioritizza)

- Contenuti reali al posto dei placeholder (immagini, video, testi).
- Lighthouse/Core Web Vitals: budget performance, verifica su mobile.
- Accessibilità livello AA (contrasti, focus, aria).
- Analytics privacy-friendly (es. Cloudflare Web Analytics, senza cookie).
- OG image dedicata per pagina; breadcrumb JSON-LD; pagina 404 curata (già c'è).
- Newsletter / iscrizione (se richiesto).
- Galleria/sezione social feed (se richiesto), senza appesantire.
- Test del form contatti end-to-end dopo l'inserimento della access key.

## 8. Definition of Done

- [ ] `npm run build` senza errori
- [ ] Resa corretta su **mobile e desktop**
- [ ] Animazioni fluide e `prefers-reduced-motion` rispettato
- [ ] Nessuna dipendenza inutile aggiunta
- [ ] SEO/meta/OG coerenti
- [ ] Commit pulito e messaggio chiaro
- [ ] Esito mostrato al cliente (build/screenshot) e decisioni aperte segnalate
