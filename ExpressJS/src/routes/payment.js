const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { createVNPayPayment, handleVNPayReturn } = require('../controllers/paymentController');

router.post('/vnpay/create', authMiddleware, createVNPayPayment);
router.get('/vnpay/return', handleVNPayReturn);

module.exports = router;
