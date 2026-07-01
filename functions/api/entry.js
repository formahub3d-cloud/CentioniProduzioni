import { requireUser, json, errStatus } from '../_lib/access.js';
import { getEntry } from '../_lib/handlers.js';

export async function onRequestGet({ request, env }) {
  try {
    await requireUser(request, env);
    const url = new URL(request.url);
    return json(await getEntry(env, url.searchParams.get('type'), url.searchParams.get('slug')));
  } catch (e) {
    return json({ error: e.message }, errStatus(e));
  }
}
