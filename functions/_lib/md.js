// Serializza/parsa il frontmatter in stile "flow" (valori JSON): semplice da
// rileggere e comunque YAML valido, letto correttamente da Astro.

/** Costruisce il file markdown da {fields} + body. Salta i valori vuoti. */
export function buildMarkdown(fields, body = '') {
  const lines = ['---'];
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    lines.push(`${key}: ${JSON.stringify(value)}`);
  }
  lines.push('---');
  const b = (body || '').trim();
  return lines.join('\n') + '\n' + (b ? '\n' + b + '\n' : '');
}

/** Parsa un file markdown → { data, body }. */
export function parseMarkdown(raw) {
  const text = (raw || '').replace(/\r\n/g, '\n');
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: text };
  const data = {};
  for (const line of m[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const rest = line.slice(idx + 1).trim();
    if (!key) continue;
    try {
      data[key] = JSON.parse(rest);
    } catch {
      // fallback: stringa senza apici / valori semplici
      if (rest === 'true') data[key] = true;
      else if (rest === 'false') data[key] = false;
      else if (rest !== '' && !isNaN(Number(rest))) data[key] = Number(rest);
      else data[key] = rest.replace(/^["']|["']$/g, '');
    }
  }
  return { data, body: (m[2] || '').trim() };
}

/** Slug URL-safe (coerente con quello del sito). */
export function slugify(input) {
  return String(input)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
