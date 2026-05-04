// backend/src/routes/contentRoutes.js
const express = require('express');
const { checkContent } = require('../controllers/contentController');

const router = express.Router();

// POST /api/check-content  { url, text }
router.post('/check-content', checkContent);

module.exports = router;
