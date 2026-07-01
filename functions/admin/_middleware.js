// Middleware su /admin: la pagina è protetta da Cloudflare Access, quindi qui
// arriva il JWT dell'utente (Cf-Access-Jwt-Assertion) su una navigazione
// top-level affidabile. Verifichiamo l'identità ed iniettiamo nell'HTML un
// token di sessione firmato: la SPA lo userà per parlare con /cms/* senza
// dipendere dal cookie di Access. Inerte finché SESSION_SECRET non è impostato.

import { requireUser } from '../_lib/access.js';
import { mintToken } from '../_lib/session.js';

export async function onRequest(context) {
  const { request, env, next } = context;
  const res = await next(); // serve la pagina statica /admin

  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('text/html') || !env.SESSION_SECRET) return res;

  let token = '';
  try {
    const email = await requireUser(request, env);
    token = (await mintToken(env, email)) || '';
  } catch {
    return res; // niente identità Access → la SPA usa il flusso /api classico
  }
  if (!token) return res;

  return new HTMLRewriter()
    .on('head', {
      element(el) {
        el.append(`<meta name="cms-token" content="${token}">`, { html: true });
      },
    })
    .transform(res);
}
