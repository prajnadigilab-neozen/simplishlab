const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/auth');

// Custom middleware to allow Super Admin OR Moderator
const isStaff = (req, res, next) => {
    const role = req.user?.role?.toLowerCase();
    if (role === 'super_admin' || role === 'moderator' || role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Forbidden: Access restricted to Staff (Admin/Moderator)' });
};

router.get('/summary', authMiddleware, isStaff, reportController.getSummaryMetrics);
router.get('/activity', authMiddleware, isStaff, reportController.getActivityDetails);

module.exports = router;
