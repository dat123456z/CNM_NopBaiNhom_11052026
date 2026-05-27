const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
    createOrder,
    confirmOrder,
    getMyOrders,
    getOrderDetail,
    cancelOrder,
    updateOrderStatus,
    getShopOrders,
    checkCoupon
} = require('../controllers/orderController');

router.post('/', authMiddleware, createOrder);
router.post('/check-coupon', authMiddleware, checkCoupon);
router.get('/me', authMiddleware, getMyOrders);
router.get('/shop', authMiddleware, getShopOrders);
router.get('/:id', authMiddleware, getOrderDetail);
router.post('/:id/confirm', authMiddleware, confirmOrder);
router.patch('/:id/cancel', authMiddleware, cancelOrder);
router.patch('/:id/status', authMiddleware, updateOrderStatus);

module.exports = router;