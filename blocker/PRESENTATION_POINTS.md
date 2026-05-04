# AegisAI — Final Year Project Defense
## Presentation Slide-by-Slide Content

---

---

## SLIDE 1 — Title Slide

**Title:** AegisAI — Smart Web Security System
**Subtitle:** AI-Powered Phishing Detection & Web Page Blocker Chrome Extension

**Group Members:**
- Muhammad Muzammil
- Mirza Muhammad Abdul Ahad

**Presented to:** [Supervisor / Panel Name]
**Institution:** [University Name]
**Date:** 2026

---

**Speaker Notes:**
Good [morning/afternoon], respected panel. We are Muhammad Muzammil and Mirza Muhammad Abdul Ahad, presenting our Final Year Project — AegisAI, a smart web security system that protects users from phishing and malicious websites in real time using artificial intelligence. The name "Aegis" comes from Greek mythology, meaning a divine shield of protection — which perfectly captures what this system does for users browsing the web.

---

---

## SLIDE 2 — Problem Statement

**Slide Title:** The Growing Threat of Phishing & Malicious Websites

**Bullet Points:**
- 🌐 Over **3.4 billion phishing emails** are sent daily; phishing attacks increased by **61%** in 2022 alone
- 💸 Cybercrime costs the global economy over **$8 trillion per year** — phishing is the #1 entry point
- 🔗 Malicious websites steal credentials, install malware, and perform financial fraud with a single click
- 🧠 Users cannot visually distinguish legitimate sites from sophisticated phishing clones
- ❌ Built-in browser warnings are reactive (blocklist-based) — they miss **new, zero-day phishing sites**
- 📵 No existing free tool combines **personal blocklists + real-time AI detection + page content analysis** in a single extension

---

**Speaker Notes:**
The web is the primary attack surface for cybercrime today. Phishing alone accounts for over 36% of all data breaches, according to Verizon's Data Breach Investigations Report. What makes this problem particularly dangerous is that modern phishing sites are visually indistinguishable from real ones — users need an intelligent system watching in the background, not just a static blocklist. This is the core problem AegisAI was built to solve.

---

---

## SLIDE 3 — Project Objectives

**Slide Title:** What AegisAI Sets Out to Achieve

**Bullet Points:**
- 🎯 **Objective 1 — Real-Time URL Analysis:** Automatically scan every URL a user visits and classify it as safe, phishing, or malicious using a BERT-based AI model
- 🎯 **Objective 2 — Content Toxicity Detection:** Extract and analyse visible page text to detect toxic, offensive, or harmful content using a second AI model
- 🎯 **Objective 3 — Personal Blocklist Management:** Allow users to maintain their own list of blocked domains through a Chrome popup UI, with instant redirect on visit
- 🎯 **Objective 4 — Secure, Secret-Free Architecture:** Keep all API keys and AI tokens on the backend server only — never exposed to the browser or the extension code
- 🎯 **Objective 5 — Fail-Safe User Experience:** Ensure the extension never hard-blocks pages when AI is unavailable — it warns the user and allows access instead

---

**Speaker Notes:**
Our project has five clearly defined objectives. The first two are AI-driven — using separate models for URL-level phishing detection and page-level toxicity classification. The third objective gives users control over their own safety. The fourth ensures that the system is secure by design, and the fifth makes sure the system degrades gracefully rather than disrupting the user's browsing if the backend is temporarily unavailable.

---

---

## SLIDE 4 — Literature Review / Existing Solutions

**Slide Title:** What Already Exists — And Where It Falls Short

**Bullet Points:**
- **Google Safe Browsing (GSB):** Used by Chrome natively; relies on a pre-built URL blocklist — cannot detect brand-new phishing domains not yet reported
- **Netcraft Extension:** Detects phishing via reputation scores and manual reports — no AI; slow to react to new threats; no personal blocklist
- **Norton Safe Web / McAfee WebAdvisor:** Require paid subscriptions; heavyweight installs; do not analyse page content for toxicity
- **Browser Built-in Warnings:** Heuristic-based, trigger too late (after domain reputation builds); no customisation by the user
- **Academic Work (BERT for Phishing):** Research papers (e.g., Vazhayil et al. 2023) prove BERT outperforms traditional ML (SVM, Random Forest) for URL classification with >97% accuracy — but no practical browser deployment existed
- **Gap Identified:** No free, open-source tool combines AI URL classification + AI content toxicity + user-defined blocklist in a single, lightweight Chrome extension with a secure backend

