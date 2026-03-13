const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const assessmentController = require('../controllers/assessmentController');
const authMiddleware = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

router.get('/lesson/:lessonId', assessmentController.getAssessmentByLesson);
router.post('/lesson/:lessonId/questions', authMiddleware, isAdmin, assessmentController.upsertAssessment);
router.post('/submit', authMiddleware, upload.any(), assessmentController.submitAssessment);
const validateFile = require('../middleware/validateFile');

router.post('/process-media', authMiddleware, upload.single('media'), validateFile, assessmentController.processMedia);

module.exports = router;
