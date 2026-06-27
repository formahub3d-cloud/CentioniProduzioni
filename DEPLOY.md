# Deploy & dominio — guida passo-passo

Guida per pubblicare il sito su **Cloudflare Pages** e collegare il dominio
**Register.it**. I passi contrassegnati con 🧑 li fai **tu** sui tuoi account
(io non tocco credenziali, DNS o OAuth).

Repo GitHub: già creato (`formahub3d-cloud/centioniproduzioni`).

---

## 1) Deploy su Cloudflare Pages 🧑

1. Vai su **dash.cloudflare.com** → *Workers & Pages* → **Create** → **Pages**
   → **Connect to Git**.
2. Autorizza GitHub e seleziona il repository del sito.
3. Imposta i **Build settings**:
   - **Framework preset:** `Astro`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Environment variables:** aggiungi `NODE_VERSION` = `22`
4. **Save and Deploy.** Al termine avrai un URL tipo
   `https://centioniproduzioni.pages.dev`. Verifica che il sito sia online.

> Ogni `git push` sul branch di produzione rifà il deploy in automatico.

---

## 2) Collega il dominio Register.it 🧑

Il modo più robusto (apex + www, HTTPS automatico) è usare **Cloudflare anche
come DNS**. Servono due fasi.

### 2A — Aggiungi il dominio a Cloudflare

1. Cloudflare Dashboard → **Add a site** → inserisci `centioniproduzioni.it` →
   piano **Free**.
2. Cloudflare scansiona i DNS esistenti e ti mostra **due nameserver** del tipo:
   ```
   xxxx.ns.cloudflare.com
   yyyy.ns.cloudflare.com
   ```
   Annotali.

### 2B — Cambia i nameserver su Register.it

1. Pannello **Register.it** → dominio `centioniproduzioni.it` → **Gestione DNS /
   Nameserver**.
2. Scegli **nameserver personalizzati** e inserisci i due nameserver Cloudflare
   del punto 2A (rimuovendo quelli di Register.it).
3. Salva. La propagazione richiede da pochi minuti a qualche ora. Cloudflare ti
   manda un'email quando il dominio è **Active**.

### 2C — Collega il dominio alle Pages

1. Cloudflare → *Workers & Pages* → il tuo progetto → **Custom domains** →
   **Set up a custom domain** → `centioniproduzioni.it` → **Activate**.
2. Ripeti per **`www.centioniproduzioni.it`** (consigliato un redirect a apex).
3. Cloudflare crea da solo i record necessari e il **certificato HTTPS**.

✅ Fatto: il sito risponde su `https://centioniproduzioni.it`.

> **Alternativa senza cambiare nameserver** (se vuoi tenere i DNS su Register.it):
> per l'apex serve un record che non tutti i registrar gestiscono bene (CNAME
> flattening). È meno affidabile: consiglio il metodo Cloudflare qui sopra.

### Record DNS — riepilogo
Usando i nameserver Cloudflare, i record per le Pages vengono creati
**automaticamente**. Non devi inserirli a mano. Se in futuro aggiungi email o
altri servizi, i relativi record (MX, TXT…) vanno ricreati nel DNS di Cloudflare
(copiali da Register.it **prima** di cambiare i nameserver, per non perderli).

---

## 3) Aggiorna i valori del sito 🧑 (poi committa)

In `src/data/site.ts`:
- `SITE.url` → `https://centioniproduzioni.it` (già impostato; conferma il dominio).
- `SITE.email` → la mail reale dei contatti.
- `SOCIAL` → gli URL reali di YouTube / Instagram / TikTok (ora sono `#`).

Contenuti:
- ID YouTube reali nei file in `src/content/produzioni/` (campo `youtube`).
- Immagini reali in `src/assets/media/` (ora sono placeholder).
- Testi News / Chi Siamo definitivi.

---

## 4) Form contatti — Web3Forms 🧑

Il form invia le email tramite **Web3Forms** (gratis, nessun backend):

1. Vai su **web3forms.com**, inserisci la mail su cui vuoi ricevere i messaggi
   e ottieni la **Access Key**.
2. Incolla la chiave in `src/data/site.ts` → `CONTACT.accessKey`.
3. Commit + push. Il form è subito funzionante.

> In alternativa posso integrare Formspree o una Cloudflare Function: dimmelo.

---

## 5) Autenticazione del CMS — Sveltia + GitHub 🧑

Per usare `/admin` e salvare i contenuti, Sveltia deve autenticarti su GitHub.
Si usa un piccolo **Cloudflare Worker** ufficiale (`sveltia-cms-auth`) che gestisce
l'OAuth. Prerequisito: il sito deve essere già online (punto 1) e conoscere il
suo dominio (es. `centioniproduzioni.it` o `*.pages.dev`).

### 5A — Crea la OAuth App su GitHub
1. GitHub → **Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App**.
2. Compila:
   - **Application name:** `Centioni Produzioni CMS`
   - **Homepage URL:** `https://centioniproduzioni.it`
   - **Authorization callback URL:** `https://centioni-cms-auth.<tuo-subdominio>.workers.dev/callback`
     *(il dominio del Worker lo ottieni al passo 5B; puoi tornare qui a sistemarlo)*
3. **Register application** → annota **Client ID** e genera un **Client Secret**.

### 5B — Deploya il Worker `sveltia-cms-auth`
Modo più rapido (dal repo ufficiale):
1. Vai su **github.com/sveltia/sveltia-cms-auth** → pulsante **Deploy to Cloudflare**.
2. Cloudflare crea il Worker (chiamalo es. `centioni-cms-auth`). Annota il suo URL
   `https://centioni-cms-auth.<tuo-subdominio>.workers.dev`.
3. Worker → **Settings → Variables** → aggiungi (come *Secret*):
   - `GITHUB_CLIENT_ID` = il Client ID del passo 5A
   - `GITHUB_CLIENT_SECRET` = il Client Secret del passo 5A
   - `ALLOWED_DOMAINS` = `centioniproduzioni.it,*.pages.dev`
4. Torna alla OAuth App (5A) e verifica che la **callback URL** punti a
   `https://centioni-cms-auth.<tuo-subdominio>.workers.dev/callback`.

### 5C — Collega il Worker al CMS
In `public/admin/config.yml`, sotto `backend:`, **decommenta e compila**:
```yaml
backend:
  name: github
  repo: formahub3d-cloud/centioniproduzioni
  branch: main            # il branch di produzione
  base_url: https://centioni-cms-auth.<tuo-subdominio>.workers.dev
```
Commit + push. Ora `https://centioniproduzioni.it/admin` ti farà fare login con
GitHub e potrai pubblicare News e Produzioni.

> **Valori che mi servono da te** (se vuoi che aggiorni io il `config.yml`):
> solo l'**URL del Worker**. Client ID/Secret restano sui tuoi account — non
> servono nel repo.

---

## Checklist rapida

- [ ] Pages collegate al repo, build OK (`*.pages.dev`)
- [ ] Dominio su Cloudflare, nameserver cambiati su Register.it, stato *Active*
- [ ] Custom domain apex + www attivi con HTTPS
- [ ] `SITE.url`, `SITE.email`, `SOCIAL` aggiornati
- [ ] Access key Web3Forms inserita → form testato end-to-end
- [ ] OAuth App GitHub creata (Client ID + Secret)
- [ ] Worker `sveltia-cms-auth` deployato con `GITHUB_CLIENT_ID`/`SECRET`/`ALLOWED_DOMAINS`
- [ ] `base_url` inserito in `public/admin/config.yml` → login su `/admin` OK
- [ ] Immagini, ID YouTube e testi reali inseriti
