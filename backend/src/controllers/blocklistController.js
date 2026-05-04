// backend/src/controllers/blocklistController.js

const { normalizeDomain } = require('../utils/urlUtils');
const blocklistService = require('../services/blocklistService');

async function getBlocklist(req, res) {
  try {
    const list = await blocklistService.listBlocked();
    return res.json({ ok: true, count: list.length, items: list });
  } catch (err) {
    console.error('[blocklistController.getBlocklist]', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

async function addBlocklist(req, res) {
  const raw = req.body?.domain;
  const domain = normalizeDomain(raw);
  if (!domain) {
    return res.status(400).json({
      ok: false,
      error: 'Invalid domain. Use a format like "example.com".'
    });
  }

  try {
    const result = await blocklistService.addToBlocklist(domain);
    return res.json({
      ok: true,
      alreadyExists: !!result.alreadyExists,
      item: result
    });
  } catch (err) {
    console.error('[blocklistController.addBlocklist]', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

async function removeBlocklist(req, res) {
  const raw = req.params.domain || req.body?.domain;
  const domain = normalizeDomain(raw);
  if (!domain) {
    return res.status(400).json({ ok: false, error: 'Invalid domain.' });
  }

  try {
    const result = await blocklistService.removeFromBlocklist(domain);
    return res.json({ ok: true, removed: result.removed, domain });
  } catch (err) {
    console.error('[blocklistController.removeBlocklist]', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

module.exports = { getBlocklist, addBlocklist, removeBlocklist };
