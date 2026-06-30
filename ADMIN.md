# Pannello redazione `/admin` — configurazione

Pannello su misura per pubblicare **Articoli** (News) e **Produzioni** (video).
Login con **Google** tramite **Cloudflare Access**; al salvataggio i contenuti
vengono scritti nel repo (markdown) e il sito si ri-pubblica da solo.

- Editor: `src/pages/admin/index.astro` (statico, niente segreti)
- API: `functions/api/*` (Cloudflare Pages Functions) — committano su GitHub
- Auth: Cloudflare Access (Google) davanti a `/admin` **e** `/api`

Servono 3 cose, tutte sui **tuoi account** (io non tocco segreti).

---

## 1) Token GitHub (per scrivere i contenuti)

1. GitHub → **Settings → Developer settings → Fine-grained tokens → Generate**
2. **Repository access:** solo `formahub3d-cloud/centioniproduzioni`
3. **Permissions → Repository → Contents: Read and write**
4. Genera e copia il token (inizia con `github_pat_…`)

> In alternativa un classic token con scope `repo`. Il token sta **solo** nelle
> variabili di Cloudflare (mai nel repo).

---

## 2) Variabili d'ambiente su Cloudflare Pages

Pages → progetto **centioniproduzioni** → **Settings → Environment variables**
→ Production, aggiungi:

| Nome | Valore | Tipo |
|---|---|---|
| `GITHUB_TOKEN` | il token del punto 1 | **Secret** (Encrypt) |
| `CF_ACCESS_TEAM_DOMAIN` | `formahub3d.cloudflareaccess.com` | Plain |
| `CF_ACCESS_AUD` | l'**Application Audience (AUD)** dell'app Access (punto 3) | Plain |

*(Opzionali, hanno già un default: `GITHUB_REPO=formahub3d-cloud/centioniproduzioni`, `GITHUB_BRANCH=main`.)*

Dopo aver aggiunto le variabili, **rifai un deploy** (un push o "Retry deployment")
così le Functions le vedono.

---

## 3) Cloudflare Access con Google

### 3A — Aggiungi Google come Identity Provider
Cloudflare **Zero Trust** → **Settings → Authentication → Login methods → Add new
→ Google**. Segui la procedura (serve un OAuth client di Google Cloud: Cloudflare
mostra i passi e l'URL di callback da incollare in Google Cloud Console).
*(In alternativa, "One-time PIN" via email funziona subito senza Google.)*

### 3B — Crea l'applicazione Access
Zero Trust → **Access → Applications → Add an application → Self-hosted**:
- **Application name:** Redazione Centioni
- **Session duration:** a piacere (es. 24h)
- **Application domain:** aggiungi **due** path sullo stesso dominio:
  - `centioniproduzioni.it` path `admin`
  - `centioniproduzioni.it` path `api`
  *(così sia il pannello che le API sono protette)*
- **Identity providers:** Google (e/o One-time PIN)
- **Policies → Add a policy:** Action **Allow**, regola **Emails** → inserisci gli
  indirizzi autorizzati (es. quello di Niccolò e il tuo)
- Salva. Apri l'app appena creata → **Overview → Application Audience (AUD)**:
  copia quel valore in `CF_ACCESS_AUD` (punto 2).

> ⚠️ Sicurezza: proteggi **sia `/admin` sia `/api`**. Le Functions verificano
> comunque il JWT di Access, ma la copertura dei path è la prima barriera.
> Consiglio: in Access aggiungi anche il dominio `*.pages.dev` (o disabilita
> l'accesso alle preview) così nessuno raggiunge `/api` aggirando il dominio.

---

## Uso
`https://centioniproduzioni.it/admin` → login Google → schede **Articoli** /
**Produzioni** → crea/modifica, carica una copertina, **Salva**. Dopo 1–2 minuti
(rebuild automatico) il contenuto è online. I "Bozza" non vengono pubblicati.

## Come funziona (in breve)
- Il pannello chiama `/api/*`; Cloudflare Access inietta il JWT dell'utente.
- Le Functions verificano il JWT e usano `GITHUB_TOKEN` per scrivere il file
  markdown (e le immagini in `src/assets/media/`) sul branch `main`.
- Il push fa partire la build → deploy. Contenuti sempre in git, nessun lock-in.
