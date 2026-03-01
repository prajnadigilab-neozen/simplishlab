const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');

// All payment routes require authentication
router.use(authMiddleware);

router.post('/create-order', paymentController.createOrder);
router.post('/verify-payment', paymentController.verifyPayment);
router.get('/history', paymentController.getPaymentHistory);

module.exports = router;