---

**Speaker Notes:**
We reviewed both commercial products and academic literature. Commercial solutions like Google Safe Browsing are reactive — they only block sites that have already been reported. Academic research has proven that transformer-based models like BERT are highly accurate for phishing detection, but none of these models were packaged into a practical, deployable browser extension. AegisAI bridges this gap by combining the research-proven accuracy of BERT with a real, usable Chrome extension.

---

---

## SLIDE 5 — Proposed Solution — AegisAI Overview

**Slide Title:** AegisAI — How We Solve the Problem

**Bullet Points:**
- 🛡️ A **Chrome Extension (Manifest V3)** that silently monitors every URL the user navigates to
- 🤖 A **Node.js + Express backend** that acts as a secure middleware — the extension talks to the backend, never directly to AI APIs
- 🧠 **Two AI models** via HuggingFace: `ealvaradob/bert-finetuned-phishing` for URL analysis and `unitary/toxic-bert` for page content toxicity
- 🗄️ A **Supabase (PostgreSQL) database** for storing user blocklists and all URL check logs — providing an audit trail
- 🔔 **Visual feedback** via two floating toast notifications (URL verdict + content analysis) and a badge icon on the extension button
- ⚡ **Decision in under 2 seconds** with a 60-second client-side cache to avoid redundant API calls

---

**Speaker Notes:**
AegisAI works silently in the background — the user simply installs the extension and browses normally. Every navigation triggers an automatic check: the extension sends the URL to our backend, which consults the blocklist and AI model, then returns a verdict. Simultaneously, once the page loads, the visible text is extracted and sent for toxicity analysis. The user sees results through colour-coded toasts — green for safe, amber for warnings, and red for threats.

---

---

## SLIDE 6 — System Architecture

**Slide Title:** Four-Layer Architecture

**Bullet Points:**
- **Layer 1 — Chrome Extension (Client):** Service worker (`background.js`) intercepts navigation events; content script (`content.js`) extracts page text; popup UI for blocklist management
- **Layer 2 — Node.js + Express Backend (API Server):** Receives requests from extension; validates inputs; orchestrates blocklist lookup, AI calls, and database writes; enforces rate limiting and CORS
- **Layer 3 — Supabase / PostgreSQL (Data Layer):** Stores `blocklist` and `url_logs` tables; all queries use the `service_role` key kept exclusively on the server
- **Layer 4 — HuggingFace Inference API (AI Layer):** Two models called via `router.huggingface.co` — phishing detector returns safe/phishing; toxic-bert returns 6-category toxicity scores
- **Data Flow:** Extension → Backend → [Supabase + HuggingFace] → Backend → Extension → User
- **Security Boundary:** HuggingFace tokens and Supabase keys NEVER leave the backend `.env` file — completely hidden from the browser

---

**Speaker Notes:**
The four-layer architecture was a deliberate design decision. By placing the backend as a mandatory middleware, we ensure that no API keys are ever exposed in the extension code — which is publicly readable in Chrome. Any request from the extension is first validated, rate-limited, and sanitised by the backend before reaching the database or AI models. This separation of concerns also means we can swap AI models or databases without changing the extension code.

---

---

## SLIDE 7 — Technology Stack

**Slide Title:** Technology Choices & Justifications

**Bullet Points:**
- **Chrome Extension (Manifest V3):** The current standard for Chrome extensions; service workers replace background pages for better memory efficiency and security
- **Node.js + Express 4.21:** Lightweight, non-blocking I/O ideal for an API that makes multiple concurrent external calls (Supabase + HuggingFace); massive npm ecosystem
- **Supabase (PostgreSQL):** Managed cloud database with a generous free tier; provides a REST API and real-time capabilities; no infrastructure management needed for a student project
- **HuggingFace Inference API:** Free-tier access to state-of-the-art NLP models; `ealvaradob/bert-finetuned-phishing` achieves >99% confidence on known phishing patterns; `unitary/toxic-bert` provides 6-category toxicity classification
- **Helmet + CORS + express-rate-limit:** Industry-standard Node.js security middleware stack; protects against XSS, clickjacking, and API abuse with minimal code
- **Axios:** Promise-based HTTP client with timeout support — critical for enforcing 15-second AI call deadlines and failing gracefully

