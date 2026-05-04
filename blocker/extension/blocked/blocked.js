// extension/blocked/blocked.js
(function () {
  const params = new URLSearchParams(location.search);
  const url = params.get('url') || '';
  const status = params.get('status') || 'blocked';
  const reason = params.get('reason') || 'No reason provided.';

  const titles = {
    blocked:  'This site has been blocked',
    phishing: '🚨 Phishing site detected',
    malicious:'🚨 Malicious site detected'
  };
  const badges = {
    blocked:  '⛔ Blocked',
    phishing: '🚨 Phishing',
    malicious:'🚨 Malicious'
  };

  document.getElementById('title').textContent  = titles[status]  || titles.blocked;
  document.getElementById('badge').textContent  = badges[status]  || badges.blocked;
  document.getElementById('reason').textContent = reason;
  document.getElementById('url').textContent    = url || '—';

  document.getElementById('back').addEventListener('click', () => {
    if (history.length > 1) history.back();
    else chrome.tabs.create({});
  });
  document.getElementById('newtab').addEventListener('click', () => {
    chrome.tabs.create({});
  });
})();
