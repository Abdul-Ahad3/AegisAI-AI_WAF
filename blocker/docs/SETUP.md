# AegisAI — Detailed Setup Guide

This walks through every step in detail, including troubleshooting.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | ≥ 18 | `node -v` to verify |
| npm | ≥ 9 | comes with Node |
| Google Chrome | latest | required for MV3 |
| Supabase account | free tier OK | <https://supabase.com> |
| HuggingFace account | free tier OK | <https://huggingface.co> |

---

## Step 1 — Set up the database (Supabase)

1. Go to <https://supabase.com> → **New project**.
2. Pick a name (e.g. `aegisai`), set a strong DB password, choose a region.
3. Wait ~1 minute for it to provision.
4. Open **SQL Editor → New query**, paste the entire contents of `database/schema.sql`, click **Run**.
5. Verify the tables exist: **Table Editor** → you should see `blocklist` and `url_logs`.
6. Get your credentials: **Project Settings → API**:
   - `Project URL` (e.g. `https://abcde.supabase.co`)
   - `service_role` key (under "Project API keys")
   - **Important:** the `service_role` key bypasses Row Level Security, so it must NEVER be shipped to a browser. We only put it in the backend `.env`.

---

## Step 2 — Get a HuggingFace token

1. Sign up / log in at <https://huggingface.co>.
2. Top-right avatar → **Settings → Access Tokens**.
3. Click **New token**, give it a name like `aegisai`, role **Read**, create.
4. Copy the token (`hf_xxx…`).

> The model `imanoop7/bert-phishing-detector` is hosted on HuggingFace's public Inference API. The first request may return HTTP 503 ("model is loading") for ~20 seconds; retry once. The backend reports this as a "warn" verdict so the user is not hard-blocked.

---

## Step 3 — Configure & run the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
HF_API_TOKEN=hf_xxx
HF_MODEL=imanoop7/bert-phishing-detector
PHISHING_THRESHOLD=0.7
ALLOWED_ORIGINS=*
```

Install + run:

```bash
npm install
npm run dev
```

You should see:
```
✅ AegisAI backend running on http://localhost:5000
```

Quick sanity check:
```bash
curl http://localhost:5000/health
# {"ok":true,"status":"healthy"}
```

---

## Step 4 — Load the Chrome Extension

1. Open `chrome://extensions`.
2. Toggle **Developer mode** (top right).
3. Click **Load unpacked**.
4. Select the `extension/` folder.
5. The 🛡️ AegisAI tile should appear; pin it to the toolbar for easy access.

> After editing any extension file, return to `chrome://extensions` and click the **reload** ⟳ icon on the AegisAI card.

### Tightening CORS (recommended)

Once the extension is loaded, copy its **ID** from `chrome://extensions` (a long string like `abcdef…`). Then in `backend/.env`:

```
ALLOWED_ORIGINS=chrome-extension://abcdef...
```

Restart the backend.

---

## Step 5 — First run

1. Click the AegisAI icon → popup opens, current tab status appears.
2. Try **"Block a Domain"**: type `example-malware.test` → Add. It now appears in the blocklist.
3. Visit `http://example-malware.test` → you're redirected to the AegisAI **⛔ Blocked** page.
4. Visit any normal site (e.g. `https://wikipedia.org`) → green ✅ toast in the corner.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Backend logs `Missing SUPABASE_URL …` | `.env` not read | Make sure `.env` lives inside `backend/`, not root |
| Backend returns 500 with `JWT…` | Wrong Supabase key | Use the **service_role** key, not the anon key |
| Every URL comes back `warn` | HF token bad / model cold | Wait ~30s and retry; double-check `HF_API_TOKEN` |
| Extension toast never appears | Backend not running, or CORS blocked | Check service-worker DevTools log; test `curl /health`; widen `ALLOWED_ORIGINS=*` for dev |
| Redirect loop on blocked page | You blocked `localhost` or extension origin | Remove that domain from `blocklist` table in Supabase |
| `chrome.notifications` errors | `notifications` permission missing | Already in manifest – reload the extension |

---

## Going to production

- Host the backend (Render / Railway / Fly.io / your own VPS) and set the deployed URL in `extension/scripts/config.js` → `API_BASE`.
- Set `NODE_ENV=production` and a strict `ALLOWED_ORIGINS` (your extension ID).
- Enable Supabase Row Level Security and sign requests with a real user JWT instead of the service_role key.
- Submit the extension to the Chrome Web Store (signed manifest, screenshots, privacy policy required).
