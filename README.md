# 🛡️ AegisAI – Smart Web Security System

AegisAI is a **Chrome Extension + Node.js Backend + Supabase + HuggingFace AI** system that protects users from phishing and malicious websites in real time, while letting them maintain a personal blocklist.

> Final Year Project – production-style architecture, no API keys exposed to the browser, fail-safe by design.

---

## 📐 System Architecture

```
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│  Chrome Extension    │ →   │  Node.js + Express   │ →   │  Supabase (Postgres) │     │  HuggingFace API     │
│  (Manifest V3)       │     │  Backend API         │     │  blocklist + logs    │     │  bert-phishing-      │
│                      │ ←   │                      │ ←   │                      │     │  detector            │
└──────────────────────┘     └──────────┬───────────┘     └──────────────────────┘     └──────────▲───────────┘
                                        │                                                          │
                                        └──────────────────────────────────────────────────────────┘
```

**Decision flow for every URL the user visits:**

1. Extension's service worker intercepts navigation.
2. Sends URL to backend `POST /api/check-url`.
3. Backend checks **blocklist** in Supabase → if matched: `status = "blocked"`.
4. Otherwise calls **HuggingFace** model `imanoop7/bert-phishing-detector`.
5. Backend writes the verdict to `url_logs` and returns it.
6. Extension shows toast (✅ safe / ⚠️ warn) or redirects to a warning page (⛔ blocked / 🚨 phishing).

---

## 📁 Folder Structure

```
aegisai/
├── extension/                    # Chrome extension (Manifest V3)
│   ├── manifest.json
│   ├── icons/                    # 16 / 48 / 128 px PNG icons
│   ├── scripts/
│   │   ├── config.js             # backend URL + cache settings
│   │   ├── background.js         # service worker - intercepts navigation
│   │   └── content.js            # injects toast banner on every page
│   ├── popup/
│   │   ├── popup.html            # popup UI
│   │   └── popup.js
│   └── blocked/
│       ├── blocked.html          # warning page shown when blocked
│       └── blocked.js
│
├── backend/                      # Node.js + Express API
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   └── supabase.js           # initialises Supabase client
│   └── src/
│       ├── server.js             # entry point
│       ├── routes/               # urlRoutes, blocklistRoutes, logRoutes
│       ├── controllers/          # urlController, blocklistController, logController
│       ├── services/             # aiService, blocklistService, logService
│       ├── middleware/           # errorHandler
│       └── utils/                # urlUtils
│
├── database/
│   └── schema.sql                # Supabase tables + indexes
│
└── docs/
    ├── SETUP.md                  # detailed setup
    ├── TESTING.md                # how to test the extension
    └── ARCHITECTURE.md           # deep-dive on the design
```

---

## 🚀 Quick Setup (5 steps)

### 1) Supabase
1. Create a project at <https://supabase.com>.
2. Open **SQL Editor → New query**, paste the contents of `database/schema.sql`, run it.
3. Open **Project Settings → API**, copy:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, never put in extension!)

### 2) HuggingFace
1. Create a free account at <https://huggingface.co>.
2. Go to **Settings → Access Tokens**, create a token with **Read** access.
3. Save it as `HF_API_TOKEN` in the backend `.env`.

### 3) Backend
```bash
cd backend
cp .env.example .env       # then edit .env with your real values
npm install
npm run dev                # starts on http://localhost:5000
```

Test it:
```bash
curl http://localhost:5000/health
curl -X POST http://localhost:5000/api/check-url \
     -H "Content-Type: application/json" \
     -d '{"url":"https://google.com"}'
```

### 4) Chrome Extension
1. Open `chrome://extensions`.
2. Toggle **Developer mode** (top right).
3. Click **Load unpacked**, select the `extension/` folder.
4. The 🛡️ AegisAI icon should appear in the toolbar.

### 5) Try it
- Click the AegisAI icon → popup opens.
- Add `example-malware.test` to your blocklist, then visit `http://example-malware.test` → you'll be redirected to the AegisAI block page.
- Visit any normal site (e.g. `https://wikipedia.org`) → green ✅ Safe toast appears.

---

## 🧪 Testing

### Backend
```bash
# Health
curl http://localhost:5000/health

# Add domain to blocklist
curl -X POST http://localhost:5000/api/blocklist \
     -H "Content-Type: application/json" \
     -d '{"domain":"badsite.test"}'

# List blocklist
curl http://localhost:5000/api/blocklist

# Check a URL
curl -X POST http://localhost:5000/api/check-url \
     -H "Content-Type: application/json" \
     -d '{"url":"http://badsite.test/login"}'

# Recent logs
curl http://localhost:5000/api/logs?limit=20
```

### Extension
1. Go to `chrome://extensions` and click **service worker** under AegisAI to open DevTools for the background script — you'll see logs of every URL check.
2. Visit a normal site → toast says **✅ Safe**.
3. Add a domain to the blocklist via the popup, then visit it → redirected to the **⛔ Blocked** page.
4. Stop the backend (`Ctrl+C`), reload a page → toast says **⚠️ backend unreachable** (fail-safe mode).

---

## 🔐 Security Notes

- **No secrets in the extension.** The HuggingFace token and Supabase service-role key live only in `backend/.env`.
- **URL validation** with the `validator` library on every check.
- **Rate limit** of 120 requests / minute per IP on `/api/*`.
- **Helmet** and **CORS** enabled by default.
- **Fail-safe mode**: if the AI or backend is unreachable, the extension does *not* hard-block; it warns the user.

---

## 📚 Further Reading

- [`docs/SETUP.md`](docs/SETUP.md) – step-by-step including troubleshooting.
- [`docs/TESTING.md`](docs/TESTING.md) – test plan with manual + curl scenarios.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) – design decisions, request lifecycle.

---

## 📝 License

Built for academic use as a Final Year Project. Adapt freely.
