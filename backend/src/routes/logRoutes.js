// backend/src/routes/logRoutes.js
const express = require('express');
const { getLogs } = require('../controllers/logController');

const router = express.Router();

router.get('/', getLogs); // GET /api/logs?limit=100

module.exports = router;
