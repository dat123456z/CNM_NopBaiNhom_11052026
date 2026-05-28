const shopService = require('../services/shopService');

const registerShop = async (req, res) => {
    try {
        const shop = await shopService.registerShop(req.user.id, req.body);
        return res.status(201).json(shop);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const getMyShop = async (req, res) => {
    try {
        const shop = await shopService.getMyShop(req.user.id);
        return res.json(shop);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const updateShop = async (req, res) => {
    try {
        const shop = await shopService.updateShop(req.user.id, req.body);
        return res.json(shop);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const getShopById = async (req, res) => {
    try {
        const shop = await shopService.getShopById(req.params.id);
        return res.json(shop);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const listShops = async (req, res) => {
    try {
        const result = await shopService.listShops(req.query);
        return res.json(result);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const setShopStatus = async (req, res) => {
    try {
        const shop = await shopService.setShopStatus(req.params.id, req.body.status);
        return res.json(shop);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const getManagerStats = async (req, res) => {
    try {
        const stats = await shopService.getManagerStats();
        return res.json(stats);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

module.exports = { registerShop, getMyShop, updateShop, getShopById, listShops, setShopStatus, getManagerStats };