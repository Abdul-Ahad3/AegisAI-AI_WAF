// extension/scripts/config.js
// Single place to change the backend URL.
// When you deploy the backend, replace this with your production URL.
//
// This file is loaded with importScripts() from the service worker
// and as a regular <script> from the popup.

const AEGIS_CONFIG = {
  // Local dev backend
  API_BASE: 'http://localhost:5000',

  // Endpoints
  CHECK_URL: '/api/check-url',
  CHECK_CONTENT: '/api/check-content',
  BLOCKLIST: '/api/blocklist',
  LOGS: '/api/logs',

  // Cache results for this many ms to avoid hammering the backend
  CACHE_TTL_MS: 60 * 1000,

  // Don't intercept extension/internal pages
  IGNORED_SCHEMES: ['chrome:', 'chrome-extension:', 'edge:', 'about:', 'file:', 'devtools:']
};

// Make available in service-worker (importScripts) and window scopes
if (typeof self !== 'undefined') self.AEGIS_CONFIG = AEGIS_CONFIG;
if (typeof window !== 'undefined') window.AEGIS_CONFIG = AEGIS_CONFIG;
