import { requireUser, json, errStatus } from '../_lib/access.js';
import { listEntries } from '../_lib/handlers.js';

export async function onRequestGet({ request, env }) {
  try {
    await requireUser(request, env);
    const type = new URL(request.url).searchParams.get('type');
    return json({ items: await listEntries(env, type) });
  } catch (e) {
    return json({ error: e.message }, errStatus(e));
  }
}
