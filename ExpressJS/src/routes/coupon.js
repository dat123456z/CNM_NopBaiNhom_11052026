const express = require('express');

const router = express.Router();
const { authMiddleware, vendorMiddleware } = require('../middleware/auth');
const {
    listUserCoupons,
    listShopCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon
} = require('../controllers/couponController');

router.get('/', authMiddleware, listUserCoupons);
router.get('/shop', authMiddleware, vendorMiddleware, listShopCoupons);
router.post('/', authMiddleware, vendorMiddleware, createCoupon);
router.put('/:id', authMiddleware, vendorMiddleware, updateCoupon);
router.delete('/:id', authMiddleware, vendorMiddleware, deleteCoupon);

module.exports = router;
