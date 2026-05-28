const revenueService = require('../services/revenueService');

const getShopRevenue = async (req, res) => {
    try {
        const result = await revenueService.getShopRevenue(req.shop.id, req.query);
        return res.json(result);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const getWalletHistory = async (req, res) => {
    try {
        const result = await revenueService.getWalletHistory(req.shop.id, req.query);
        return res.json(result);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const getPlatformRevenue = async (req, res) => {
    try {
        const result = await revenueService.getPlatformRevenue(req.query);
        return res.json(result);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const requestWithdraw = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ message: 'Số tiền rút không hợp lệ.' });
        }
        const result = await revenueService.requestWithdrawal(req.shop.id, Number(amount));
        return res.json(result);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

module.exports = { getShopRevenue, getWalletHistory, getPlatformRevenue, requestWithdraw };