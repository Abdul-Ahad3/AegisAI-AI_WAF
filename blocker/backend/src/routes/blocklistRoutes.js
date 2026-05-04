// backend/src/routes/blocklistRoutes.js
const express = require('express');
const {
  getBlocklist,
  addBlocklist,
  removeBlocklist
} = require('../controllers/blocklistController');

const router = express.Router();

router.get('/', getBlocklist);                    // GET    /api/blocklist
router.post('/', addBlocklist);                   // POST   /api/blocklist  { domain }
router.delete('/:domain', removeBlocklist);       // DELETE /api/blocklist/:domain

module.exports = router;
