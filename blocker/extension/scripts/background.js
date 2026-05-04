// extension/scripts/background.js
// Service worker: intercepts navigations, calls the backend, blocks if needed.

importScripts('config.js');

// Simple in-memory cache of recent decisions to avoid re-checking the same URL
// every time a page loads sub-resources.
const decisionCache = new Map(); // url -> { result, expiresAt }

// Per-tab content classification results (stored after content.js sends page text)
const contentResultCache = new Map(); // tabId -> { result, url, at }

function isIgnoredUrl(url) {
  if (!url) return true;
  try {
    const u = new URL(url);
    return AEGIS_CONFIG.IGNORED_SCHEMES.some(s => u.protocol.startsWith(s));
  } catch (e) {
    return true;
  }
}

function getCached(url) {
  const hit = decisionCache.get(url);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    decisionCache.delete(url);
    return null;
  }
  return hit.result;
}

function setCached(url, result) {
  decisionCache.set(url, {
    result,
    expiresAt: Date.now() + AEGIS_CONFIG.CACHE_TTL_MS
  });
}

async function checkUrlWithBackend(url) {
  const cached = getCached(url);
  if (cached) return cached;

  try {
    const res = await fetch(AEGIS_CONFIG.API_BASE + AEGIS_CONFIG.CHECK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    if (!res.ok) {
      // Fail-safe: warn but allow
      const fallback = {
        ok: true,
        status: 'warn',
        reason: `Backend returned HTTP ${res.status}. Proceed with caution.`
      };
      setCached(url, fallback);
      return fallback;
    }

    const data = await res.json();
    setCached(url, data);
    return data;
  } catch (err) {
    console.warn('[AegisAI] Backend unreachable:', err.message);
    // Fail-safe: allow but warn the user the backend is down
    return {
      ok: true,
      status: 'warn',
      reason: `AegisAI backend unreachable (${err.message}). Proceed with caution.`
    };
  }
}

function buildBlockedPageUrl(originalUrl, status, reason) {
  const blockedPage = chrome.runtime.getURL('blocked/blocked.html');
  const params = new URLSearchParams({
    url: originalUrl,
    status: status || 'blocked',
    reason: reason || ''
  });
  return `${blockedPage}?${params.toString()}`;
}

// Per-tab badge feedback so users see status at a glance
async function setBadge(tabId, status) {
  const map = {
    safe:     { text: '✓', color: '#16a34a' },
    blocked:  { text: '⛔', color: '#dc2626' },
    phishing: { text: '!',  color: '#dc2626' },
    warn:     { text: '?',  color: '#f59e0b' },
    error:    { text: '?',  color: '#f59e0b' }
  };
  const cfg = map[status] || { text: '', color: '#000000' };
  try {
    await chrome.action.setBadgeText({ tabId, text: cfg.text });
    await chrome.action.setBadgeBackgroundColor({ tabId, color: cfg.color });
  } catch (e) { /* tab might be gone */ }
}

// Main interception point: fires when a top-level navigation is committed
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only handle main frame navigations (not iframes, sub-resources)
  if (details.frameId !== 0) return;
  const { tabId, url } = details;
  if (isIgnoredUrl(url)) return;

  const result = await checkUrlWithBackend(url);
  await setBadge(tabId, result.status);

  if (result.status === 'blocked' || result.status === 'phishing') {
    const redirect = buildBlockedPageUrl(url, result.status, result.reason);
    try {
      await chrome.tabs.update(tabId, { url: redirect });
    } catch (e) {
      console.warn('[AegisAI] could not redirect tab:', e.message);
    }
  } else if (result.status === 'warn') {
    // Soft warning: keep the page open, but tell the user via notifications API
    try {
      // Use a fixed ID so rapid navigations replace the previous notification
      // instead of stacking multiple banners
      chrome.notifications.create('aegisai-warn', {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon128.png'),
        title: 'AegisAI - Warning',
        message: result.reason || 'Could not verify this page.',
        priority: 1
      });
    } catch (e) { /* notifications permission can be missing */ }
  }
});

// Popup talks to the service worker via messages
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    try {
      if (msg?.type === 'CHECK_URL') {
        const data = await checkUrlWithBackend(msg.url);
        sendResponse({ ok: true, data });
        return;
      }

      if (msg?.type === 'GET_BLOCKLIST') {
        const r = await fetch(AEGIS_CONFIG.API_BASE + AEGIS_CONFIG.BLOCKLIST);
        sendResponse({ ok: r.ok, data: await r.json() });
        return;
      }

      if (msg?.type === 'ADD_BLOCKLIST') {
        const r = await fetch(AEGIS_CONFIG.API_BASE + AEGIS_CONFIG.BLOCKLIST, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain: msg.domain })
        });
        // Invalidate cache because this might affect future decisions
        decisionCache.clear();
        sendResponse({ ok: r.ok, data: await r.json() });
        return;
      }

      if (msg?.type === 'REMOVE_BLOCKLIST') {
        const r = await fetch(
          AEGIS_CONFIG.API_BASE + AEGIS_CONFIG.BLOCKLIST + '/' + encodeURIComponent(msg.domain),
          { method: 'DELETE' }
        );
        decisionCache.clear();
        sendResponse({ ok: r.ok, data: await r.json() });
        return;
      }

      if (msg?.type === 'GET_LOGS') {
        const r = await fetch(AEGIS_CONFIG.API_BASE + AEGIS_CONFIG.LOGS + '?limit=50');
        sendResponse({ ok: r.ok, data: await r.json() });
        return;
      }

      if (msg?.type === 'CHECK_CONTENT') {
        try {
          const r = await fetch(AEGIS_CONFIG.API_BASE + AEGIS_CONFIG.CHECK_CONTENT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: msg.url, text: msg.text })
          });
          const data = await r.json();
          // Cache per tab so popup can retrieve it
          if (sender?.tab?.id) {
            contentResultCache.set(sender.tab.id, { result: data, url: msg.url, at: Date.now() });
          }
          sendResponse({ ok: r.ok, data });
        } catch (err) {
          sendResponse({ ok: false, error: err.message });
        }
        return;
      }

      if (msg?.type === 'GET_CONTENT_RESULT') {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const tabId = tabs[0]?.id;
        const cached = tabId ? contentResultCache.get(tabId) : null;
        // Expire content results after 5 minutes
        const fresh = cached && (Date.now() - cached.at < 5 * 60 * 1000) ? cached : null;
        sendResponse({ ok: true, data: fresh?.result || null });
        return;
      }

      sendResponse({ ok: false, error: 'Unknown message type' });
    } catch (err) {
      sendResponse({ ok: false, error: err.message });
    }
  })();

  // Returning true keeps the message channel open for the async sendResponse
  return true;
});

console.log('[AegisAI] background service worker started.');
