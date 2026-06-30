import { defineConfig } from 'tinacms';

// Branch di produzione (in CI può arrivare da env).
const branch =
  process.env.TINA_BRANCH ||
  process.env.GITHUB_BRANCH ||
  process.env.HEAD ||
  'main';

export default defineConfig({
  branch,
  // Credenziali TinaCloud (da env / GitHub secrets).
  clientId: process.env.TINA_CLIENT_ID ?? null,
  token: process.env.TINA_TOKEN ?? null,

  build: {
    outputFolder: 'admin', // → public/admin (sostituisce Sveltia)
    publicFolder: 'public',
  },

  // Cartella media UNICA e condivisa col sito (src/assets/media).
  // Il percorso salvato è "/src/assets/media/<file>", che Astro risolve
  // con image() (stesso schema usato dal sito).
  media: {
    tina: {
      mediaRoot: 'src/assets/media',
      publicFolder: '',
    },
  },

  schema: {
    collections: [
      // ---------------------------------------------------------------- NEWS
      {
        name: 'news',
        label: 'News',
        path: 'src/content/news',
        format: 'md',
        defaultItem: () => ({ draft: true }),
        fields: [
          { type: 'string', name: 'title', label: 'Titolo', isTitle: true, required: true },
          {
            type: 'datetime',
            name: 'date',
            label: 'Data',
            required: true,
            ui: { dateFormat: 'DD/MM/YYYY' },
          },
          { type: 'image', name: 'cover', label: 'Copertina' },
          {
            type: 'string',
            name: 'excerpt',
            label: 'Estratto',
            required: true,
            ui: { component: 'textarea' },
          },
          { type: 'string', name: 'tags', label: 'Tag', list: true },
          { type: 'boolean', name: 'draft', label: 'Bozza (non pubblicato)' },
          { type: 'rich-text', name: 'body', label: 'Contenuto', isBody: true },
        ],
      },
      // ---------------------------------------------------------- PRODUZIONI
      {
        name: 'produzioni',
        label: 'Produzioni',
        path: 'src/content/produzioni',
        format: 'md',
        fields: [
          { type: 'string', name: 'title', label: 'Titolo', isTitle: true, required: true },
          {
            type: 'string',
            name: 'status',
            label: 'Stato',
            required: true,
            options: [
              { value: 'in-corso', label: 'In corso' },
              { value: 'in-uscita', label: 'In uscita' },
            ],
          },
          { type: 'image', name: 'cover', label: 'Copertina' },
          {
            type: 'string',
            name: 'youtube',
            label: 'ID video YouTube',
            description: "Solo l'ID, es. da youtube.com/watch?v=ABC123 → ABC123",
          },
          { type: 'string', name: 'video', label: 'Link video esterno (https://…)' },
          { type: 'string', name: 'releaseLabel', label: 'Etichetta di uscita' },
          {
            type: 'string',
            name: 'description',
            label: 'Descrizione',
            ui: { component: 'textarea' },
          },
          { type: 'number', name: 'order', label: 'Ordine (più basso = prima)' },
          { type: 'boolean', name: 'draft', label: 'Bozza (non pubblicato)' },
        ],
      },
    ],
  },
});
