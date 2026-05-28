const express = require('express');

const router = express.Router();
const { authMiddleware, vendorMiddleware } = require('../middleware/auth');

const {
    getShopRevenue,
    getWalletHistory,
    getPlatformRevenue,
    requestWithdraw
} = require('../controllers/revenueController');

router.get('/shop', authMiddleware, vendorMiddleware, getShopRevenue);
router.get('/wallet-history', authMiddleware, vendorMiddleware, getWalletHistory);
router.get('/platform', authMiddleware, getPlatformRevenue);
router.post('/withdraw', authMiddleware, vendorMiddleware, requestWithdraw);

module.exports = router;