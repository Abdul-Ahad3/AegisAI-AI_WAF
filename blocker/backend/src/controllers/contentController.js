// backend/src/controllers/contentController.js
// POST /api/check-content  { url, text }
// Classifies the visible page text for toxic content.

const { isValidUrl } = require('../utils/urlUtils');
const { classifyContent } = require('../services/contentService');

async function checkContent(req, res) {
  const { url, text } = req.body || {};

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ ok: false, reason: 'Invalid or missing URL.' });
  }

  if (!text || typeof text !== 'string' || text.trim().length < 5) {
    return res.status(400).json({ ok: false, reason: 'No usable text provided.' });
  }

  try {
    const result = await classifyContent(text);
    return res.json({ ok: true, url, ...result });
  } catch (err) {
    console.error('[contentController.checkContent]', err);
    return res.status(500).json({ ok: false, reason: 'Internal server error.' });
  }
}

module.exports = { checkContent };
