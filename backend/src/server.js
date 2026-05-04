// backend/src/server.js
// Express entry point for the AegisAI backend.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const urlRoutes = require('./routes/urlRoutes');
const blocklistRoutes = require('./routes/blocklistRoutes');
const logRoutes = require('./routes/logRoutes');
const contentRoutes = require('./routes/contentRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Security middleware ----
app.use(helmet());

// CORS - allow chrome-extension://* origins. In dev we allow * for simplicity.
const allowed = (process.env.ALLOWED_ORIGINS || '*').split(',').map(s => s.trim());
app.use(
  cors({
    origin: (origin, cb) => {
      // Requests from Chrome extensions sometimes have no Origin header
      if (!origin) return cb(null, true);
      if (allowed.includes('*') || allowed.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin ${origin}`));
    }
  })
);

app.use(express.json({ limit: '64kb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limit: 120 req/min/IP - protects against extension misbehavior
app.use(
  '/api/',
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false
  })
);

// ---- Routes ----
app.get('/', (req, res) => {
  res.json({
    ok: true,
    service: 'AegisAI Backend',
    version: '1.0.0',
    endpoints: [
      'POST /api/check-url',
      'GET  /api/blocklist',
      'POST /api/blocklist',
      'DELETE /api/blocklist/:domain',
      'GET  /api/logs?limit=100'
    ]
  });
});

app.get('/health', (req, res) => res.json({ ok: true, status: 'healthy' }));

app.use('/api', urlRoutes);
app.use('/api', contentRoutes);
app.use('/api/blocklist', blocklistRoutes);
app.use('/api/logs', logRoutes);

// ---- 404 + error handler ----
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ AegisAI backend running on http://localhost:${PORT}`);
});
