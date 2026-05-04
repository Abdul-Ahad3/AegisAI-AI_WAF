// backend/src/routes/urlRoutes.js
const express = require('express');
const { checkUrl } = require('../controllers/urlController');

const router = express.Router();

// POST /api/check-url   { url: "https://..." }
router.post('/check-url', checkUrl);

module.exports = router;