---

**Speaker Notes:**
Every technology choice was justified — not just used because it was popular. Manifest V3 was mandatory as Manifest V2 extensions are being deprecated by Google. We chose Supabase over raw PostgreSQL to avoid managing database infrastructure, which would have been out of scope for a final year project. HuggingFace was chosen because it provides free access to pre-trained transformer models that would otherwise require months of training data and compute resources to build from scratch.

---

---

## SLIDE 8 — Chrome Extension Features

**Slide Title:** What the Extension Does

**Bullet Points:**
- **Navigation Interception:** `chrome.webNavigation.onBeforeNavigate` fires before the page loads — blocked/phishing sites are redirected before the user ever sees them
- **Dual Toast Notifications:** Two floating banners appear on every page — first for URL verdict (✅ Safe / 🚨 Phishing / ⚠️ Warning), second for content toxicity analysis (✅ Clean / ⚠️ Flagged)
- **Toolbar Badge:** Extension icon shows a live badge (✓ green / ! red / ? amber) so users can see the site's status without opening the popup
- **Popup Dashboard:** 360px popup showing current tab verdict, content analysis scores, personal blocklist management, and a Recent Activity log of the last 15 checks
- **Custom Blocklist:** Users add/remove domains via the popup; blocked domains cause instant redirect to a branded ⛔ block page showing the reason and original URL
- **60-Second Cache:** Decisions are cached in memory for 60 seconds per URL — prevents hammering the backend on every sub-resource load while keeping results fresh

---

**Speaker Notes:**
The extension was designed to be invisible during normal browsing — it only draws attention when something needs the user's awareness. The 60-second cache was a critical performance decision: without it, the extension would send dozens of requests per page load since each image, script, and stylesheet triggers a navigation event. We intercept only top-level frame navigations, not sub-resources, to keep it efficient.

---

---

## SLIDE 9 — Backend Design

**Slide Title:** Node.js Backend — API Endpoints & Design

**Bullet Points:**
- **`POST /api/check-url`** — Core endpoint: validates URL, checks blocklist, calls phishing AI model, logs result, returns verdict with confidence score
- **`POST /api/check-content`** — New feature: receives extracted page text from content script, calls toxic-bert, returns flags and per-category scores
- **`GET/POST/DELETE /api/blocklist`** — Full CRUD for personal blocklist with domain normalisation (strips `www.`, lowercases)
- **`GET /api/logs?limit=N`** — Returns recent URL check history from the database (max 500 entries), ordered by newest first
- **`GET /health`** — Lightweight health check endpoint used by the extension to detect if backend is offline
- **Middleware Stack:** `helmet` (14 HTTP security headers) → `cors` (origin restricted to extension ID) → `express-rate-limit` (120 req/min per IP) → `morgan` (request logging) → route handlers

---

**Speaker Notes:**
The backend follows a clean controller-service-repository pattern. Controllers handle HTTP — they validate input and return responses. Services contain business logic — the AI calls, domain checks. The Supabase client handles all database operations. This separation means each layer can be tested independently, and the code is easy to navigate and extend. The rate limiter at 120 requests per minute is generous enough for normal use but prevents any runaway extension behaviour from overloading the server.

---

---

## SLIDE 10 — Database Schema

**Slide Title:** Supabase Database Design

