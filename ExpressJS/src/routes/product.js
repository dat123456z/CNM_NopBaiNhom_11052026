const express = require('express');

const router = express.Router();
const { authMiddleware, vendorMiddleware, requireRole } = require('../middleware/auth');

const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    setProductStatus,
    getSimilarProducts,
    getManagerProducts
} = require('../controllers/productController');

router.get('/manager/queue', authMiddleware, requireRole('manager', 'admin'), getManagerProducts);

router.get('/', getProducts);
router.get('/:id/similar', getSimilarProducts);
router.get('/:id', getProductById);

router.post('/', authMiddleware, vendorMiddleware, createProduct);

router.put('/:id', authMiddleware, vendorMiddleware, updateProduct);

router.delete('/:id', authMiddleware, vendorMiddleware, deleteProduct);

router.patch('/:id/status', authMiddleware, vendorMiddleware, setProductStatus);
router.patch('/:id/moderation', authMiddleware, requireRole('manager', 'admin'), setProductStatus);

module.exports = router;