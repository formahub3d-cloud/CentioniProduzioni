# Centioni Produzioni — Portfolio & Blog

Sito portfolio + blog costruito con **Astro** (output statico), micro-animazioni
CSS-first e CMS git-based (**Sveltia CMS**, dalla Fase 2). Ottimizzato per
performance e SEO/GEO.

> Stato: **Fase 1 completata** (struttura, content collections, SEO, contenuti
> di esempio). Il design è volutamente **neutro/provvisorio**: la palette, il
> font e l'atmosfera su misura verranno applicati una volta ricevuto l'URL di
> riferimento.

## Comandi

```bash
npm install        # installa le dipendenze
npm run dev        # server di sviluppo su http://localhost:4321
npm run build      # type-check + build statica in dist/
npm run preview    # anteprima della build
```

## Struttura

```
src/
  content/
    blog/            # articoli in Markdown
    projects/        # progetti in Markdown
  content.config.ts  # schema delle due collection (fonte di verità)
  assets/media/      # ⟵ CARTELLA MEDIA UNICA (vedi sotto)
  components/        # componenti UI (.astro)
  layouts/           # layout di base
  pages/             # rotte del sito
  styles/global.css  # design tokens + stili globali
  data/site.ts       # metadati del sito (nome, URL, nav, social)
public/
  fonts/             # font self-hosted (woff2)
  favicon.svg
  admin/             # Sveltia CMS (aggiunto in Fase 2)
```

## Immagini — cartella media unica

Tutte le immagini vivono in **una sola cartella condivisa**, committata su Git:

```
src/assets/media/
```

Questa cartella è usata sia per le immagini caricate **a mano**, sia per quelle
caricate dagli editor **via CMS** (Sveltia userà la stessa cartella). Una sola
fonte, nessuna cartella doppia.

### Come referenziare un'immagine

**Nei campi `cover` dei contenuti** (frontmatter Markdown), usa il percorso
**relativo al file** Markdown. Poiché i contenuti stanno in
`src/content/<collezione>/`, il percorso è sempre:

```yaml
cover: '../../assets/media/nome-file.jpg'
```

Astro ottimizza automaticamente queste immagini (formati moderni, dimensioni
responsive) tramite il componente `<Image>`. Dal CMS questo percorso viene
scritto automaticamente (vedi `public_folder` nella config di Sveltia, Fase 2).

**Dentro il corpo Markdown** puoi usare la sintassi standard:

```md
![Didascalia](../../assets/media/nome-file.jpg)
```

### Formati consigliati

- Carica immagini grandi (lato lungo ≥ 1600px): Astro genera le versioni più
  piccole. Preferisci `.jpg`/`.png`; Astro le converte in formati moderni.

## Content collections

Definite in `src/content.config.ts` — questa è la **fonte di verità** dei campi.
La config del CMS (Fase 2) rispecchia esattamente questi campi.

**`blog`** — `title`, `date`, `cover` (opz.), `excerpt`, `tags[]`, `draft`, corpo.
**`projects`** — `title`, `cover`, `year`, `role`, `links[]` (label+url),
`description`, `order`, `draft`, corpo.

I post/progetti con `draft: true` non vengono pubblicati né inseriti in sitemap.

## SEO / GEO

- Meta `title`/`description` per pagina + Open Graph e Twitter card
- `sitemap-index.xml` generata (esclude `/admin`)
- `robots.txt` dinamico con riferimento alla sitemap
- JSON-LD: `Article` sugli articoli, `CreativeWork` sui progetti
- Feed RSS del blog su `/rss.xml`

## Performance

- Zero JavaScript non necessario (solo un piccolo script di scroll-reveal)
- Font self-hosted in `public/fonts` con `preload`
- View Transitions native di Astro per le transizioni di pagina
- `prefers-reduced-motion` rispettato ovunque

## Design

Il look è guidato dai **design token** in `src/styles/global.css` (`:root`).
Per ri-skinnare il sito basta modificare quei token: i componenti non usano
colori/font hard-coded. Il nome del sito, la nav e i social stanno in
`src/data/site.ts`.