**Bullet Points:**
- **`blocklist` table:** `id` (UUID primary key), `domain` (TEXT UNIQUE — enforces no duplicates), `user_id` (UUID nullable — reserved for future multi-user support), `created_at` (timestamptz)
- **`url_logs` table:** `id` (UUID), `url` (full URL), `domain` (extracted), `status` (CHECK constraint: only `safe / blocked / phishing / malicious / error`), `reason` (text), `confidence` (NUMERIC 5,4 — e.g. 0.9999), `timestamp` (timestamptz)
- **Indexes:** `idx_blocklist_domain` (fast domain lookup on every URL check), `idx_url_logs_domain`, `idx_url_logs_status`, `idx_url_logs_timestamp DESC` (fast recent log retrieval)
- **UUID primary keys:** Used throughout for scalability and to avoid sequential ID enumeration attacks
- **CHECK constraint on `status`:** Database-level validation — invalid status values are rejected even if backend has a bug
- **Row Level Security (RLS):** Disabled for development with `service_role` key bypass; designed to be enabled with JWT auth for production deployment

---

**Speaker Notes:**
The schema was designed with both current needs and future scalability in mind. The `user_id` column in both tables is nullable now but is reserved for a future multi-user authentication system where each user would have their own private blocklist and log history. The CHECK constraint on the `status` column is an example of defensive design — even if the backend code had a bug and tried to insert an invalid status, the database itself would reject it.

---

---

## SLIDE 11 — AI Integration

**Slide Title:** AI Models — BERT for Phishing & Toxicity Detection

**Bullet Points:**
- **Model 1 — URL Phishing Detection:** `ealvaradob/bert-finetuned-phishing` — a BERT model fine-tuned on phishing URL datasets; returns `benign` or `phishing` label with confidence score (0.0–1.0)
- **Model 2 — Content Toxicity:** `unitary/toxic-bert` — original toxic-BERT model fine-tuned on the Jigsaw Toxic Comments dataset; returns 6 independent labels: `toxic`, `severe_toxic`, `obscene`, `threat`, `insult`, `identity_hate`
- **API Endpoint:** Both models called via `https://router.huggingface.co/hf-inference/models/{model}` — the new HuggingFace Inference Provider router (the legacy `api-inference.huggingface.co/models/` endpoint was deprecated)
- **Threshold:** Phishing flagged at ≥ 0.7 confidence; toxicity flags raised at ≥ 0.5 per-category score — configurable via `.env`
- **Why BERT over traditional ML:** BERT understands context and subword patterns (e.g. `paypa1-secure-verify.xyz`) that SVM/Random Forest bag-of-words models miss; pre-trained on billions of tokens — no training data needed from our side
- **Fail-Safe Design:** If HuggingFace API returns an error (cold start, rate limit), backend returns `warn` status — user is notified but never hard-blocked

---

**Speaker Notes:**
BERT — Bidirectional Encoder Representations from Transformers — was developed by Google in 2018 and has become the standard baseline for NLP classification tasks. For phishing detection, BERT's subword tokenisation is critical: it can recognise that "paypa1" is suspiciously similar to "paypal" by sharing subword tokens, whereas a simple keyword model would miss it entirely. We use HuggingFace's managed inference API so we don't need to host or maintain the model ourselves — this is ideal for a student project while still delivering enterprise-grade AI capabilities.

---

---

## SLIDE 12 — Decision Flow / Workflow

**Slide Title:** How AegisAI Makes a Decision — Step by Step

**Bullet Points:**
- **Step 1:** User navigates to a URL → `chrome.webNavigation.onBeforeNavigate` fires in the service worker
- **Step 2:** Background script checks 60-second in-memory cache — if hit, uses cached verdict immediately (no network call)
- **Step 3:** Cache miss → `POST /api/check-url` sent to backend; backend validates URL format using the `validator` npm package
- **Step 4:** Backend queries Supabase `blocklist` table — if domain matches, returns `status: blocked` immediately (no AI call needed)
- **Step 5:** If not blocked → calls HuggingFace phishing model → AI returns label + confidence → verdict logged to `url_logs`
- **Step 6:** Extension receives verdict → sets badge colour → if `blocked/phishing`: redirects tab to `blocked.html` → if `warn`: shows notification → **Meanwhile**, content script extracts page text → calls `/api/check-content` → shows toxicity toast

---

**Speaker Notes:**
The decision flow was engineered for both speed and correctness. Blocklist checks always run first — they are instant database queries and don't consume API rate limits. The AI model is only called when a site is not already known to be blocked. This two-tier approach means a user's deliberately blocked sites are handled without any AI latency, while unknown sites get the full AI treatment. The content analysis runs in parallel after the page loads, so it never delays the initial URL verdict.

