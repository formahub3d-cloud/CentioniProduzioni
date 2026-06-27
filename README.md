# Centioni Produzioni — Sito ufficiale

Sito di **Centioni Produzioni** (Niccolò Centioni): produzioni video, news e
contatti. Costruito con **Astro** (output statico), micro-animazioni CSS-first
e CMS git-based (**Sveltia CMS**, dalla Fase 2). Ottimizzato per performance e
SEO/GEO.

## Comandi

```bash
npm install        # dipendenze
npm run dev        # sviluppo su http://localhost:4321
npm run build      # type-check + build statica in dist/
npm run preview    # anteprima della build
```

## Pagine

- **Home** (`/`) — hero, slider dei momenti salienti, anteprima Produzioni e News.
- **Produzioni Video** (`/produzioni`) — "Progetti in corso" (con embed YouTube
  click-to-load) e "In uscita" (card Coming Soon).
- **News** (`/news`) — griglia articoli; ogni articolo ha la sua pagina
  (`/news/<slug>`).
- **Chi Siamo** (`/chi-siamo`) — la storia di Niccolò Centioni.
- **Contatti** (`/contatti`) — form di contatto + canali social.

## Struttura

```
src/
  content/
    news/            # articoli News (Markdown)
    produzioni/      # produzioni video (Markdown)
  content.config.ts  # schema delle due collection (fonte di verità)
  assets/media/      # ⟵ CARTELLA MEDIA UNICA (vedi sotto)
  components/        # UI (.astro): Logo, Header, Footer, Slider, Marquee,
                     #   LiteYouTube, ProduzioneCard, PostCard, SEO…
  layouts/BaseLayout.astro
  pages/             # rotte
  styles/global.css  # design tokens + stili globali
  data/site.ts       # metadati, navigazione, social, endpoint contatti
public/
  fonts/             # font self-hosted (woff2): Fraunces + Inter
  favicon.svg
  logo-mark.svg      # logo (solo simbolo)
  logo-full.svg      # logo completo (simbolo + wordmark + payoff)
  admin/             # Sveltia CMS (Fase 2)
```

## Logo

Il logo è ricreato in **SVG vettoriale** (originale):

- `src/components/Logo.astro` — il **simbolo** inline (usa `currentColor`, scala
  a qualsiasi dimensione). Usato in header e footer.
- `public/logo-mark.svg` — simbolo a colori (per usi esterni / Open Graph).
- `public/logo-full.svg` — lockup completo (simbolo + CENTIONI PRODUZIONI +
  "VIDEO • SOCIAL • BLOG • NEWS").
- `public/favicon.svg` — favicon (simbolo su fondo teal arrotondato).

## Immagini — cartella media unica

Tutte le immagini in **una sola cartella** committata su Git:
`src/assets/media/`. Usata sia per le immagini caricate a mano sia da quelle
caricate via CMS (Sveltia userà la stessa cartella). Astro le ottimizza
(formati moderni, dimensioni responsive).

Nei campi `cover` (frontmatter), il percorso è relativo al file Markdown — i
contenuti stanno in `src/content/<collezione>/`, quindi:

```yaml
cover: '../../assets/media/nome-file.jpg'
```

> Le immagini attuali sono **placeholder** (gradienti). Sostituiscile con foto
> e copertine reali mantenendo lo stesso nome file (o aggiornando il percorso).

## Content collections

Definite in `src/content.config.ts` (fonte di verità rispecchiata dal CMS).

**`news`** — `title`, `date`, `cover` (opz.), `excerpt`, `tags[]`, `draft`, corpo.
**`produzioni`** — `title`, `status` (`in-corso` | `in-uscita`), `cover` (opz.),
`youtube` (ID video, opz.), `video` (URL esterno, opz.), `releaseLabel` (opz.),
`description` (opz.), `order`, `draft`.

`status: in-corso` mostra l'embed YouTube; `in-uscita` mostra la card
"Coming Soon" con l'etichetta di uscita. I contenuti `draft: true` non vengono
pubblicati né messi in sitemap.

### Embed YouTube

Inserisci l'**ID** del video nel campo `youtube` (es. da
`youtube.com/watch?v=XXXX` → `XXXX`). Il player è **click-to-load** (carica
l'iframe solo al click) per non penalizzare le performance.

## Form contatti

Il form usa **Web3Forms** (`src/data/site.ts` → `CONTACT`), che funziona su sito
statico con una semplice access key gratuita. Vedi `DEPLOY.md` per ottenerla e
configurarla.

## Design

Palette **brand** (dal logo): petrol/teal su panna caldo. Font display
**Fraunces** (serif variabile) per i titoli + **Inter** per UI/testo, entrambi
self-hosted con preload. Tutto è guidato dai **design token** in
`src/styles/global.css` (`:root`): per ri-skinnare basta modificare quei token.

Animazioni leggere e CSS-first (reveal dei titoli riga-per-riga, scroll-reveal,
wipe sulle copertine, marquee, slider, View Transitions). Tutto rispetta
`prefers-reduced-motion`.

## SEO / GEO

Meta + Open Graph per pagina, `sitemap-index.xml`, `robots.txt`, JSON-LD
(Article sulle news, AboutPage/ContactPage), feed RSS su `/rss.xml`.

## Deploy & dominio

Vedi **`DEPLOY.md`** per la guida passo-passo (Cloudflare Pages, dominio
Register.it, form contatti, CMS auth).
