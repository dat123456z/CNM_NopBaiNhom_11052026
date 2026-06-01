const express = require('express');
const router = express.Router();
const { authMiddleware, vendorMiddleware } = require('../middleware/auth');
const revenueService = require('../services/revenueService');
const Shop = require('../models/Shop');

router.get('/shop', authMiddleware, vendorMiddleware, async (req, res) => {
    try {
        const shop = await Shop.findOne({ where: { userId: req.user.id } });
        if (!shop) return res.status(404).json({ message: 'Shop không tồn tại.' });

        const period = ['7d', '30d', '12m'].includes(req.query.period)
            ? req.query.period
            : '12m';

        const data = await revenueService.getShopAnalytics(shop.id, period);
        res.json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
});

router.get('/wallet-history', authMiddleware, vendorMiddleware, async (req, res) => {
    try {
        const shop = await Shop.findOne({ where: { userId: req.user.id } });
        if (!shop) return res.status(404).json({ message: 'Shop không tồn tại.' });

        const data = await revenueService.getWalletHistory(shop.id, {
            page: req.query.page || 1,
            limit: req.query.limit || 20
        });
        res.json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
});

router.post('/withdraw', authMiddleware, vendorMiddleware, async (req, res) => {
    try {
        const shop = await Shop.findOne({ where: { userId: req.user.id } });
        if (!shop) return res.status(404).json({ message: 'Shop không tồn tại.' });

        const { amount } = req.body;
        const data = await revenueService.withdraw(shop.id, Number(amount));
        res.json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
});

module.exports = router;