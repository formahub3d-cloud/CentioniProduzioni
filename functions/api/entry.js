import { requireUser, json } from '../_lib/access.js';
import { getFile, fromBase64, rawUrl } from '../_lib/github.js';
import { parseMarkdown } from '../_lib/md.js';
import { COLLECTIONS } from '../_lib/collections.js';

export async function onRequestGet({ request, env }) {
  try {
    await requireUser(request, env);
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const slug = url.searchParams.get('slug');
    const col = COLLECTIONS[type];
    if (!col || !slug) return json({ error: 'Parametri non validi' }, 400);

    const file = await getFile(env, `${col.dir}/${slug}.md`);
    if (!file) return json({ error: 'Non trovato' }, 404);
    const { data, body } = parseMarkdown(fromBase64(file.content));
    return json({ data, body, sha: file.sha, coverUrl: rawUrl(env, data.cover) });
  } catch (e) {
    return json({ error: e.message }, /autentic|Token|Audience|Firma/.test(e.message) ? 401 : 500);
  }
}
