// extension/popup/popup.js

const $ = (id) => document.getElementById(id);

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1600);
}

function send(type, payload = {}) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type, ...payload }, (resp) => resolve(resp));
  });
}

// ------- Current tab status -------
async function refreshCurrentTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  const statusEl = $('currentStatus');

  if (!tab || !tab.url || !/^https?:/i.test(tab.url)) {
    statusEl.className = 'status muted';
    statusEl.textContent = 'No active web page in this tab.';
    return;
  }

  statusEl.className = 'status muted';
  statusEl.textContent = 'Checking…';

  const resp = await send('CHECK_URL', { url: tab.url });
  if (!resp?.ok || !resp.data) {
    statusEl.className = 'status warn';
    statusEl.textContent = 'Could not reach AegisAI backend.';
    return;
  }

  const { status, reason } = resp.data;
  const labelMap = {
    safe: '✅ Safe website',
    warn: '⚠️ Could not verify',
    blocked: '⛔ Blocked',
    phishing: '🚨 Phishing detected',
    error: '⚠️ Check failed'
  };
  statusEl.className = `status ${status || 'muted'}`;
  statusEl.innerHTML = `${labelMap[status] || status}<div class="reason">${(reason || '').replace(/[<>&]/g, '')}</div>`;
}

// ------- Blocklist -------
async function loadBlocklist() {
  const ul = $('blocklist');
  const empty = $('blocklistEmpty');
  ul.innerHTML = '';

  const resp = await send('GET_BLOCKLIST');
  if (!resp?.ok || !resp.data?.ok) {
    empty.style.display = 'block';
    empty.textContent = 'Failed to load blocklist.';
    return;
  }

  const items = resp.data.items || [];
  if (items.length === 0) {
    empty.style.display = 'block';
    empty.textContent = 'No domains blocked yet.';
    return;
  }
  empty.style.display = 'none';

  for (const item of items) {
    const li = document.createElement('li');

    const span = document.createElement('span');
    span.className = 'domain';
    span.textContent = item.domain;

    const btn = document.createElement('button');
    btn.className = 'danger';
    btn.textContent = 'Remove';
    btn.addEventListener('click', () => removeDomain(item.domain));

    li.appendChild(span);
    li.appendChild(btn);
    ul.appendChild(li);
  }
}

async function addDomain() {
  const input = $('domainInput');
  const domain = (input.value || '').trim();
  if (!domain) return;

  const resp = await send('ADD_BLOCKLIST', { domain });
  if (!resp?.ok || !resp.data?.ok) {
    toast(resp?.data?.error || 'Failed to add domain');
    return;
  }
  input.value = '';
  toast(resp.data.alreadyExists ? 'Already blocked' : 'Added!');
  await loadBlocklist();
  await refreshCurrentTab();
}

async function removeDomain(domain) {
  const resp = await send('REMOVE_BLOCKLIST', { domain });
  if (!resp?.ok || !resp.data?.ok) {
    toast(resp?.data?.error || 'Failed to remove');
    return;
  }
  toast('Removed');
  await loadBlocklist();
  await refreshCurrentTab();
}

// ------- Content Analysis -------
function renderContentResult(data) {
  const el = $('contentResult');
  if (!data) {
    el.className = 'content-result pending';
    el.innerHTML = '<div class="cf-title">⏳ Waiting for content analysis…</div><div style="font-size:11px;opacity:.7;">Visit a page to trigger content check.</div>';
    return;
  }
  if (data.ok === false) {
    el.className = 'content-result pending';
    el.innerHTML = `<div class="cf-title">⚠️ Analysis unavailable</div><div style="font-size:11px;opacity:.7;">${(data.reason || '').replace(/[<>&]/g,'')}</div>`;
    return;
  }
  if (data.clean) {
    el.className = 'content-result clean';
    el.innerHTML = '<div class="cf-title">✅ Content looks clean</div><div style="font-size:11px;opacity:.8;">No toxic or harmful content detected.</div>';
    return;
  }

  const flags = data.flags || [];
  const scores = data.scores || {};
  el.className = 'content-result flagged';

  const topPct = data.topScore ? ` — ${(data.topScore * 100).toFixed(0)}% confidence` : '';
  const flagBadges = flags.map(f => {
    const pct = scores[f] ? ` ${(scores[f] * 100).toFixed(0)}%` : '';
    return `<span class="content-flag">${f}${pct}</span>`;
  }).join('');

  el.innerHTML =
    `<div class="cf-title">⚠️ Content flagged</div>` +
    `<div style="font-size:11px;opacity:.85;">Top: <strong>${data.topFlag}</strong>${topPct}</div>` +
    `<div class="content-flags">${flagBadges}</div>`;
}

async function loadContentResult() {
  const resp = await send('GET_CONTENT_RESULT');
  if (resp?.data) {
    renderContentResult(resp.data);
  } else {
    // Result may not be ready yet (content script still running) — retry once
    renderContentResult(null);
    setTimeout(async () => {
      const resp2 = await send('GET_CONTENT_RESULT');
      renderContentResult(resp2?.data || null);
    }, 2500);
  }
}

// ------- Logs -------
function timeAgo(ts) {
  const mins = Math.floor((Date.now() - new Date(ts)) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

async function loadLogs() {
  const ul = $('logsList');
  const empty = $('logsEmpty');
  ul.innerHTML = '';

  const resp = await send('GET_LOGS');
  if (!resp?.ok || !resp.data?.ok) {
    empty.style.display = 'block';
    empty.textContent = 'Failed to load logs.';
    return;
  }

  const items = (resp.data.items || []).slice(0, 15);
  if (items.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  const icons = { safe: '✅', blocked: '⛔', phishing: '🚨', error: '⚠️', warn: '⚠️' };
  for (const item of items) {
    const li = document.createElement('li');
    li.className = 'log-entry';

    const icon = document.createElement('span');
    icon.className = 'log-icon';
    icon.textContent = icons[item.status] || '•';

    const domain = document.createElement('span');
    domain.className = 'log-domain';
    domain.textContent = item.domain;
    domain.title = item.url;

    const time = document.createElement('span');
    time.className = 'log-time';
    time.textContent = timeAgo(item.timestamp);

    li.appendChild(icon);
    li.appendChild(domain);
    li.appendChild(time);
    ul.appendChild(li);
  }
}

// ------- Init -------
document.addEventListener('DOMContentLoaded', async () => {
  $('addBtn').addEventListener('click', addDomain);
  $('domainInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addDomain();
  });
  await Promise.all([refreshCurrentTab(), loadBlocklist(), loadLogs(), loadContentResult()]);
});
