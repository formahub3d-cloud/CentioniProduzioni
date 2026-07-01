import { requireUser, json } from '../_lib/access.js';
import { getFile, deleteFile } from '../_lib/github.js';
import { COLLECTIONS } from '../_lib/collections.js';

export async function onRequestPost({ request, env }) {
  try {
    const email = await requireUser(request, env);
    const { type, slug } = await request.json();
    const col = COLLECTIONS[type];
    if (!col || !slug) return json({ error: 'Parametri non validi' }, 400);

    const path = `${col.dir}/${slug}.md`;
    const file = await getFile(env, path);
    if (!file) return json({ error: 'Non trovato' }, 404);
    await deleteFile(env, path, `Elimina ${type}: ${slug} (via /admin, ${email})`, file.sha);
    return json({ ok: true });
  } catch (e) {
    return json({ error: e.message }, /autentic|Token|Audience|Firma/.test(e.message) ? 401 : 500);
  }
}
