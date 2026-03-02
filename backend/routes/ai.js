const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const aiController = require('../controllers/aiController');

// AI Chat: requires auth so random callers can't drain API quota
router.post('/chat', authMiddleware, aiController.chat);

// AI Lesson Generation: Requires Admin/Super Admin role
router.post('/generate-lesson', authMiddleware, aiController.generateLessonContent);

module.exports = router;