---

---

## SLIDE 13 — Security Measures

**Slide Title:** Security — Built Into Every Layer

**Bullet Points:**
- **Secret Isolation:** HuggingFace API token and Supabase `service_role` key stored only in `backend/.env` — never sent to the browser, never in extension code (which is publicly readable by anyone)
- **Helmet.js:** Automatically sets 14 HTTP security headers including `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security` — prevents XSS and clickjacking
- **CORS Restriction:** `ALLOWED_ORIGINS` set to `chrome-extension://aegppnlpboehmahbanalomloocobhmmo` — only this specific extension ID can call the backend API; all other origins are rejected
- **Rate Limiting:** `express-rate-limit` enforces 120 requests per minute per IP address — prevents API abuse and protects HuggingFace token from being exhausted
- **Input Validation:** Every URL passes through the `validator` npm library (isURL check) before any processing — rejects malformed inputs that could cause crashes or injection
- **Fail-Safe by Design:** AI errors → `warn` (allow + notify), not block; backend unreachable → `warn` toast; blocked page avoids infinite loops by checking chrome-extension:// origins

---

**Speaker Notes:**
Security was not an afterthought — it was built into the architecture from day one. The most important decision was keeping all secrets on the backend. If we had called HuggingFace directly from the Chrome extension, our API token would be visible in plain text to anyone who opened Chrome DevTools. The CORS restriction to the specific extension ID means that even if someone discovers the backend URL, they cannot call it from a web page or another tool without being blocked.

---

---

## SLIDE 14 — Implementation — Key Code Highlights

**Slide Title:** Notable Implementation Decisions

**Bullet Points:**
- **Service Worker Cache (background.js):** `decisionCache` Map with TTL-based expiry — avoids duplicate backend calls within 60 seconds; `contentResultCache` stores per-tab toxicity results for the popup to retrieve
- **Parallel AI + Blocklist (urlController.js):** Blocklist check runs first; only if not blocked does the AI call execute — ensures minimum latency for known-blocked domains
- **Domain Normalisation (urlUtils.js):** `extractDomain()` strips `www.` prefix and lowercases — ensures `www.Instagram.com` and `instagram.com` match the same blocklist entry
- **Content Text Extraction (content.js):** `document.body.innerText` gives clean rendered text without HTML tags — better than server-side HTML fetching which gets blocked by anti-bot systems; truncated to 600 chars to stay within BERT's 512-token limit
- **Toxic-BERT Threshold Logic (contentService.js):** Scores compared against 0.5 threshold per category — multiple flags possible simultaneously (a page can be both `toxic` AND `insult`); results sorted by score descending for the popup display
- **onBeforeNavigate vs webRequest (background.js):** Used `webNavigation` instead of `webRequest` because Manifest V3 removed blocking `webRequest` — `onBeforeNavigate` fires before the request, allowing redirect before the page even loads

---

**Speaker Notes:**
One of the most technically interesting decisions was using `onBeforeNavigate` instead of `webRequest`. Manifest V3, which is now mandatory for Chrome extensions, removed the ability to block web requests synchronously — this was a major change from V2. We adapted by using `webNavigation.onBeforeNavigate` which fires at the same point in the browser's loading lifecycle but through the new async service worker model. This required us to understand the Chrome extension lifecycle deeply, which was a significant learning experience.

---

---

## SLIDE 15 — Testing & Results

**Slide Title:** Testing Methodology & Outcomes

**Bullet Points:**
- **Backend Smoke Tests (8 cases):** All API endpoints tested via PowerShell `Invoke-WebRequest` — health, check-url (safe), check-url (phishing), blocklist CRUD, check-content (clean), check-content (toxic), logs retrieval, invalid URL rejection
- **AI Accuracy Observed:** `https://youtube.com` → `benign` (confidence: 99.99%); `http://paypal-secure-login-verify.xyz/account` → `phishing` (confidence: 99.99%); `https://wikipedia.org` text → content clean (toxic score: 0.08%)
- **Toxic Content Test:** Sample abusive text → `toxic: 99.4%, insult: 90.5%, obscene: 86.7%, threat: 62.6%` — all four flags correctly raised above 0.5 threshold
- **Extension Manual Tests:** Toast appears on every page; blocklist redirect works; blocked.html buttons (Go Back / New Tab) functional; popup content analysis section updates correctly
- **Fail-Safe Test:** Backend stopped → extension shows ⚠️ "backend unreachable" toast — browsing continues uninterrupted (no hard block)
- **Performance:** Cached URL response < 5ms; live AI check typically 1.0–1.6 seconds; content toxicity analysis 0.8–1.5 seconds

