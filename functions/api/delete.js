import { requireUser, json, errStatus } from '../_lib/access.js';
import { deleteEntry } from '../_lib/handlers.js';

export async function onRequestPost({ request, env }) {
  try {
    const email = await requireUser(request, env);
    return json(await deleteEntry(env, email, await request.json()));
  } catch (e) {
    return json({ error: e.message }, errStatus(e));
  }
}
