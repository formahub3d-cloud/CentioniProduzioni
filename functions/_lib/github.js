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
  if (!r.ok) throw new Error(`GitHub list ${r.status}`);
  return r.json();
}

export async function getFile(env, path) {
  const { repo, branch } = cfg(env);
  const r = await gh(env, `/repos/${repo}/contents/${path}?ref=${branch}`);
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`GitHub get ${r.status}`);
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
  if (!r.ok) throw new Error(`GitHub put ${r.status}: ${await r.text()}`);
  return r.json();
}

export async function deleteFile(env, path, message, sha) {
  const { repo, branch } = cfg(env);
  const r = await gh(env, `/repos/${repo}/contents/${path}`, {
    method: 'DELETE',
    body: JSON.stringify({ message, branch, sha }),
  });
  if (!r.ok) throw new Error(`GitHub delete ${r.status}`);
  return r.json();
}