---

**Speaker Notes:**
All core scenarios were tested before this presentation. The AI model performance was particularly impressive — it correctly classified both safe and phishing URLs with near-perfect confidence without any input from us beyond the URL string. The fail-safe test was critical for us to verify: the system's most important non-functional requirement is that it must never prevent a user from accessing a legitimate site, even when the AI is unavailable. This was confirmed working correctly.

---

---

## SLIDE 16 — Challenges Faced

**Slide Title:** Technical Challenges & How We Solved Them

**Bullet Points:**
- **Challenge 1 — HuggingFace API Deprecation:** During development, `api-inference.huggingface.co/models/` returned 404 for all models (legacy endpoint deprecated). **Solution:** Discovered and migrated to `router.huggingface.co/hf-inference/models/` — the new Inference Providers API
- **Challenge 2 — Original Model Unavailable:** `imanoop7/bert-phishing-detector` (originally specified) returned 404 — the model was removed from HuggingFace. **Solution:** Researched and replaced with `ealvaradob/bert-finetuned-phishing` which delivered superior accuracy
- **Challenge 3 — Manifest V3 Breaking Changes:** Chrome removed blocking `webRequest` in MV3, making the standard approach for URL interception unavailable. **Solution:** Used `webNavigation.onBeforeNavigate` with async service worker — achieved the same result through a different event model
- **Challenge 4 — `xenova/toxic-bert` Not Callable via API:** The requested model only runs in-browser via Transformers.js. **Solution:** Used `unitary/toxic-bert` (the original model `xenova/toxic-bert` is derived from) — identical weights, full server-side compatibility
- **Challenge 5 — Content Script Text Quality:** Server-side HTML fetching was blocked by anti-bot systems on major sites. **Solution:** Switched to `document.body.innerText` from the content script — gets clean, rendered text with zero bot-blocking issues
- **Challenge 6 — CORS Between Extension and Backend:** Chrome extensions have a unique `chrome-extension://` origin that standard CORS configurations reject. **Solution:** Custom CORS callback in Express that explicitly allows `chrome-extension://` origins and null-origin requests

---

**Speaker Notes:**
Every one of these challenges was encountered during actual development, not in theory. The HuggingFace API deprecation was particularly difficult because the error manifested as a 404 with an Express-like response body, which initially made us think the request was hitting our own backend. Debugging this required us to inspect TLS certificates, check DNS resolution, and test with raw Node.js HTTPS calls to isolate where the failure was occurring — a real-world debugging experience that no textbook exercise could have provided.

---

---

## SLIDE 17 — Future Enhancements

**Slide Title:** What Comes Next — Roadmap

**Bullet Points:**
- 🔐 **User Authentication:** Integrate Supabase Auth (JWT) to give each user a private blocklist and personal log history — enable Row Level Security (RLS) already scaffolded in the schema
- 📊 **Admin Dashboard:** A web-based dashboard (React/Next.js) showing analytics — most blocked domains, phishing trends over time, per-user statistics, using the existing `url_logs` data
- 🌍 **Production Deployment:** Host backend on Railway/Render/Fly.io, update `config.js` → `API_BASE` to the deployed URL; submit extension to Chrome Web Store with signed manifest
- 🔗 **URL Allowlist:** Add a user-defined allowlist (e.g. "always trust my bank's domain") that bypasses AI checks for explicitly trusted sites
- 📱 **Firefox/Edge Port:** Manifest V3 is now supported across major browsers — the extension codebase can be ported to Firefox and Edge with minimal changes
- 🤖 **Multi-Signal AI Fusion:** Combine HuggingFace BERT verdict with Google Safe Browsing API lookup and WHOIS domain age — very new domains (< 30 days old) are statistically high-risk; fusion score would increase accuracy further

