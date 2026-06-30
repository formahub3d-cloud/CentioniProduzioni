import { requireUser, json } from '../_lib/access.js';
import { getFile, putFile } from '../_lib/github.js';
import { slugify } from '../_lib/md.js';
import { MEDIA_DIR } from '../_lib/collections.js';

export async function onRequestPost({ request, env }) {
  try {
    const email = await requireUser(request, env);
    const { filename, dataBase64 } = await request.json();
    if (!filename || !dataBase64) return json({ error: 'File mancante' }, 400);

    // nome file sicuro: slug del nome + estensione originale
    const dot = filename.lastIndexOf('.');
    const ext = dot > -1 ? filename.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, '') : 'jpg';
    const base = slugify(dot > -1 ? filename.slice(0, dot) : filename) || 'immagine';
    let name = `${base}.${ext}`;
    const path = `${MEDIA_DIR}/${name}`;

    // se esiste già, serve lo sha per sovrascrivere
    const existing = await getFile(env, path);
    await putFile(
      env,
      path,
      dataBase64,
      `Carica immagine: ${name} (via /admin, ${email})`,
      existing?.sha,
    );

    // percorso che Astro risolve con image()
    return json({ ok: true, path: `/${path}` });
  } catch (e) {
    return json({ error: e.message }, /autentic|Token|Audience|Firma/.test(e.message) ? 401 : 500);
  }
}
