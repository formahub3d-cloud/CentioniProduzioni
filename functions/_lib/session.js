// Token di sessione "first-party" per il CMS.
//
// Problema risolto: le chiamate XHR a /api/* dipendono dal cookie di
// Cloudflare Access (CF_Authorization), che alcuni browser (blocco cookie di
// terze parti) non memorizzano in modo stabile → il salvataggio falliva.
//
// Soluzione: la pagina /admin (già autenticata da Access, navigazione top-level
// affidabile) riceve un token firmato HMAC-SHA256 con SESSION_SECRET. La SPA lo
// invia negli header verso /cms/* (endpoint NON dietro Access), che verificano
// il token. Nessuna dipendenza da cookie: funziona su qualsiasi browser.

const enc = new TextEncoder();

function b64url(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlToBytes(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = s.length % 4;
  if (pad) s += '='.repeat(4 - pad);
  const bin = atob(s);
  const a = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
  return a;
}

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

/** Emette un token `payload.sig` valido per `ttlSec` secondi. Null se non configurato. */
export async function mintToken(env, email, ttlSec = 12 * 3600) {
  if (!env.SESSION_SECRET) return null;
  const payload = { email, exp: Math.floor(Date.now() / 1000) + ttlSec };
  const p = b64url(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(env.SESSION_SECRET), enc.encode(p));
  return `${p}.${b64url(new Uint8Array(sig))}`;
}

/** Verifica il token (header Authorization: Bearer … o X-CMS-Token) → email, o lancia. */
export async function requireToken(request, env) {
  if (!env.SESSION_SECRET) throw new Error('Sessione non configurata (manca SESSION_SECRET)');
  const auth = request.headers.get('Authorization') || '';
  const raw = auth.startsWith('Bearer ') ? auth.slice(7).trim() : request.headers.get('X-CMS-Token');
  if (!raw) throw new Error('Non autenticato (manca il token di sessione)');

  const [p, sig] = raw.split('.');
  if (!p || !sig) throw new Error('Token malformato');

  const ok = await crypto.subtle.verify(
    'HMAC',
    await hmacKey(env.SESSION_SECRET),
    b64urlToBytes(sig),
    enc.encode(p),
  );
  if (!ok) throw new Error('Firma della sessione non valida');

  let payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(p)));
  } catch {
    throw new Error('Token illeggibile');
  }
  if (!payload.exp || Date.now() / 1000 > payload.exp) {
    throw new Error('Sessione scaduta: ricarica /admin');
  }
  return payload.email || 'editor';
}
