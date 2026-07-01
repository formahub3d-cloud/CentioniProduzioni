import { requireUser, json } from '../_lib/access.js';
import { listDir, getFile, fromBase64, rawUrl } from '../_lib/github.js';
import { parseMarkdown } from '../_lib/md.js';
import { COLLECTIONS } from '../_lib/collections.js';

export async function onRequestGet({ request, env }) {
  try {
    await requireUser(request, env);
    const type = new URL(request.url).searchParams.get('type');
    const col = COLLECTIONS[type];
    if (!col) return json({ error: 'Tipo non valido' }, 400);

    const files = (await listDir(env, col.dir)).filter((f) => f.name.endsWith('.md'));
    const items = [];
    for (const f of files) {
      const file = await getFile(env, `${col.dir}/${f.name}`);
      const { data } = parseMarkdown(fromBase64(file.content));
      items.push({
        slug: f.name.replace(/\.md$/, ''),
        coverUrl: rawUrl(env, data.cover),
        ...data,
      });
    }
    // ordina: news per data desc, produzioni per order asc
    items.sort((a, b) =>
      type === 'news'
        ? String(b.date || '').localeCompare(String(a.date || ''))
        : (a.order ?? 0) - (b.order ?? 0),
    );
    return json({ items });
  } catch (e) {
    return json({ error: e.message }, /autentic|Token|Audience|Firma/.test(e.message) ? 401 : 500);
  }
}
