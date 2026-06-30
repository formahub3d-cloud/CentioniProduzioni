import { requireUser, json } from '../_lib/access.js';

export async function onRequestGet({ request, env }) {
  try {
    const email = await requireUser(request, env);
    return json({ email });
  } catch (e) {
    return json({ error: e.message }, 401);
  }
}
