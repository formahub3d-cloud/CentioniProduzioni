// Helper per leggere/scrivere file nel repo tramite la GitHub Contents API.

function cfg(env) {
  return {
    repo: env.GITHUB_REPO || 'formahub3d-cloud/centioniproduzioni',
    branch: env.GITHUB_BRANCH || 'main',
    token: env.GITHUB_TOKEN,
  };
}

function gh(env, path, init = {}) {
  const { token } = cfg(env);
  return fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'centioni-cms',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.headers || {}),
    },
  });
}

/**
 * Traduce un errore della GitHub API in un messaggio comprensibile per la
 * redazione: chi scrive gli articoli non deve interpretare codici HTTP, ma
 * capire se può riprovare o se serve l'intervento dell'amministratore.
 */
function ghFail(op, status) {
  let message;
  if (status === 401)
    message =
      `Il collegamento a GitHub non è più valido (credenziale scaduta o revocata): ` +
      `il pannello non può leggere né salvare i contenuti. Contatta l'amministratore del sito.`;
  else if (status === 403)
    message =
      `GitHub ha negato l'accesso: la credenziale del CMS non ha i permessi necessari ` +
      `sul repository. Contatta l'amministratore del sito.`;
  else if (status === 409)
    message = `Il contenuto è stato modificato nel frattempo: ricarica la pagina e riprova.`;
  else if (status >= 500)
    message = `GitHub non risponde in questo momento. Riprova tra qualche minuto.`;
  else
    message =
      `Errore di comunicazione con GitHub (${status}) durante ${op}. ` +
      `Se il problema persiste, contatta l'amministratore del sito.`;

  // 401/403 arrivano da GitHub, non dalla sessione di chi sta scrivendo:
  // rispondiamo 502 per non far credere al pannello che il login sia scaduto.
  const httpStatus = status === 401 || status === 403 || status >= 500 ? 502 : status;
  return Object.assign(new Error(message), { status: httpStatus, ghStatus: status, op });
}

/** URL raw (pubblico) di un file del repo, per l'anteprima nel pannello. */
export function rawUrl(env, filePath) {
  if (!filePath) return null;
  const { repo, branch } = cfg(env);
  return `https://raw.githubusercontent.com/${repo}/${branch}/${String(filePath).replace(/^\//, '')}`;
}

export function toBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export function fromBase64(b64) {
  const bin = atob((b64 || '').replace(/\n/g, ''));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export async function listDir(env, dir) {
  const { repo, branch } = cfg(env);
  const r = await gh(env, `/repos/${repo}/contents/${dir}?ref=${branch}`);
  if (r.status === 404) return [];
  if (!r.ok) throw ghFail(`la lettura dell'elenco`, r.status);
  return r.json();
}

export async function getFile(env, path) {
  const { repo, branch } = cfg(env);
  const r = await gh(env, `/repos/${repo}/contents/${path}?ref=${branch}`);
  if (r.status === 404) return null;
  if (!r.ok) throw ghFail(`la lettura del file`, r.status);
  return r.json(); // { content, sha, ... }
}

export async function putFile(env, path, contentBase64, message, sha) {
  const { repo, branch } = cfg(env);
  const body = { message, content: contentBase64, branch };
  if (sha) body.sha = sha;
  const r = await gh(env, `/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    // dettaglio tecnico solo nei log di Cloudflare, non nel pannello
    console.error('GitHub put', r.status, await r.text());
    throw ghFail(`il salvataggio`, r.status);
  }
  return r.json();
}

export async function deleteFile(env, path, message, sha) {
  const { repo, branch } = cfg(env);
  const r = await gh(env, `/repos/${repo}/contents/${path}`, {
    method: 'DELETE',
    body: JSON.stringify({ message, branch, sha }),
  });
  if (!r.ok) throw ghFail(`l'eliminazione`, r.status);
  return r.json();
}
