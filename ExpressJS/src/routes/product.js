const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();
const { authMiddleware, vendorMiddleware, requireRole } = require('../middleware/auth');

const {
    getProducts,
    getShopProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    setProductStatus,
    getSimilarProducts,
    getManagerProducts
} = require('../controllers/productController');

// Multer storage for product images
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `product_${req.user.id}_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit per file
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Chỉ chấp nhận file ảnh.'));
        }
        cb(null, true);
    }
});

router.get('/manager/queue', authMiddleware, requireRole('manager', 'admin'), getManagerProducts);
router.get('/shop', authMiddleware, vendorMiddleware, getShopProducts);

router.get('/', getProducts);
router.get('/:id/similar', getSimilarProducts);
router.get('/:id', getProductById);

router.post('/', authMiddleware, vendorMiddleware, upload.array('images', 10), createProduct);

router.put('/:id', authMiddleware, vendorMiddleware, upload.array('images', 10), updateProduct);

router.delete('/:id', authMiddleware, vendorMiddleware, deleteProduct);

router.patch('/:id/status', authMiddleware, vendorMiddleware, setProductStatus);
router.patch('/:id/moderation', authMiddleware, requireRole('manager'), setProductStatus);

module.exports = router;
