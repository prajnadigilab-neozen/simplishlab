const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const aiController = require('../controllers/aiController');

// AI Chat: requires auth so random callers can't drain API quota
router.post('/chat', authMiddleware, aiController.chat);

module.exports = router;
