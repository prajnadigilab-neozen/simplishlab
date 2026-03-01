const express = require('express');
const router = express.Router();
const placementController = require('../controllers/placementController');
const authMiddleware = require('../middleware/auth');

// Public: any user can fetch placement questions (no auth needed to take the test)
router.get('/questions', placementController.getQuestions);
router.get('/leaderboard', authMiddleware, placementController.getLeaderboard);
router.post('/submit', authMiddleware, placementController.submitTest);

module.exports = router;
