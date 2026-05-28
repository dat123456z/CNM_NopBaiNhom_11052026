const express = require('express');

const router = express.Router();

const { authMiddleware, requireRole } = require('../middleware/auth');

const {
    registerShop,
    getMyShop,
    updateShop,
    getShopById,
    listShops,
    setShopStatus,
    getManagerStats
} = require('../controllers/shopController');

router.post('/', authMiddleware, registerShop);

router.get('/manager/stats', authMiddleware, requireRole('manager', 'admin'), getManagerStats);

router.get('/', listShops);

router.get('/me', authMiddleware, getMyShop);

router.put('/me', authMiddleware, updateShop);

router.get('/:id', getShopById);

router.patch('/:id/status', authMiddleware, requireRole('manager', 'admin'), setShopStatus);

module.exports = router;