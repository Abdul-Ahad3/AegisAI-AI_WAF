// extension/scripts/content.js
// Runs at document_idle on every page.
// 1. Checks URL verdict and shows a toast.
// 2. Extracts visible page text, sends to backend for toxicity classification,
//    then shows a second toast with the content analysis result.

(async function () {
  try {
    const url = location.href;
    if (!url || url.startsWith('chrome-extension://')) return;

    // ── 1. URL verdict (may be cached in background – fast) ──────────────────
    const resp = await chrome.runtime.sendMessage({ type: 'CHECK_URL', url });
    if (resp?.ok && resp.data) {
      showUrlToast(resp.data.status, resp.data.reason);
    }

    // ── 2. Content classification ─────────────────────────────────────────────
    // Extract visible text from the rendered page (better than server-side HTML fetch)
    const raw = (document.body?.innerText || '').replace(/\s+/g, ' ').trim();
    if (raw.length > 20) {
      const text = raw.slice(0, 600);
      const cResp = await chrome.runtime.sendMessage({ type: 'CHECK_CONTENT', url, text });
      if (cResp?.ok && cResp?.data) {
        showContentToast(cResp.data);
      }
    }
  } catch (e) {
    // Content scripts must never crash the host page
  }

  // ── URL toast (existing style) ──────────────────────────────────────────────
  function showUrlToast(status, reason) {
    const colors = {
      safe:     { bg: '#dcfce7', fg: '#14532d', label: '✅ Safe website' },
      warn:     { bg: '#fef3c7', fg: '#78350f', label: '⚠️ Could not verify' },
      blocked:  { bg: '#fee2e2', fg: '#7f1d1d', label: '⛔ Blocked' },
      phishing: { bg: '#fee2e2', fg: '#7f1d1d', label: '🚨 Phishing detected' },
      error:    { bg: '#fef3c7', fg: '#78350f', label: '⚠️ Check failed' }
    };
    const cfg = colors[status] || colors.warn;

    const host = document.createElement('div');
    host.id = 'aegis-toast-host';
    host.style.cssText = [
      'position:fixed', 'top:16px', 'right:16px', 'z-index:2147483647',
      'font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif',
      'font-size:13px', 'max-width:320px',
      `background:${cfg.bg}`, `color:${cfg.fg}`,
      'padding:10px 14px', 'border-radius:10px',
      'box-shadow:0 6px 20px rgba(0,0,0,.15)',
      'line-height:1.4', 'transition:opacity .4s ease', 'opacity:1'
    ].join(';');

    host.innerHTML =
      `<div style="font-weight:600;margin-bottom:2px;">AegisAI · ${cfg.label}</div>` +
      `<div style="opacity:.85;">${(reason || '').replace(/[<>&]/g, '')}</div>`;

    document.documentElement.appendChild(host);
    setTimeout(() => { host.style.opacity = '0'; }, 4500);
    setTimeout(() => { host.remove(); }, 5200);
  }

  // ── Content (toxicity) toast ────────────────────────────────────────────────
  function showContentToast(data) {
    const ok = data.ok !== false;
    const clean = ok && data.clean;
    const flags = ok ? (data.flags || []) : [];

    let bg, fg, title, detail;

    if (!ok) {
      // classifier failed silently – don't show toast
      return;
    } else if (clean) {
      bg = '#f0fdf4'; fg = '#14532d';
      title = '✅ Content looks clean';
      detail = 'No toxic or harmful content detected.';
    } else {
      bg = '#fff7ed'; fg = '#7c2d12';
      const topPct = data.topScore ? ` (${(data.topScore * 100).toFixed(0)}%)` : '';
      title = `⚠️ Content flagged: ${flags.join(', ')}`;
      detail = `Highest: ${data.topFlag}${topPct}`;
    }

    const host = document.createElement('div');
    host.id = 'aegis-content-toast';
    host.style.cssText = [
      'position:fixed', 'top:80px', 'right:16px', 'z-index:2147483647',
      'font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif',
      'font-size:12px', 'max-width:320px',
      `background:${bg}`, `color:${fg}`,
      'padding:8px 12px', 'border-radius:10px',
      'box-shadow:0 4px 15px rgba(0,0,0,.12)',
      'line-height:1.4', 'transition:opacity .4s ease', 'opacity:1'
    ].join(';');

    host.innerHTML =
      `<div style="font-weight:600;margin-bottom:2px;">AegisAI · Content Analysis</div>` +
      `<div style="opacity:.9;">${title}</div>` +
      `<div style="opacity:.75;font-size:11px;margin-top:2px;">${detail}</div>`;

    document.documentElement.appendChild(host);
    setTimeout(() => { host.style.opacity = '0'; }, 5000);
    setTimeout(() => { host.remove(); }, 5700);
  }
})();
