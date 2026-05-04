// backend/src/middleware/errorHandler.js

function notFound(req, res, next) {
  res.status(404).json({ ok: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[errorHandler]', err);
  res.status(err.status || 500).json({
    ok: false,
    error: err.message || 'Internal server error'
  });
}

module.exports = { notFound, errorHandler };
