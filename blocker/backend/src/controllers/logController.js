// backend/src/controllers/logController.js
const logService = require('../services/logService');

async function getLogs(req, res) {
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
  try {
    const logs = await logService.getRecentLogs(limit);
    return res.json({ ok: true, count: logs.length, items: logs });
  } catch (err) {
    console.error('[logController.getLogs]', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

module.exports = { getLogs };
