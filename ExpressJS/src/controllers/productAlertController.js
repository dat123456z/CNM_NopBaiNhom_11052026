const productAlertService = require('../services/productAlertService');

const getAlert = async (req, res) => {
    try {
        const result = await productAlertService.getAlert(req.user.id, req.params.productId);
        return res.json(result);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const updateAlert = async (req, res) => {
    try {
        const result = await productAlertService.updateAlert(
            req.user.id,
            req.params.productId,
            req.body
        );
        return res.json(result);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

module.exports = { getAlert, updateAlert };
