const shipperService = require('../services/shipperService');

const getShippers = async (req, res) => {
    try {
        const shippers = await shipperService.getShippers(req.shop.id);
        return res.json(shippers);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const createShipper = async (req, res) => {
    try {
        const shipper = await shipperService.createShipper(req.shop.id, req.body);
        return res.status(201).json(shipper);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const updateShipper = async (req, res) => {
    try {
        const shipper = await shipperService.updateShipper(req.params.id, req.shop.id, req.body);
        return res.json(shipper);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const deleteShipper = async (req, res) => {
    try {
        const result = await shipperService.deleteShipper(req.params.id, req.shop.id);
        return res.json(result);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const getShipperOrders = async (req, res) => {
    try {
        const orders = await shipperService.getShipperOrders(req.params.id, req.shop.id);
        return res.json(orders);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

module.exports = {
    getShippers,
    createShipper,
    updateShipper,
    deleteShipper,
    getShipperOrders
};