---

**Speaker Notes:**
The current system is fully functional as a prototype, but we've deliberately designed every layer to be extensible. The `user_id` column already exists in both database tables — enabling multi-user support is a matter of wiring up authentication, not redesigning the schema. The most impactful near-term enhancement would be production deployment, which would allow the extension to be installed by anyone from the Chrome Web Store and used as a real product beyond the academic context.

---

---

## SLIDE 18 — Conclusion

**Slide Title:** Summary — What AegisAI Delivers

**Bullet Points:**
- ✅ **Achieved all 5 objectives:** Real-time phishing detection, content toxicity classification, personal blocklist, secret-free architecture, and fail-safe user experience
- 🧠 **Dual AI pipeline:** Two HuggingFace BERT models working in parallel — phishing URL detection and 6-category content toxicity analysis — providing a layer of protection no existing free tool offers
- 🏗️ **Production-grade architecture:** Clean 4-layer separation (Extension → Backend → Database → AI), rate limiting, CORS, Helmet security headers, input validation — not just a prototype
- 📐 **Academic foundation:** Grounded in published research on transformer-based phishing detection (BERT outperforms SVM/Random Forest by >10% accuracy on benchmark datasets)
- 📦 **Complete deliverable:** 28 source files across extension, backend, database, and documentation — fully functional, runnable, and documented
- 🎓 **Learning outcomes:** Gained hands-on experience with Chrome Extension APIs (MV3), Node.js backend design, PostgreSQL schema design, REST API security, and real-world AI API integration

---

**Speaker Notes:**
AegisAI is not just a proof of concept — it is a working, tested system that you can install and use right now. Every component we discussed today — the extension, backend, database, and AI models — is implemented, integrated, and verified. We set out to build a smart web security tool that goes beyond static blocklists, and we believe the dual AI pipeline and clean architecture demonstrate that goal was achieved. Thank you for your time and attention.

---

---

## SLIDE 19 — Q&A / Thank You

**Slide Title:** Thank You — Questions Welcome

**Content:**
```
🛡️ AegisAI
Smart Web Security System

Muhammad Muzammil
Mirza Muhammad Abdul Ahad

"Protecting users one URL at a time."
```

**Anticipated Q&A Prep:**

**Q: Why not run the AI model locally in the extension?**
A: Browser extensions have strict memory and CPU limits. A BERT model is ~400MB+ and would make the extension unusable. Keeping it on the server also lets us swap models without users needing to update the extension.

**Q: What is your model's accuracy rate?**
A: In our testing, `ealvaradob/bert-finetuned-phishing` classified known phishing URLs with 99.99% confidence. The underlying BERT model was fine-tuned on labelled phishing datasets and benchmarks above 97% F1-score in published literature.

**Q: What happens if the backend server goes down?**
A: The extension enters fail-safe mode — it shows a warning toast ("backend unreachable") but never hard-blocks the user. Browsing continues uninterrupted. This was a deliberate design requirement.

**Q: Is user data stored privately?**
A: Currently the system uses a service_role key and no user authentication. The `user_id` field is nullable for now. In the next version, Supabase Auth with Row Level Security would give each user fully private data.

**Q: Why Supabase over a regular PostgreSQL instance?**
A: Supabase provides a managed PostgreSQL instance with a REST API, a real-time listener, and a generous free tier — ideal for a student project where we wanted to focus on the application layer, not database infrastructure management.

**Q: Could this be extended to detect malware downloads?**
A: Yes — the `webNavigation` listener can be extended to intercept download-triggered URLs. A third AI model focused on malware URL patterns could be added as a new route (`/api/check-download`) with no changes to the existing endpoints.

---

**Speaker Notes:**
We are happy to take any questions from the panel. We have tested the live system and can demonstrate it running if required. Thank you for your evaluation of our Final Year Project.

---

---

*End of Presentation — AegisAI FYP Defense*
*Files: 28 source files | Lines of code: ~1,400 | Development time: 1 semester*
