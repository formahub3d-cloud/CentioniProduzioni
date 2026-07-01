// Endpoint CMS protetti dal token di sessione (NON da Cloudflare Access).
// La SPA /admin li usa quando è configurato SESSION_SECRET, così le scritture
// non dipendono dal cookie di Access. Stessa logica di /api/*, altra barriera.

import { json, errStatus } from '../_lib/access.js';
import { requireToken } from '../_lib/session.js';
import { listEntries, getEntry, saveEntry, deleteEntry, uploadMedia } from '../_lib/handlers.js';

export async function onRequest({ request, env, params }) {
  const route = Array.isArray(params.route) ? params.route.join('/') : params.route || '';
  const method = request.method;
  try {
    const email = await requireToken(request, env);
    const url = new URL(request.url);

    if (method === 'GET' && route === 'me') return json({ email });
    if (method === 'GET' && route === 'list')
      return json({ items: await listEntries(env, url.searchParams.get('type')) });
    if (method === 'GET' && route === 'entry')
      return json(await getEntry(env, url.searchParams.get('type'), url.searchParams.get('slug')));
    if (method === 'POST' && route === 'save')
      return json(await saveEntry(env, email, await request.json()));
    if (method === 'POST' && route === 'delete')
      return json(await deleteEntry(env, email, await request.json()));
    if (method === 'POST' && route === 'upload')
      return json(await uploadMedia(env, email, await request.json()));

    return json({ error: 'Endpoint non trovato' }, 404);
  } catch (e) {
    return json({ error: e.message }, errStatus(e));
  }
}
