const orderService = require('../services/orderService');

const createOrder = async (req, res) => {
    try {
        const orders = await orderService.createOrder(req.user.id, req.body);
        return res.status(201).json(orders);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const confirmOrder = async (req, res) => {
    try {
        const order = await orderService.confirmOrder(req.params.id, req.shop.id);
        return res.json(order);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const result = await orderService.getMyOrders(req.user.id, req.query);
        return res.json(result);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const getOrderDetail = async (req, res) => {
    try {
        const order = await orderService.getOrderDetail(req.params.id, req.user.id, req.user.role);
        return res.json(order);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const order = await orderService.cancelOrder(req.params.id, req.user.id, req.body.reason);
        return res.json(order);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const order = await orderService.updateOrderStatus(req.params.id, req.shop.id, req.body.status);
        return res.json(order);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const getShopOrders = async (req, res) => {
    try {
        const result = await orderService.getShopOrders(req.shop.id, req.query);
        return res.json(result);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const checkCoupon = async (req, res) => {
    try {
        const result = await orderService.checkCoupon(req.user.id, req.body);
        return res.json(result);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

module.exports = { createOrder, confirmOrder, getMyOrders, getOrderDetail, cancelOrder, updateOrderStatus, getShopOrders, checkCoupon };