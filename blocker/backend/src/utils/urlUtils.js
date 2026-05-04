// backend/src/utils/urlUtils.js
// Small helpers for URL validation + domain normalization.

const validator = require('validator');

/**
 * Validate that a string is a proper http/https URL.
 */
function isValidUrl(url) {
  if (typeof url !== 'string' || url.length === 0 || url.length > 2048) return false;
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true
  });
}

/**
 * Extract a normalized lowercase hostname from a URL.
 * Strips a leading "www." so example.com and www.example.com match the same blocklist row.
 */
function extractDomain(url) {
  try {
    const u = new URL(url);
    let host = u.hostname.toLowerCase();
    if (host.startsWith('www.')) host = host.slice(4);
    return host;
  } catch (e) {
    return null;
  }
}

/**
 * Normalize a domain string the user typed into the popup.
 * Accepts "https://www.foo.com/x", "www.foo.com", "foo.com" and returns "foo.com".
 */
function normalizeDomain(input) {
  if (typeof input !== 'string') return null;
  let s = input.trim().toLowerCase();
  if (!s) return null;

  // If they typed a full URL, extract the host
  if (s.startsWith('http://') || s.startsWith('https://')) {
    const d = extractDomain(s);
    return d;
  }

  // Strip path / query if any
  s = s.split('/')[0].split('?')[0];
  if (s.startsWith('www.')) s = s.slice(4);

  // Basic domain regex
  const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/;
  if (!domainRegex.test(s)) return null;
  return s;
}

module.exports = { isValidUrl, extractDomain, normalizeDomain };
