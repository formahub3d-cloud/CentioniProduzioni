// Verifica il JWT di Cloudflare Access (header Cf-Access-Jwt-Assertion).
// Solo le richieste autenticate via Google (Cloudflare Access) passano.

let cachedKeys = null;
let cachedAt = 0;

function b64urlToBytes(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = s.length % 4;
  if (pad) s += '='.repeat(4 - pad);
  const bin = atob(s);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

function decodeJson(part) {
  return JSON.parse(new TextDecoder().decode(b64urlToBytes(part)));
}

async function getKeys(teamDomain) {
  if (cachedKeys && Date.now() - cachedAt < 3600_000) return cachedKeys;
  const res = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`);
  if (!res.ok) throw new Error('Access certs fetch failed');
  const json = await res.json();
  cachedKeys = json.keys || [];
  cachedAt = Date.now();
  return cachedKeys;
}

/** Ritorna l'email dell'utente autenticato, o lancia un errore. */
export async function requireUser(request, env) {
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) throw new Error('Non autenticato (manca il token Access)');

  const [h, p, s] = token.split('.');
  if (!h || !p || !s) throw new Error('Token malformato');
  const header = decodeJson(h);
  const payload = decodeJson(p);

  const aud = env.CF_ACCESS_AUD;
  const auds = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!aud || !auds.includes(aud)) throw new Error('Audience non valida');
  if (!payload.exp || Date.now() / 1000 > payload.exp) throw new Error('Token scaduto');

  const keys = await getKeys(env.CF_ACCESS_TEAM_DOMAIN);
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) throw new Error('Chiave di firma non trovata');

  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  const ok = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    b64urlToBytes(s),
    new TextEncoder().encode(`${h}.${p}`),
  );
  if (!ok) throw new Error('Firma non valida');

  return payload.email || 'editor';
}

/** Risposta JSON helper. */
export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
