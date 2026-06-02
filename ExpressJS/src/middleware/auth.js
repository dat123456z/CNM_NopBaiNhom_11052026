const jwt = require('jsonwebtoken');
const Shop = require('../models/Shop');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return res.status(401).json({ message: 'Không có token xác thực.' });

    const token = authHeader.split(' ')[1];
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        next();
    } catch {
        return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
};

const requireRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user?.role))
        return res.status(403).json({ message: 'Không có quyền truy cập.' });
    next();
};

const vendorMiddleware = async (req, res, next) => {
    try {
        const shop = await Shop.findOne({ where: { userId: req.user.id } });
        if (!shop) {
            return res.status(403).json({ message: 'Bạn không có cửa hàng.' });
        }
        if (shop.status !== 'active') {
            return res.status(403).json({
                message: 'Shop is not active. Please contact manager for support.',
                shopStatus: shop.status
            });
        }
        req.shop = shop;
        next();
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = { authMiddleware, requireRole, vendorMiddleware };
