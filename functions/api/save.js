import { requireUser, json } from '../_lib/access.js';
import { getFile, putFile, toBase64 } from '../_lib/github.js';
import { buildMarkdown, slugify } from '../_lib/md.js';
import { COLLECTIONS } from '../_lib/collections.js';

// Ordine dei campi nel frontmatter (coerente con gli schemi).
const ORDER = {
  news: ['title', 'date', 'cover', 'excerpt', 'tags', 'draft'],
  produzioni: ['title', 'status', 'cover', 'youtube', 'video', 'releaseLabel', 'description', 'order', 'draft'],
};

export async function onRequestPost({ request, env }) {
  try {
    const email = await requireUser(request, env);
    const payload = await request.json();
    const { type, data = {}, body = '' } = payload;
    let { slug } = payload;
    const col = COLLECTIONS[type];
    if (!col) return json({ error: 'Tipo non valido' }, 400);
    if (!data.title) return json({ error: 'Il titolo è obbligatorio' }, 400);

    if (!slug) slug = slugify(data.title);
    if (!slug) return json({ error: 'Slug non valido' }, 400);
    const path = `${col.dir}/${slug}.md`;

    // coercizioni di sicurezza
    if ('order' in data) data.order = Number(data.order) || 0;
    if ('draft' in data) data.draft = Boolean(data.draft);
    if ('tags' in data && !Array.isArray(data.tags)) {
      data.tags = String(data.tags)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // ordina i campi
    const ordered = {};
    for (const k of ORDER[type]) if (data[k] !== undefined) ordered[k] = data[k];

    const md = buildMarkdown(ordered, col.hasBody ? body : '');

    const existing = await getFile(env, path);
    const message = `${existing ? 'Aggiorna' : 'Crea'} ${type}: ${slug} (via /admin, ${email})`;
    await putFile(env, path, toBase64(md), message, existing?.sha);

    return json({ ok: true, slug });
  } catch (e) {
    return json({ error: e.message }, /autentic|Token|Audience|Firma/.test(e.message) ? 401 : 500);
  }
}
