# AegisAI — Architecture

## Why this layout

A Chrome extension cannot safely call HuggingFace directly: any token shipped to the browser is recoverable by the user and can be abused or rate-limited. So the system is split into four layers, each with one responsibility.

```
Layer 1 - Chrome Extension (browser-side)
  - intercepts user navigation
  - shows UI: popup, blocked page, in-page toast
  - knows ONLY one secret: the backend URL

Layer 2 - Express Backend (server-side, trusted)
  - holds all secrets (Supabase service_role key, HF token)
  - validates input, enforces rate limits
  - orchestrates: blocklist → AI → log

Layer 3 - Supabase Postgres
  - blocklist (user-defined)
  - url_logs (audit trail of every check)

Layer 4 - HuggingFace Inference API
  - imanoop7/bert-phishing-detector
  - returns label + confidence
```

## Request lifecycle (a single navigation)

```
User types https://foo.com/login
        │
        ▼
chrome.webNavigation.onBeforeNavigate (frameId === 0)
        │
        ▼
extension/scripts/background.js → checkUrlWithBackend(url)
   - cache hit?                     → return cached verdict
   - cache miss?                    → POST /api/check-url
        │
        ▼
backend/src/controllers/urlController.js
   1. isValidUrl(url)?               → 400 if not
   2. extractDomain(url)
   3. blocklistService.isDomainBlocked(domain)
        - true   → log + return {status:"blocked"}
        - false  → continue
   4. aiService.classifyUrl(url)
        - error  → log + return {status:"warn"} (fail-safe)
        - safe   → log + return {status:"safe"}
        - phish  → log + return {status:"phishing"}
        │
        ▼
Extension receives verdict
   - safe       → toast ✅
   - warn       → toast ⚠️ + system notification
   - blocked    → tabs.update(tabId, blocked.html?...)
   - phishing   → tabs.update(tabId, blocked.html?...)
```

## Decision table

| blocklist hit | AI says | Final status | Action |
|:---:|:---:|:---:|:---|
| ✅ | n/a | `blocked`  | redirect to blocked page |
| ❌ | safe | `safe`    | toast ✅ |
| ❌ | phishing (≥ threshold) | `phishing` | redirect to blocked page |
| ❌ | error / timeout | `warn` | toast + notification, **page is allowed** |

The "fail-safe" rule (warn but allow) is a deliberate UX trade-off:

- *Hard-blocking* on AI failure would be annoying and would teach users to disable the extension.
- *Silent allow* would defeat the security purpose.
- A visible warning lets the user choose.

## Caching strategy

- **Extension memory cache** (`Map`, 60s TTL): same URL navigated repeatedly within 1 minute is checked once. Sub-resources of the same page therefore don't re-hit the backend.
- **Backend** has no application-level cache; Supabase + HF do their own. This keeps the audit log accurate (`url_logs` records every navigation, not just cache misses) — a deliberate choice for a security tool.

## Why we use `webNavigation` instead of `webRequest`

Manifest V3 removed blocking `webRequest` for unprivileged extensions. `webNavigation.onBeforeNavigate` fires before commit and lets us redirect via `chrome.tabs.update()`, which is the supported MV3 pattern.

## Database schema rationale

- `blocklist.domain` is **unique** → adding the same domain twice is an idempotent no-op (handled in `blocklistService.addToBlocklist` via the `23505` Postgres error code).
- `url_logs` includes both `url` and `domain` so we can answer two queries equally fast: "all visits to domain X" and "all visits matching URL pattern Y".
- `status` is `CHECK`-constrained to a fixed set so dashboards / future analytics can rely on the values.
- Indexes are on `domain`, `status`, and `timestamp DESC` — the three columns we filter on most.

## Security posture

| Concern | Mitigation |
|---|---|
| Secrets leaking to client | All secrets in `backend/.env`; extension only knows `API_BASE` |
| URL injection | `validator.isURL()` + `URL` constructor in `extractDomain` |
| Rate-abuse from a misbehaving extension | `express-rate-limit` 120 req/min/IP |
| CSRF | API is JSON-only with no cookies; extension uses `fetch` with no credentials |
| XSS in blocked page | All params are read with `URLSearchParams.get()` and inserted via `textContent`, never `innerHTML` |
| XSS in content script toast | Reasons are sanitized with a regex strip of `< > &` before inserting |
| Supabase RLS | Disabled in dev (we use `service_role`); ready to enable once user auth is added |

## Extension points (future work)

1. **User accounts** — re-enable RLS, replace `service_role` with per-user JWTs, scope `blocklist` and `url_logs` by `user_id`.
2. **Allow-list** — mirror the blocklist with a higher-priority `allowlist` table.
3. **Multiple AI signals** — combine BERT classifier with a domain-age check, a Google Safe Browsing lookup, etc., and aggregate scores.
4. **Dashboard** — a small React app reading `/api/logs` to visualize threats over time.
5. **WebStore distribution** — replace the local `API_BASE` with a hosted endpoint, sign the manifest, submit to Chrome Web Store.
