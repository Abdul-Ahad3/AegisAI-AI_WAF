// backend/src/services/blocklistService.js
// All database operations for the `blocklist` table.

const supabase = require('../../config/supabase');

async function isDomainBlocked(domain) {
  if (!domain) return false;
  const { data, error } = await supabase
    .from('blocklist')
    .select('id')
    .eq('domain', domain)
    .limit(1);

  if (error) {
    console.error('[blocklistService.isDomainBlocked]', error.message);
    return false; // fail-safe: don't block on DB error
  }
  return Array.isArray(data) && data.length > 0;
}

async function listBlocked() {
  const { data, error } = await supabase
    .from('blocklist')
    .select('id, domain, created_at')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

async function addToBlocklist(domain) {
  const { data, error } = await supabase
    .from('blocklist')
    .insert({ domain })
    .select()
    .single();

  if (error) {
    // unique constraint -> already in list
    if (error.code === '23505') {
      return { alreadyExists: true, domain };
    }
    throw new Error(error.message);
  }
  return data;
}

async function removeFromBlocklist(domain) {
  const { error, count } = await supabase
    .from('blocklist')
    .delete({ count: 'exact' })
    .eq('domain', domain);

  if (error) throw new Error(error.message);
  return { removed: count || 0 };
}

module.exports = {
  isDomainBlocked,
  listBlocked,
  addToBlocklist,
  removeFromBlocklist
};
