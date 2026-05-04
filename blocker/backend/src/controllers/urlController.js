// backend/src/controllers/urlController.js
// Main decision flow for /api/check-url:
//   1. Validate URL
//   2. Check blocklist  -> if blocked, log + return BLOCKED
//   3. Otherwise call AI -> return safe/phishing
//   4. Always log the result
//   5. On AI error -> fail-safe "allow but warn"

const { isValidUrl, extractDomain } = require('../utils/urlUtils');
const blocklistService = require('../services/blocklistService');
const logService = require('../services/logService');
const aiService = require('../services/aiService');

async function checkUrl(req, res) {
  const { url } = req.body || {};

  if (!isValidUrl(url)) {
    return res.status(400).json({
      ok: false,
      status: 'error',
      reason: 'Invalid URL. Must be a valid http(s) URL.'
    });
  }

  const domain = extractDomain(url);
  if (!domain) {
    return res.status(400).json({
      ok: false,
      status: 'error',
      reason: 'Could not extract domain from URL.'
    });
  }

  try {
    // Step 1: blocklist check
    const blocked = await blocklistService.isDomainBlocked(domain);
    if (blocked) {
      const reason = `Domain "${domain}" is in your blocklist.`;
      await logService.logUrlCheck({ url, domain, status: 'blocked', reason });
      return res.json({
        ok: true,
        status: 'blocked',
        domain,
        reason,
        confidence: 1
      });
    }

    // Step 2: AI classification
    const ai = await aiService.classifyUrl(url);

    if (ai.status === 'error') {
      // Fail-safe: allow but warn
      const reason = `AI unavailable: ${ai.reason}`;
      await logService.logUrlCheck({
        url,
        domain,
        status: 'error',
        reason,
        confidence: 0
      });
      return res.json({
        ok: true,
        status: 'warn',
        domain,
        reason: 'Could not verify with AI, proceed with caution.',
        confidence: 0
      });
    }

    // Step 3: log + return
    await logService.logUrlCheck({
      url,
      domain,
      status: ai.status,           // 'safe' or 'phishing'
      reason: ai.reason,
      confidence: ai.confidence
    });

    return res.json({
      ok: true,
      status: ai.status,
      domain,
      reason: ai.reason,
      confidence: ai.confidence
    });
  } catch (err) {
    console.error('[urlController.checkUrl]', err);
    return res.status(500).json({
      ok: false,
      status: 'error',
      reason: 'Internal server error.'
    });
  }
}

module.exports = { checkUrl };
