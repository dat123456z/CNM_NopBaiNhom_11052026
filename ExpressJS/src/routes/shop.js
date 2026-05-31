const express = require('express');
const multer = require('multer');
const path = require('path');

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

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `shop_${req.user.id}_${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Chỉ chấp nhận file ảnh.'));
        }
        cb(null, true);
    }
});

router.post('/', authMiddleware, upload.single('logo'), registerShop);

router.get('/manager/stats', authMiddleware, requireRole('manager', 'admin'), getManagerStats);

router.get('/', listShops);

router.get('/me', authMiddleware, getMyShop);

router.put('/me', authMiddleware, upload.single('logo'), updateShop);

router.get('/:id', getShopById);

router.patch('/:id/status', authMiddleware, requireRole('manager', 'admin'), setShopStatus);

module.exports = router;