// backend/src/services/logService.js
// All database operations for the `url_logs` table.

const supabase = require('../../config/supabase');

async function logUrlCheck({ url, domain, status, reason, confidence }) {
  const payload = {
    url,
    domain,
    status,
    reason: reason || null,
    confidence: typeof confidence === 'number' ? confidence : null
  };

  const { error } = await supabase.from('url_logs').insert(payload);
  if (error) {
    // Logging failures should never break the main flow
    console.error('[logService.logUrlCheck]', error.message);
  }
}

async function getRecentLogs(limit = 100) {
  const { data, error } = await supabase
    .from('url_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data || [];
}

module.exports = { logUrlCheck, getRecentLogs };
