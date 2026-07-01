// Logica di dominio del CMS, condivisa da /api/* (dietro Cloudflare Access) e
// /cms/* (token di sessione). Un'unica fonte di verità: leggere/scrivere le
// content collection nel repo GitHub. Gli errori portano `.status` per la risposta.

import { getFile, putFile, deleteFile, listDir, fromBase64, toBase64, rawUrl } from './github.js';
import { buildMarkdown, parseMarkdown, slugify } from './md.js';
import { COLLECTIONS, MEDIA_DIR } from './collections.js';

// Ordine dei campi nel frontmatter (coerente con src/content.config.ts).
const ORDER = {
  news: ['title', 'date', 'cover', 'excerpt', 'tags', 'draft'],
  produzioni: ['title', 'status', 'cover', 'youtube', 'video', 'releaseLabel', 'description', 'order', 'draft'],
};

function bad(message, status = 400) {
  return Object.assign(new Error(message), { status });
}

export async function listEntries(env, type) {
  const col = COLLECTIONS[type];
  if (!col) throw bad('Tipo non valido');
  const files = (await listDir(env, col.dir)).filter((f) => f.name.endsWith('.md'));
  const items = [];
  for (const f of files) {
    const file = await getFile(env, `${col.dir}/${f.name}`);
    const { data } = parseMarkdown(fromBase64(file.content));
    items.push({ slug: f.name.replace(/\.md$/, ''), coverUrl: rawUrl(env, data.cover), ...data });
  }
  items.sort((a, b) =>
    type === 'news'
      ? String(b.date || '').localeCompare(String(a.date || ''))
      : (a.order ?? 0) - (b.order ?? 0),
  );
  return items;
}

export async function getEntry(env, type, slug) {
  const col = COLLECTIONS[type];
  if (!col || !slug) throw bad('Parametri non validi');
  const file = await getFile(env, `${col.dir}/${slug}.md`);
  if (!file) throw bad('Non trovato', 404);
  const { data, body } = parseMarkdown(fromBase64(file.content));
  return { data, body, sha: file.sha, coverUrl: rawUrl(env, data.cover) };
}

export async function saveEntry(env, email, payload) {
  const { type, data = {}, body = '' } = payload;
  let { slug } = payload;
  const col = COLLECTIONS[type];
  if (!col) throw bad('Tipo non valido');
  if (!data.title) throw bad('Il titolo è obbligatorio');

  if (!slug) slug = slugify(data.title);
  if (!slug) throw bad('Slug non valido');
  const path = `${col.dir}/${slug}.md`;

  // coercizioni di sicurezza
  if ('order' in data) data.order = Number(data.order) || 0;
  if ('draft' in data) data.draft = Boolean(data.draft);
  if ('tags' in data && !Array.isArray(data.tags)) {
    data.tags = String(data.tags).split(',').map((s) => s.trim()).filter(Boolean);
  }

  const ordered = {};
  for (const k of ORDER[type]) if (data[k] !== undefined) ordered[k] = data[k];

  const md = buildMarkdown(ordered, col.hasBody ? body : '');
  const existing = await getFile(env, path);
  const message = `${existing ? 'Aggiorna' : 'Crea'} ${type}: ${slug} (via /admin, ${email})`;
  await putFile(env, path, toBase64(md), message, existing?.sha);
  return { ok: true, slug };
}

export async function deleteEntry(env, email, payload) {
  const { type, slug } = payload;
  const col = COLLECTIONS[type];
  if (!col || !slug) throw bad('Parametri non validi');
  const path = `${col.dir}/${slug}.md`;
  const file = await getFile(env, path);
  if (!file) throw bad('Non trovato', 404);
  await deleteFile(env, path, `Elimina ${type}: ${slug} (via /admin, ${email})`, file.sha);
  return { ok: true };
}

export async function uploadMedia(env, email, payload) {
  const { filename, dataBase64 } = payload;
  if (!filename || !dataBase64) throw bad('File mancante');

  // nome file sicuro: slug del nome + estensione originale
  const dot = filename.lastIndexOf('.');
  const ext = dot > -1 ? filename.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, '') : 'jpg';
  const base = slugify(dot > -1 ? filename.slice(0, dot) : filename) || 'immagine';
  const name = `${base}.${ext}`;
  const path = `${MEDIA_DIR}/${name}`;

  const existing = await getFile(env, path);
  await putFile(env, path, dataBase64, `Carica immagine: ${name} (via /admin, ${email})`, existing?.sha);
  // percorso che Astro risolve con image()
  return { ok: true, path: `/${path}` };
}
