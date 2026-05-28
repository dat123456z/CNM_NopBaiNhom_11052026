const express = require('express');
const router = express.Router();
const { authMiddleware, vendorMiddleware } = require('../middleware/auth');
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
router.get('/shop', authMiddleware, vendorMiddleware, getShopOrders);
router.get('/:id', authMiddleware, getOrderDetail);
router.post('/:id/confirm', authMiddleware, vendorMiddleware, confirmOrder);
router.patch('/:id/cancel', authMiddleware, cancelOrder);
router.patch('/:id/status', authMiddleware, vendorMiddleware, updateOrderStatus);

module.exports = router;