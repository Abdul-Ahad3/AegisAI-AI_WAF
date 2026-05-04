# AegisAI — Testing Guide

A practical test plan to verify each layer works.

## 1. Backend smoke tests (curl)

```bash
# 1. Server alive
curl -s http://localhost:5000/health
# Expected: {"ok":true,"status":"healthy"}

# 2. Add to blocklist
curl -s -X POST http://localhost:5000/api/blocklist \
     -H "Content-Type: application/json" \
     -d '{"domain":"badsite.test"}'
# Expected: {"ok":true,"alreadyExists":false,"item":{...}}

# 3. List blocklist
curl -s http://localhost:5000/api/blocklist
# Expected: {"ok":true,"count":N,"items":[...]}

# 4. Check a blocked URL
curl -s -X POST http://localhost:5000/api/check-url \
     -H "Content-Type: application/json" \
     -d '{"url":"http://badsite.test/page"}'
# Expected: {"ok":true,"status":"blocked","reason":"Domain ... is in your blocklist."}

# 5. Check a normal URL
curl -s -X POST http://localhost:5000/api/check-url \
     -H "Content-Type: application/json" \
     -d '{"url":"https://www.wikipedia.org/"}'
# Expected: {"ok":true,"status":"safe", "confidence": ...}

# 6. Check a phishing-like URL (BERT model is heuristic, results vary)
curl -s -X POST http://localhost:5000/api/check-url \
     -H "Content-Type: application/json" \
     -d '{"url":"http://login-secure-paypal.verify-account.com/account/update?id=1"}'
# Expected: {"status":"phishing", ...}  OR "safe" depending on the model

# 7. Remove from blocklist
curl -s -X DELETE http://localhost:5000/api/blocklist/badsite.test

# 8. Get logs
curl -s "http://localhost:5000/api/logs?limit=10"
```

## 2. Backend negative tests

```bash
# Invalid URL
curl -s -X POST http://localhost:5000/api/check-url \
     -H "Content-Type: application/json" \
     -d '{"url":"not-a-url"}'
# Expected: HTTP 400, {"ok":false,"reason":"Invalid URL ..."}

# Invalid domain
curl -s -X POST http://localhost:5000/api/blocklist \
     -H "Content-Type: application/json" \
     -d '{"domain":"!!"}'
# Expected: HTTP 400

# Unknown route
curl -s http://localhost:5000/api/nope
# Expected: HTTP 404
```

## 3. Database checks (Supabase Table Editor)

After running the steps above:

1. Open Supabase → **Table Editor → blocklist** → row count should match what you added.
2. Open **url_logs** → every URL you checked should appear, ordered by timestamp.
3. Status column values should be one of: `safe`, `blocked`, `phishing`, `error`.

## 4. Extension manual tests

| # | Action | Expected result |
|---|--------|------------------|
| 1 | Open popup on a normal page | Green "✅ Safe website" status |
| 2 | Add `example-malware.test` to blocklist | Appears in popup list |
| 3 | Visit `http://example-malware.test` | Redirected to AegisAI **⛔ Blocked** page |
| 4 | Click **Go Back** on blocked page | Returns to previous page |
| 5 | Remove the domain from the popup | Disappears from list |
| 6 | Re-visit `http://example-malware.test` | Now allowed (or AI verdict applies) |
| 7 | Stop the backend, open a new tab to a site | Toast says "⚠️ backend unreachable" – fail-safe |
| 8 | Re-start the backend, reload the page | Toast returns to ✅/⚠️/⛔ |

## 5. Service worker debugging

1. `chrome://extensions` → AegisAI → click **service worker** (blue link).
2. DevTools opens; the **Console** prints every URL check.
3. The **Network** tab shows the `POST /api/check-url` requests.

## 6. Performance sanity

The backend caches **nothing** (so the DB and AI are exercised every call), but the extension caches each verdict for 60 seconds (`AEGIS_CONFIG.CACHE_TTL_MS`). After visiting a site once, follow-up checks for the same URL return instantly from memory. Click the popup → service-worker console shows `cache hit` if you instrument it; or watch the lack of new rows in `url_logs`.
